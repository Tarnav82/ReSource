"""
Blockchain Service for WasteExchange
Handles interactions with the Solidity smart contract on Ethereum/Polygon
"""

import os
import json
from typing import Optional, Dict, Any
from dotenv import load_dotenv

# Optional Web3 import - blockchain features disabled if not installed
try:
    from web3 import Web3
    web3_available = True
except ImportError:
    print("⚠️ Web3 not installed. Blockchain features disabled.")
    print("   To enable: pip install web3==6.11.3")
    web3_available = False
    Web3 = None

load_dotenv()

# --- BLOCKCHAIN CONFIGURATION ---
BLOCKCHAIN_PROVIDER = os.getenv("BLOCKCHAIN_PROVIDER", "http://127.0.0.1:8545")  # Hardhat local or Infura URL
CONTRACT_ADDRESS = os.getenv("CONTRACT_ADDRESS", "0x0000000000000000000000000000000000000000")
PRIVATE_KEY = os.getenv("BLOCKCHAIN_PRIVATE_KEY", "")
ADMIN_ADDRESS = os.getenv("ADMIN_ADDRESS", "0x0000000000000000000000000000000000000000")

# Smart Contract ABI (matches IndustrialWasteExchange.sol)
CONTRACT_ABI = [
    {
        "inputs": [
            {"internalType": "string", "name": "category", "type": "string"},
            {"internalType": "uint256", "name": "quantity", "type": "uint256"},
            {"internalType": "address", "name": "seller", "type": "address"}
        ],
        "name": "createWasteBatch",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "uint256", "name": "batchId", "type": "uint256"}],
        "name": "commitToPurchase",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "uint256", "name": "batchId", "type": "uint256"}],
        "name": "transferWasteBatch",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "uint256", "name": "batchId", "type": "uint256"}],
        "name": "getWasteBatch",
        "outputs": [
            {
                "components": [
                    {"internalType": "uint256", "name": "batchId", "type": "uint256"},
                    {"internalType": "string", "name": "category", "type": "string"},
                    {"internalType": "uint256", "name": "quantity", "type": "uint256"},
                    {"internalType": "address", "name": "currentOwner", "type": "address"},
                    {"internalType": "address", "name": "committedBuyer", "type": "address"},
                    {"internalType": "uint8", "name": "status", "type": "uint8"},
                    {"internalType": "uint256", "name": "createdAt", "type": "uint256"}
                ],
                "internalType": "struct IndustrialWasteExchange.WasteBatch",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "anonymous": False,
        "inputs": [
            {"indexed": True, "internalType": "uint256", "name": "batchId", "type": "uint256"},
            {"indexed": True, "internalType": "address", "name": "seller", "type": "address"},
            {"indexed": False, "internalType": "string", "name": "category", "type": "string"},
            {"indexed": False, "internalType": "uint256", "name": "quantity", "type": "uint256"}
        ],
        "name": "WasteBatchCreated",
        "type": "event"
    },
    {
        "anonymous": False,
        "inputs": [
            {"indexed": True, "internalType": "uint256", "name": "batchId", "type": "uint256"},
            {"indexed": True, "internalType": "address", "name": "buyer", "type": "address"}
        ],
        "name": "PurchaseCommitted",
        "type": "event"
    },
    {
        "anonymous": False,
        "inputs": [
            {"indexed": True, "internalType": "uint256", "name": "batchId", "type": "uint256"},
            {"indexed": True, "internalType": "address", "name": "from", "type": "address"},
            {"indexed": True, "internalType": "address", "name": "to", "type": "address"}
        ],
        "name": "WasteBatchTransferred",
        "type": "event"
    }
]

# Initialize Web3
blockchain_enabled = False
w3 = None

if web3_available:
    try:
        w3 = Web3(Web3.HTTPProvider(BLOCKCHAIN_PROVIDER))
        if w3.is_connected():
            print(f"✅ Connected to blockchain: {BLOCKCHAIN_PROVIDER}")
            blockchain_enabled = True
        else:
            print(f"⚠️ Cannot connect to blockchain: {BLOCKCHAIN_PROVIDER}")
            print("   Blockchain features will be disabled")
            blockchain_enabled = False
    except Exception as e:
        print(f"⚠️ Blockchain initialization error: {e}")
        blockchain_enabled = False
else:
    print("⚠️ Web3 module not available. Blockchain features disabled.")


# --- SERVICE FUNCTIONS ---

def create_waste_batch(
    category: str,
    quantity: int,
    seller_address: str
) -> Optional[Dict[str, Any]]:
    """
    Create a waste batch on-chain
    Only works if blockchain is enabled and admin key is configured
    """
    if not web3_available or not blockchain_enabled or not PRIVATE_KEY or not CONTRACT_ADDRESS.startswith("0x"):
        print("⚠️ Blockchain not enabled or contract not deployed")
        return None
    
    try:
        # Validate sender address
        if not Web3.is_address(seller_address):
            print(f"❌ Invalid seller address: {seller_address}")
            return {
                "success": False,
                "error": f"Invalid Ethereum address: {seller_address}"
            }
        
        print(f"⛓️ Creating on-chain batch: {category} ({quantity}kg) for {seller_address}")
        
        # Get contract instance
        contract = w3.eth.contract(address=CONTRACT_ADDRESS, abi=CONTRACT_ABI)
        
        # Validate addresses
        seller_address = Web3.to_checksum_address(seller_address)
        admin_address = Web3.to_checksum_address(ADMIN_ADDRESS)
        
        # Get admin account for signing
        admin_account = w3.eth.account.from_key(PRIVATE_KEY)
        
        # Build transaction
        tx = contract.functions.createWasteBatch(
            category,
            quantity,
            seller_address
        ).build_transaction({
            'from': admin_account.address,
            'nonce': w3.eth.get_transaction_count(admin_account.address),
            'gas': 300000,
            'gasPrice': w3.eth.gas_price,
        })
        
        # Sign and send transaction
        signed_tx = w3.eth.account.sign_transaction(tx, PRIVATE_KEY)
        tx_hash = w3.eth.send_raw_transaction(signed_tx.rawTransaction)
        
        # Wait for receipt
        tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
        
        print(f"✅ Batch created on-chain")
        print(f"   TX Hash: {tx_hash.hex()}")
        print(f"   Block: {tx_receipt.blockNumber}")
        
        # Extract batch ID from event logs
        batch_id = extract_batch_id_from_receipt(tx_receipt, contract)
        
        return {
            "success": True,
            "tx_hash": tx_hash.hex(),
            "block_number": tx_receipt.blockNumber,
            "batch_id": batch_id,
            "category": category,
            "quantity": quantity,
            "seller": seller_address
        }
    except Exception as e:
        print(f"❌ Error creating batch on-chain: {e}")
        return {
            "success": False,
            "error": str(e)
        }


def commit_to_purchase(
    buyer_address: str,
    batch_id: int
) -> Optional[Dict[str, Any]]:
    """
    Buyer commits to purchase a waste batch on-chain
    """
    if not web3_available or not blockchain_enabled or not CONTRACT_ADDRESS.startswith("0x"):
        print("⚠️ Blockchain not enabled or contract not deployed")
        return None
    
    try:
        # Validate buyer address
        if not Web3.is_address(buyer_address):
            print(f"❌ Invalid buyer address: {buyer_address}")
            return {
                "success": False,
                "error": f"Invalid Ethereum address: {buyer_address}"
            }
        
        print(f"⛓️ Buyer {buyer_address} committing to batch {batch_id}")
        
        contract = w3.eth.contract(address=CONTRACT_ADDRESS, abi=CONTRACT_ABI)
        buyer_address = Web3.to_checksum_address(buyer_address)
        
        # For local testing: use buyer's private key if available
        # In production: would go through signature/transaction from frontend
        buyer_account = w3.eth.account.from_key(PRIVATE_KEY)  # Simplified for demo
        
        tx = contract.functions.commitToPurchase(batch_id).build_transaction({
            'from': buyer_account.address,
            'nonce': w3.eth.get_transaction_count(buyer_account.address),
            'gas': 300000,
            'gasPrice': w3.eth.gas_price,
        })
        
        signed_tx = w3.eth.account.sign_transaction(tx, PRIVATE_KEY)
        tx_hash = w3.eth.send_raw_transaction(signed_tx.rawTransaction)
        tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
        
        print(f"✅ Commitment recorded on-chain")
        
        return {
            "success": True,
            "tx_hash": tx_hash.hex(),
            "batch_id": batch_id,
            "buyer": buyer_address
        }
    except Exception as e:
        print(f"❌ Error committing purchase on-chain: {e}")
        return {
            "success": False,
            "error": str(e)
        }


def transfer_waste_batch(
    seller_address: str,
    batch_id: int
) -> Optional[Dict[str, Any]]:
    """
    Seller transfers waste batch to committed buyer on-chain
    """
    if not web3_available or not blockchain_enabled or not CONTRACT_ADDRESS.startswith("0x"):
        print("⚠️ Blockchain not enabled or contract not deployed")
        return None
    
    try:
        # Validate seller address
        if not Web3.is_address(seller_address):
            print(f"❌ Invalid seller address: {seller_address}")
            return {
                "success": False,
                "error": f"Invalid Ethereum address: {seller_address}"
            }
        
        print(f"⛓️ Seller {seller_address} transferring batch {batch_id}")
        
        contract = w3.eth.contract(address=CONTRACT_ADDRESS, abi=CONTRACT_ABI)
        seller_address = Web3.to_checksum_address(seller_address)
        
        seller_account = w3.eth.account.from_key(PRIVATE_KEY)  # Simplified for demo
        
        tx = contract.functions.transferWasteBatch(batch_id).build_transaction({
            'from': seller_account.address,
            'nonce': w3.eth.get_transaction_count(seller_account.address),
            'gas': 300000,
            'gasPrice': w3.eth.gas_price,
        })
        
        signed_tx = w3.eth.account.sign_transaction(tx, PRIVATE_KEY)
        tx_hash = w3.eth.send_raw_transaction(signed_tx.rawTransaction)
        tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
        
        print(f"✅ Batch transferred on-chain")
        
        return {
            "success": True,
            "tx_hash": tx_hash.hex(),
            "batch_id": batch_id,
            "seller": seller_address
        }
    except Exception as e:
        print(f"❌ Error transferring batch on-chain: {e}")
        return {
            "success": False,
            "error": str(e)
        }


def get_batch_status(batch_id: int) -> Optional[Dict[str, Any]]:
    """
    Get current status of a waste batch from blockchain
    """
    if not web3_available or not blockchain_enabled or not CONTRACT_ADDRESS.startswith("0x"):
        return None
    
    try:
        contract = w3.eth.contract(address=CONTRACT_ADDRESS, abi=CONTRACT_ABI)
        batch = contract.functions.getWasteBatch(batch_id).call()
        
        status_map = {0: "CREATED", 1: "COMMITTED", 2: "TRANSFERRED"}
        
        return {
            "batch_id": batch[0],
            "category": batch[1],
            "quantity": batch[2],
            "current_owner": batch[3],
            "committed_buyer": batch[4],
            "status": status_map.get(batch[5], "UNKNOWN"),
            "created_at": batch[6]
        }
    except Exception as e:
        print(f"⚠️ Error getting batch status: {e}")
        return None


def extract_batch_id_from_receipt(tx_receipt, contract) -> Optional[int]:
    """
    Extract batch ID from WasteBatchCreated event in transaction receipt
    """
    if not web3_available:
        return None
    
    try:
        logs = contract.events.WasteBatchCreated().process_receipt(tx_receipt)
        if logs and len(logs) > 0:
            return logs[0]['args']['batchId']
    except Exception as e:
        print(f"⚠️ Could not extract batch ID from event logs: {e}")
    
    return None


def get_blockchain_status() -> Dict[str, Any]:
    """Get status of blockchain connection and contract"""
    return {
        "enabled": blockchain_enabled,
        "web3_available": web3_available,
        "provider": BLOCKCHAIN_PROVIDER if web3_available else "WEB3_NOT_INSTALLED",
        "contract_address": CONTRACT_ADDRESS if CONTRACT_ADDRESS.startswith("0x") else "NOT_CONFIGURED",
        "connected": blockchain_enabled and w3.is_connected() if (blockchain_enabled and web3_available and w3) else False,
        "network_id": w3.net.version if (blockchain_enabled and web3_available and w3 and w3.is_connected()) else None
    }
