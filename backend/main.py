from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import uvicorn
import shutil
import os
import json
import uuid
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import BOTH AI Engines
from ai_engine import predict_category, get_embedding, find_best_match # NLP
from image_engine import analyze_image # Vision

# Import Blockchain Service
from blockchain_service import (
    create_waste_batch, 
    commit_to_purchase, 
    transfer_waste_batch,
    get_batch_status,
    get_blockchain_status
)

app = FastAPI(title="WasteExchange Logic Hub", version="Final")

# ✅ CORS Configuration - Allow frontend to call backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 1. CONFIGURATION ---
# Get Supabase credentials from environment variables
SUPABASE_URL = os.getenv("SUPABASE_URL", "").strip()
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "").strip()

# Initialize Supabase
supabase = None
use_supabase = False

if SUPABASE_URL and SUPABASE_KEY:
    try:
        from supabase import create_client, Client
        # Ensure URL is correct format (https://project.supabase.co)
        if not SUPABASE_URL.startswith("http"):
            SUPABASE_URL = f"https://{SUPABASE_URL}"
        if SUPABASE_URL.endswith("/"):
            SUPABASE_URL = SUPABASE_URL.rstrip("/")
            
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        use_supabase = True
        print(f"✅ Supabase Connected: {SUPABASE_URL}")
    except Exception as e:
        print(f"⚠️ Supabase connection failed: {e}")
        print("   Using in-memory storage as fallback")
else:
    print("⚠️ Supabase credentials not found. Using in-memory storage.")
    print("   To use Supabase, set SUPABASE_URL and SUPABASE_KEY in .env")

# Local in-memory storage for fallback
listings_db: Dict[str, Any] = {}
buyers_db: Dict[str, Any] = {}
users_db: Dict[str, Any] = {}
transactions_db: Dict[str, Any] = {}

# --- 3. PYDANTIC MODELS ---
class WasteAnalysisRequest(BaseModel):
    description: str
    quantity: float
    hazard: str = "None"
    location: str

class WasteAnalysisResponse(BaseModel):
    category: str
    buyer: str
    revenue: float
    savings: float
    co2: float
    landfill: float

# Authentication Models
class UserRegisterRequest(BaseModel):
    email: str
    password: str
    company_name: Optional[str] = None
    wallet_address: Optional[str] = None

class UserLoginRequest(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    company_name: Optional[str] = None
    wallet_address: Optional[str] = None
    created_at: Optional[str] = None

class AuthResponse(BaseModel):
    success: bool
    user: Optional[UserResponse] = None
    token: Optional[str] = None
    message: Optional[str] = None

# Blockchain Models
class BlockchainBatchRequest(BaseModel):
    category: str
    quantity: int
    seller_address: str

class BlockchainTransactionRequest(BaseModel):
    batch_id: int
    buyer_address: str
    seller_address: str

class BlockchainTransactionResponse(BaseModel):
    success: bool
    tx_hash: Optional[str] = None
    batch_id: Optional[int] = None
    error: Optional[str] = None

# --- 4. HEALTH CHECK ENDPOINT ---
@app.get("/api/health")
async def health_check():
    """Health check endpoint for verifying backend is running"""
    return {
        "status": "healthy",
        "service": "WasteExchange Logic Hub",
        "timestamp": datetime.now().isoformat()
    }

# --- 4A. AUTHENTICATION ENDPOINTS ---

@app.post("/api/auth/register")
async def register_user(request: UserRegisterRequest) -> AuthResponse:
    """Register a new user"""
    try:
        print(f"🔐 Registering user: {request.email}")
        
        # Check if user already exists
        if use_supabase and supabase:
            try:
                existing = supabase.table("users").select("*").eq("email", request.email).execute()
                if existing.data and len(existing.data) > 0:
                    return AuthResponse(
                        success=False,
                        message=f"Email {request.email} already registered"
                    )
            except Exception as e:
                print(f"⚠️ Could not check existing users: {e}")
        
        # Check in-memory
        for user in users_db.values():
            if user.get("email") == request.email:
                return AuthResponse(
                    success=False,
                    message=f"Email {request.email} already registered"
                )
        
        # Create new user
        user_id = str(uuid.uuid4())
        user_data = {
            "id": user_id,
            "email": request.email,
            "password": request.password,  # In production: hash this!
            "company_name": request.company_name,
            "wallet_address": request.wallet_address,
            "created_at": datetime.now().isoformat()
        }
        
        # Try to save to Supabase (bypass Auth API, insert directly to users table)
        if use_supabase and supabase:
            try:
                print(f"   → Inserting user directly to Supabase users table...")
                profile_data = {
                    "id": user_id,
                    "email": request.email,
                    "company_name": request.company_name,
                    "wallet_address": request.wallet_address,
                    "created_at": datetime.now().isoformat()
                }
                print(f"   → Data: {profile_data}")
                insert_response = supabase.table("users").insert(profile_data).execute()
                print(f"   ✅ User inserted to Supabase: {insert_response.data}")
                print(f"✅ User registered in Supabase: {user_id}")
            except Exception as e:
                print(f"⚠️ Supabase insert error: {e}")
                print(f"   Error type: {type(e).__name__}")
                print(f"   Full error: {str(e)}")
                # Continue with in-memory storage
        
        # Store in memory regardless
        users_db[user_id] = user_data
        print(f"📝 User stored in memory: {user_id}")
        
        # Generate simple token (in production: use JWT)
        token = f"token_{user_id}"
        
        return AuthResponse(
            success=True,
            user=UserResponse(
                id=user_id,
                email=request.email,
                company_name=request.company_name,
                wallet_address=request.wallet_address,
                created_at=user_data["created_at"]
            ),
            token=token
        )
    except Exception as e:
        print(f"❌ Registration error: {e}")
        return AuthResponse(success=False, message=str(e))


@app.post("/api/auth/login")
async def login_user(request: UserLoginRequest) -> AuthResponse:
    """Login user"""
    try:
        print(f"🔑 Login attempt: {request.email}")
        
        # Try Supabase first (check users table directly)
        if use_supabase and supabase:
            try:
                print(f"   → Checking Supabase users table...")
                user_response = supabase.table("users").select("*").eq("email", request.email).execute()
                if user_response.data and len(user_response.data) > 0:
                    user_data = user_response.data[0]
                    user_id = user_data.get("id")
                    print(f"   ✅ Found user in Supabase: {user_id}")
                    
                    token = f"token_{user_id}"
                    print(f"✅ User logged in (Supabase): {user_id}")
                    
                    return AuthResponse(
                        success=True,
                        user=UserResponse(
                            id=user_id,
                            email=user_data.get("email"),
                            company_name=user_data.get("company_name"),
                            wallet_address=user_data.get("wallet_address"),
                            created_at=user_data.get("created_at")
                        ),
                        token=token
                    )
                else:
                    print(f"   ⚠️ User not found in Supabase, checking memory...")
            except Exception as e:
                print(f"   ⚠️ Supabase lookup error: {e}")
                print(f"      Falling back to in-memory storage...")
        
        # Check in-memory storage
        for user_id, user_data in users_db.items():
            if user_data.get("email") == request.email and user_data.get("password") == request.password:
                token = f"token_{user_id}"
                print(f"✅ User logged in (memory): {user_id}")
                
                return AuthResponse(
                    success=True,
                    user=UserResponse(
                        id=user_id,
                        email=user_data.get("email"),
                        company_name=user_data.get("company_name"),
                        wallet_address=user_data.get("wallet_address"),
                        created_at=user_data.get("created_at")
                    ),
                    token=token
                )
        
        return AuthResponse(success=False, message="Invalid email or password")
    except Exception as e:
        print(f"❌ Login error: {e}")
        return AuthResponse(success=False, message=str(e))


@app.get("/api/auth/me")
async def get_current_user(token: str = None):
    """Get current logged-in user info"""
    try:
        if not token:
            return {"success": False, "message": "No token provided"}
        
        # Extract user_id from token (format: token_uuid)
        if token.startswith("token_"):
            user_id = token.replace("token_", "")
            
            # Check in-memory first
            if user_id in users_db:
                user_data = users_db[user_id]
                return {
                    "success": True,
                    "user": {
                        "id": user_id,
                        "email": user_data.get("email"),
                        "company_name": user_data.get("company_name"),
                        "wallet_address": user_data.get("wallet_address"),
                        "created_at": user_data.get("created_at")
                    }
                }
            
            # Check Supabase
            if use_supabase and supabase:
                try:
                    response = supabase.table("users").select("*").eq("id", user_id).execute()
                    if response.data:
                        user_data = response.data[0]
                        return {"success": True, "user": user_data}
                except:
                    pass
        
        return {"success": False, "message": "User not found"}
    except Exception as e:
        return {"success": False, "message": str(e)}


@app.post("/api/waste/analyze")
async def analyze_waste(request: WasteAnalysisRequest) -> WasteAnalysisResponse:
    """
    Analyze waste material (JSON-based, no image upload)
    Used by frontend for quick analysis
    """
    print(f"🚀 Analyzing Waste: {request.description}")
    
    # Combine text for analysis
    combined_context = f"{request.description} at {request.location} ({request.quantity}kg)"
    
    # Get category from NLP model
    category = predict_category(combined_context)
    
    # Get market price estimates (in production, query real DB)
    price_per_kg = {
        "Plastic": 0.42,
        "Metal": 1.50,
        "Paper": 0.15,
        "Organic": 0.10,
        "Chemical": 2.00,
        "Glass": 0.05,
        "Wood": 0.25,
        "Construction": 0.08,
        "Textile": 0.50,
        "Mineral": 0.03
    }.get(category, 0.50)
    
    total_revenue = request.quantity * price_per_kg
    
    # Estimate environmental impact
    # CO2 offset: ~2.5kg CO2 saved per kg of waste recycled
    co2_offset = (request.quantity * 2.5) / 1000  # Convert to metric tons
    
    # Landfill diversion: assume 85% can be recycled
    landfill_diversion = 85.0 if request.hazard != "High" else 50.0
    
    # Cost savings: typical landfill cost avoided is ~$0.15/kg
    landfill_cost_avoided = request.quantity * 0.15
    
    # Buyer type mapping
    buyer_types = {
        "Plastic": "Plastic Granulation and Pelletizing Facility",
        "Metal": "Metal Recycling and Smelting Facility",
        "Paper": "Paper Mill and Pulping Facility",
        "Organic": "Composting and Biogas Facility",
        "Chemical": "Industrial Chemical Recycling Center",
        "Glass": "Glass Manufacturer and Cullet Producer",
        "Wood": "Wood Reclamation and Lumber Mill",
        "Construction": "Aggregate Crushing and Construction Supply",
        "Textile": "Fiber Reclamation and Yarn Manufacturing",
        "Mineral": "Aggregate Processing Plant"
    }
    
    buyer = buyer_types.get(category, "Industrial Recycling Facility")
    
    return WasteAnalysisResponse(
        category=category,
        buyer=buyer,
        revenue=round(total_revenue, 2),
        savings=round(landfill_cost_avoided, 2),
        co2=round(co2_offset, 2),
        landfill=round(landfill_diversion, 1)
    )

# --- 6. MARKETPLACE ENDPOINTS ---

@app.get("/api/marketplace/listings")
async def get_listings():
    """Get all current waste listings from Supabase or fallback"""
    try:
        if use_supabase and supabase:
            # Get from Supabase
            response = supabase.table("waste_listings").select("*").execute()
            if response.data:
                return {
                    "status": "success",
                    "source": "supabase",
                    "listings": response.data
                }
            return {"status": "success", "source": "supabase", "listings": []}
        else:
            # Return from in-memory storage
            return {
                "status": "success",
                "source": "memory",
                "listings": list(listings_db.values())
            }
    except Exception as e:
        print(f"⚠️ Error fetching listings: {e}")
        return {
            "status": "success",
            "source": "memory",
            "listings": list(listings_db.values())
        }


@app.post("/api/marketplace/listing")
async def create_listing(
    user_id: str = Form(...),
    title: str = Form(...),
    description: str = Form(...),
    quantity_kg: float = Form(...),
    location: str = Form(...),
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),
    image: Optional[UploadFile] = File(None)
):
    """Create a new waste listing in Supabase or fallback"""
    try:
        print(f"🚀 Creating Listing: {title}")
        
        # Validate user exists in Supabase (if using Supabase)
        if use_supabase and supabase:
            try:
                user_response = supabase.table("users").select("*").eq("id", user_id).execute()
                if not user_response.data:
                    print(f"⚠️ User {user_id} not found in users table")
            except Exception as e:
                print(f"⚠️ Could not verify user: {e}")
        
        # Analyze the text for category
        combined_context = f"{title} {description}"
        category = predict_category(combined_context)
        
        # Get embedding vector
        try:
            embedding = get_embedding(combined_context)
        except Exception as e:
            print(f"⚠️ Error generating embedding: {e}")
            embedding = None
        
        listing_data = {
            "seller_id": user_id,
            "title": title,
            "description": description,
            "category": category,
            "quantity_kg": quantity_kg,
            "remaining_kg": quantity_kg,
            "location_lat": latitude,
            "location_long": longitude,
            "embedding": embedding,
            "status": "AVAILABLE",
            "price_per_kg": {
                "Plastic": 0.42,
                "Metal": 1.50,
                "Paper": 0.15,
                "Organic": 0.10,
                "Chemical": 2.00,
                "Glass": 0.05,
                "Wood": 0.25,
                "Construction": 0.08,
                "Textile": 0.50,
                "Mineral": 0.03
            }.get(category, 0.50)
        }
        
        # Try to save to Supabase
        listing_id = None
        if use_supabase and supabase:
            try:
                print(f"   → Attempting Supabase insert...")
                print(f"   → Data to insert: {listing_data}")
                response = supabase.table("waste_listings").insert(listing_data).execute()
                print(f"   ✅ Supabase response: {response}")
                if response.data and len(response.data) > 0:
                    listing_id = response.data[0].get("id")
                    print(f"✅ Listing created in Supabase: {listing_id}")
                else:
                    print(f"⚠️ No data returned from insert. Response: {response}")
            except Exception as e:
                print(f"⚠️ Supabase insert error: {e}")
                print(f"   Error type: {type(e).__name__}")
                print(f"   Full error: {str(e)}")
                # Try to extract more details
                if "23502" in str(e):  # NOT NULL violation
                    print("   → Missing required field. Ensure seller_id is valid UUID")
                elif "23503" in str(e):  # Foreign key violation
                    print("   → sender_id not found in users table")
        
        # Fallback to in-memory storage
        if not listing_id:
            listing_id = str(uuid.uuid4())
            listing_data["id"] = listing_id
            listings_db[listing_id] = listing_data
            print(f"📝 Listing created in memory: {listing_id}")
        
        return {
            "status": "success",
            "listing_id": listing_id,
            "listing": {**listing_data, "id": listing_id},
            "storage": "supabase" if use_supabase and listing_id else "memory"
        }
    except Exception as e:
        print(f"❌ Error creating listing: {e}")
        return {
            "status": "error",
            "message": str(e)
        }


@app.get("/api/marketplace/stats")
async def get_marketplace_stats():
    """Get marketplace statistics from Supabase or fallback"""
    try:
        total_items = 0
        categories = {}
        
        if use_supabase and supabase:
            try:
                response = supabase.table("waste_listings").select("category, status").eq("status", "AVAILABLE").execute()
                total_items = len(response.data) if response.data else 0
                
                if response.data:
                    for item in response.data:
                        cat = item.get("category", "Unknown")
                        categories[cat] = categories.get(cat, 0) + 1
                
                source = "supabase"
            except Exception as e:
                print(f"⚠️ Error fetching from Supabase: {e}")
                source = "memory"
                total_items = len(listings_db)
                for listing in listings_db.values():
                    cat = listing.get("category", "Unknown")
                    categories[cat] = categories.get(cat, 0) + 1
        else:
            source = "memory"
            total_items = len(listings_db)
            for listing in listings_db.values():
                cat = listing.get("category", "Unknown")
                categories[cat] = categories.get(cat, 0) + 1
        
        return {
            "total_listings": total_items,
            "categories": categories,
            "source": source,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        print(f"❌ Error getting stats: {e}")
        return {
            "total_listings": 0,
            "categories": {},
            "error": str(e)
        }


@app.post("/api/marketplace/transaction")
async def create_transaction(
    listing_id: str = Form(...),
    buyer_id: str = Form(...),
    seller_id: str = Form(...),
    quantity_bought: float = Form(...),
    total_price: Optional[float] = Form(None),
    seller_address: Optional[str] = Form(None),
    category: Optional[str] = Form("Unknown")
):
    """Create a transaction between buyer and seller + on-chain batch"""
    try:
        print(f"📦 Creating Transaction: {buyer_id} buying from {seller_id}")
        
        transaction_id = str(uuid.uuid4())
        transaction_data = {
            "listing_id": listing_id,
            "buyer_id": buyer_id,
            "seller_id": seller_id,
            "quantity_bought": quantity_bought,
            "total_price": total_price,
            "status": "PENDING",
            "payment_status": "PENDING",
            "traceability_status": "CREATED",
            "blockchain_batch_id": None,
            "blockchain_tx_hash": None
        }
        
        # Create on-chain batch if seller address is provided
        blockchain_result = None
        if seller_address:
            print(f"   ⛓️ Creating on-chain waste batch...")
            blockchain_result = create_waste_batch(
                category=category,
                quantity=int(quantity_bought),
                seller_address=seller_address
            )
            
            if blockchain_result and blockchain_result.get("success"):
                transaction_data["blockchain_batch_id"] = blockchain_result.get("batch_id")
                transaction_data["blockchain_tx_hash"] = blockchain_result.get("tx_hash")
                print(f"   ✅ On-chain batch created: {blockchain_result.get('batch_id')}")
            else:
                print(f"   ⚠️ Blockchain creation failed: {blockchain_result}")
        
        # Try to save to Supabase
        if use_supabase and supabase:
            try:
                response = supabase.table("transactions").insert(transaction_data).execute()
                if response.data:
                    transaction_id = response.data[0].get("id")
                    print(f"✅ Transaction created in Supabase: {transaction_id}")
            except Exception as e:
                print(f"⚠️ Supabase transaction error: {e}")
        
        # Fallback to in-memory
        transaction_data["id"] = transaction_id
        transactions_db[transaction_id] = transaction_data
        
        return {
            "status": "success",
            "transaction_id": transaction_id,
            "transaction": transaction_data,
            "blockchain": blockchain_result
        }
    except Exception as e:
        print(f"❌ Error creating transaction: {e}")
        return {
            "status": "error",
            "message": str(e)
        }

# --- 7. USER & BUYER ENDPOINTS ---

@app.post("/api/users/register")
async def register_user_form(
    email: str = Form(...),
    company_name: Optional[str] = Form(None),
    wallet_address: Optional[str] = Form(None)
):
    """Register a new user"""
    try:
        user_id = str(uuid.uuid4())
        
        user_data = {
            "id": user_id,
            "email": email,
            "company_name": company_name,
            "wallet_address": wallet_address
        }
        
        # Try to save to Supabase
        if use_supabase and supabase:
            try:
                response = supabase.table("users").insert(user_data).execute()
                if response.data:
                    user_id = response.data[0].get("id")
                    print(f"✅ User registered in Supabase: {user_id}")
            except Exception as e:
                print(f"⚠️ Supabase user registration error: {e}")
                if "23505" in str(e):  # Unique violation
                    return {"status": "error", "message": f"Email {email} already exists"}
        
        # Fallback to in-memory
        user_data["id"] = user_id
        users_db[user_id] = user_data
        
        return {
            "status": "success",
            "user_id": user_id,
            "user": user_data,
            "storage": "supabase" if use_supabase else "memory"
        }
    except Exception as e:
        print(f"❌ Error registering user: {e}")
        return {"status": "error", "message": str(e)}


@app.post("/api/buyers/needs")
async def create_buyer_need(
    buyer_id: str = Form(...),
    looking_for: str = Form(...)
):
    """Create a buyer need/requirement"""
    try:
        print(f"🔍 Creating Buyer Need for {buyer_id}")
        
        # Get embedding for the requirement
        try:
            embedding = get_embedding(looking_for)
        except Exception as e:
            print(f"⚠️ Error generating embedding: {e}")
            embedding = None
        
        need_data = {
            "buyer_id": buyer_id,
            "looking_for": looking_for,
            "embedding": embedding,
            "active": True
        }
        
        # Try to save to Supabase
        need_id = None
        if use_supabase and supabase:
            try:
                response = supabase.table("buyer_needs").insert(need_data).execute()
                if response.data:
                    need_id = response.data[0].get("id")
                    print(f"✅ Buyer need created in Supabase: {need_id}")
            except Exception as e:
                print(f"⚠️ Supabase buyer need error: {e}")
        
        # Fallback
        if not need_id:
            need_id = str(uuid.uuid4())
            need_data["id"] = need_id
            buyers_db[need_id] = need_data
        
        return {
            "status": "success",
            "need_id": need_id,
            "need": {**need_data, "id": need_id},
            "storage": "supabase" if use_supabase and need_id else "memory"
        }
    except Exception as e:
        print(f"❌ Error creating buyer need: {e}")
        return {"status": "error", "message": str(e)}


@app.get("/api/buyers/recommendations/{buyer_id}")
async def get_buyer_recommendations(buyer_id: str):
    """Get waste listings recommendations for a buyer"""
    try:
        # Get buyer's needs from Supabase
        listings = []
        
        if use_supabase and supabase:
            try:
                # Get buyer's needs
                needs_response = supabase.table("buyer_needs").select("*").eq("buyer_id", buyer_id).execute()
                
                if needs_response.data:
                    for need in needs_response.data:
                        looking_for = need.get("looking_for", "")
                        
                        # Get matching AVAILABLE listings
                        listings_response = supabase.table("waste_listings").select("*").eq("status", "AVAILABLE").execute()
                        
                        if listings_response.data:
                            listings.extend(listings_response.data[:5])  # Limit to 5
                
                return {
                    "status": "success",
                    "buyer_id": buyer_id,
                    "recommendations": listings,
                    "source": "supabase"
                }
            except Exception as e:
                print(f"⚠️ Error fetching recommendations: {e}")
        
        # Fallback to in-memory
        return {
            "status": "success",
            "buyer_id": buyer_id,
            "recommendations": list(listings_db.values())[:5],
            "source": "memory"
        }
    except Exception as e:
        print(f"❌ Error getting recommendations: {e}")
        return {"status": "error", "message": str(e)}


# --- 8. DATABASE STATUS ENDPOINT ---

@app.get("/api/db/status")
async def database_status():
    """Check database connection and storage status"""
    status = {
        "storage_backend": "supabase" if use_supabase else "memory",
        "supabase_configured": bool(SUPABASE_URL and SUPABASE_KEY),
        "supabase_connected": use_supabase,
        "supabase_url": SUPABASE_URL if use_supabase else None
    }
    
    if use_supabase and supabase:
        try:
            # Test connection
            health = supabase.table("users").select("count", count="exact").execute()
            status["supabase_health"] = "healthy"
            status["users_count"] = health.count if hasattr(health, 'count') else "unknown"
        except Exception as e:
            status["supabase_health"] = "unhealthy"
            status["error"] = str(e)
    
    status["in_memory_stats"] = {
        "users": len(users_db),
        "listings": len(listings_db),
        "buyer_needs": len(buyers_db),
        "transactions": len(transactions_db)
    }
    
    return status


# --- DEBUG ENDPOINT: Check what's in Supabase tables ---
@app.get("/api/debug/supabase-data")
async def debug_supabase_data():
    """Debug endpoint to see what's actually in Supabase tables"""
    if not use_supabase or not supabase:
        return {"error": "Supabase not connected"}
    
    result = {}
    
    try:
        # Get users
        users_response = supabase.table("users").select("*").execute()
        result["users"] = {
            "count": len(users_response.data) if users_response.data else 0,
            "data": users_response.data if users_response.data else []
        }
        print(f"✅ Users table: {result['users']['count']} records")
    except Exception as e:
        result["users"] = {"error": str(e)}
        print(f"❌ Users table error: {e}")
    
    try:
        # Get listings
        listings_response = supabase.table("waste_listings").select("*").execute()
        result["listings"] = {
            "count": len(listings_response.data) if listings_response.data else 0,
            "data": listings_response.data if listings_response.data else []
        }
        print(f"✅ Listings table: {result['listings']['count']} records")
    except Exception as e:
        result["listings"] = {"error": str(e)}
        print(f"❌ Listings table error: {e}")
    
    try:
        # Get buyer needs
        buyers_response = supabase.table("buyer_needs").select("*").execute()
        result["buyer_needs"] = {
            "count": len(buyers_response.data) if buyers_response.data else 0,
            "data": buyers_response.data if buyers_response.data else []
        }
        print(f"✅ Buyer needs table: {result['buyer_needs']['count']} records")
    except Exception as e:
        result["buyer_needs"] = {"error": str(e)}
        print(f"❌ Buyer needs table error: {e}")
    
    try:
        # Get transactions
        transactions_response = supabase.table("transactions").select("*").execute()
        result["transactions"] = {
            "count": len(transactions_response.data) if transactions_response.data else 0,
            "data": transactions_response.data if transactions_response.data else []
        }
        print(f"✅ Transactions table: {result['transactions']['count']} records")
    except Exception as e:
        result["transactions"] = {"error": str(e)}
        print(f"❌ Transactions table error: {e}")
    
    result["in_memory"] = {
        "users": len(users_db),
        "listings": len(listings_db),
        "buyer_needs": len(buyers_db),
        "transactions": len(transactions_db)
    }
    
    return result


# --- 9. BLOCKCHAIN ENDPOINTS ---

@app.post("/api/blockchain/batch")
async def create_batch_on_chain(request: BlockchainBatchRequest) -> BlockchainTransactionResponse:
    """Create a waste batch on the blockchain"""
    try:
        print(f"⛓️ Creating on-chain batch: {request.category}")
        
        result = create_waste_batch(
            category=request.category,
            quantity=request.quantity,
            seller_address=request.seller_address
        )
        
        if result and result.get("success"):
            return BlockchainTransactionResponse(
                success=True,
                tx_hash=result.get("tx_hash"),
                batch_id=result.get("batch_id")
            )
        else:
            return BlockchainTransactionResponse(
                success=False,
                error=result.get("error") if result else "Unknown blockchain error"
            )
    except Exception as e:
        print(f"❌ Error on blockchain batch creation: {e}")
        return BlockchainTransactionResponse(success=False, error=str(e))


@app.post("/api/blockchain/commit")
async def commit_to_purchase_on_chain(request: BlockchainTransactionRequest) -> BlockchainTransactionResponse:
    """Buyer commits to purchase on-chain"""
    try:
        print(f"⛓️ Buyer {request.buyer_address} committing to batch {request.batch_id}")
        
        result = commit_to_purchase(
            buyer_address=request.buyer_address,
            batch_id=request.batch_id
        )
        
        if result and result.get("success"):
            return BlockchainTransactionResponse(
                success=True,
                tx_hash=result.get("tx_hash"),
                batch_id=result.get("batch_id")
            )
        else:
            return BlockchainTransactionResponse(
                success=False,
                error=result.get("error") if result else "Commitment failed"
            )
    except Exception as e:
        print(f"❌ Error committing on-chain: {e}")
        return BlockchainTransactionResponse(success=False, error=str(e))


@app.post("/api/blockchain/transfer")
async def transfer_batch_on_chain(request: BlockchainTransactionRequest) -> BlockchainTransactionResponse:
    """Seller transfers waste batch to buyer on-chain"""
    try:
        print(f"⛓️ Seller {request.seller_address} transferring batch {request.batch_id}")
        
        result = transfer_waste_batch(
            seller_address=request.seller_address,
            batch_id=request.batch_id
        )
        
        if result and result.get("success"):
            return BlockchainTransactionResponse(
                success=True,
                tx_hash=result.get("tx_hash"),
                batch_id=result.get("batch_id")
            )
        else:
            return BlockchainTransactionResponse(
                success=False,
                error=result.get("error") if result else "Transfer failed"
            )
    except Exception as e:
        print(f"❌ Error transferring on-chain: {e}")
        return BlockchainTransactionResponse(success=False, error=str(e))


@app.get("/api/blockchain/batch/{batch_id}")
async def get_batch_on_chain(batch_id: int):
    """Get status of waste batch from blockchain"""
    try:
        batch_status = get_batch_status(batch_id)
        
        if batch_status:
            return {
                "success": True,
                "batch": batch_status
            }
        else:
            return {
                "success": False,
                "error": f"Batch {batch_id} not found"
            }
    except Exception as e:
        print(f"❌ Error getting batch status: {e}")
        return {
            "success": False,
            "error": str(e)
        }


@app.get("/api/blockchain/status")
async def blockchain_connection_status():
    """Get blockchain connection and contract status"""
    try:
        status = get_blockchain_status()
        return {
            "success": True,
            "blockchain": status
        }
    except Exception as e:
        print(f"❌ Error getting blockchain status: {e}")
        return {
            "success": False,
            "error": str(e)
        }


# --- 10. STARTUP ---
if __name__ == "__main__":
    print("\n" + "="*60)
    print("🚀 WasteExchange Backend Starting...")
    print("="*60)
    print(f"📍 API Docs: http://localhost:8000/docs")
    print(f"📍 Health Check: http://localhost:8000/api/health")
    print(f"📍 DB Status: http://localhost:8000/api/db/status")
    print(f"📊 Storage Backend: {'Supabase' if use_supabase else 'In-Memory'}")
    if use_supabase:
        print(f"📍 Supabase URL: {SUPABASE_URL}")
    print("="*60 + "\n")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)