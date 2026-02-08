import pickle
import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

# --- 1. Load Models ---
print("⏳ Loading AI Models...")

# Load Classifier
try:
    with open('waste_classifier.pkl', 'rb') as f:
        classifier = pickle.load(f)
    print("✅ Classifier Loaded")
except FileNotFoundError:
    print("❌ Error: waste_classifier.pkl not found. Run train_classifier.py first!")
    classifier = None

# Lazy-load S-BERT (Downloads on first use, not at startup)
embedder = None

def _load_embedder():
    """Lazy-load embedder on first use to avoid startup timeout"""
    global embedder
    if embedder is None:
        print("⏳ Loading S-BERT Embedder (first use)...")
        try:
            embedder = SentenceTransformer('all-MiniLM-L6-v2')
            print("✅ S-BERT Embedder Loaded")
        except Exception as e:
            print(f"⚠️ Embedder load failed: {e}")
            raise
    return embedder

# --- 2. Core Functions ---

def predict_category(text):
    if classifier:
        prediction = classifier.predict([text])[0]
        return str(prediction) # Force string for JSON safety
    return "Unknown"

def get_embedding(text):
    # Convert numpy array to list for JSON serialization
    emb = _load_embedder()
    return emb.encode(text).tolist()

def find_best_match(seller_text, buyer_list):
    """
    Finds the best buyer for the waste.
    """
    # 1. Get Category
    category = predict_category(seller_text)
    
    # 2. Encode Seller Text
    emb = _load_embedder()
    seller_vector = emb.encode([seller_text])
    
    matches = []
    
    # 3. Compare with Buyers
    for buyer in buyer_list:
        # Reshape buyer vector for 1-on-1 comparison
        buyer_vector = np.array(buyer['embedding']).reshape(1, -1)
        
        # Calculate Cosine Similarity
        score = cosine_similarity(seller_vector, buyer_vector)[0][0]
        
        # Boost Logic (Keyword Match)
        seller_words = set(seller_text.lower().split())
        buyer_words = set(buyer['need'].lower().split())
        
        if not seller_words.isdisjoint(buyer_words):
            score += 0.2 # Boost for shared words
            
        # Cap score at 0.99
        score = min(0.99, score)
        
        if score > 0.45: # Threshold
            matches.append({
                "buyer_id": buyer['id'],
                "match_score": round(float(score), 2),
                "category_detected": category,
                "reason": f"Matched '{buyer['need']}'"
            })
            
    # Sort best matches first
    return sorted(matches, key=lambda x: x['match_score'], reverse=True)