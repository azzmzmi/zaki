#!/usr/bin/env python3
"""
MongoDB Connection Test Script
Tests connection to MongoDB Atlas using the provided connection string.
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import sys
from datetime import datetime

# MongoDB connection string
MONGO_URL = "mongodb+srv://zaki:Samzami0$@zaki.bqkwo4e.mongodb.net/"

async def test_mongodb_connection():
    """Test MongoDB connection and display database information."""
    print("=" * 60)
    print("MongoDB Connection Test")
    print("=" * 60)
    print(f"Connection String: mongodb+srv://zaki:***@zaki.bqkwo4e.mongodb.net/")
    print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("-" * 60)
    
    client = None
    try:
        # Attempt to connect
        print("\n[1/4] Connecting to MongoDB...")
        client = AsyncIOMotorClient(MONGO_URL, serverSelectionTimeoutMS=5000)
        
        # Test the connection by listing databases
        print("[2/4] Testing connection (listing databases)...")
        db_list = await client.list_database_names()
        
        print(f"✓ Connection successful!")
        print(f"\n[3/4] Available databases ({len(db_list)}):")
        for db_name in sorted(db_list):
            # Get database info
            db = client[db_name]
            collections = await db.list_collection_names()
            print(f"  - {db_name}: {len(collections)} collection(s)")
            if collections:
                for coll in sorted(collections):
                    count = await db[coll].count_documents({})
                    print(f"    • {coll}: {count} document(s)")
        
        # Test a ping command
        print("\n[4/4] Testing ping command...")
        ping_result = await client.admin.command('ping')
        print(f"✓ Ping successful: {ping_result}")
        
        print("\n" + "=" * 60)
        print("✓ MongoDB connection test PASSED")
        print("=" * 60)
        return True
        
    except Exception as e:
        print("\n" + "=" * 60)
        print("✗ MongoDB connection test FAILED")
        print("=" * 60)
        print(f"Error Type: {type(e).__name__}")
        print(f"Error Message: {str(e)}")
        print("\nTroubleshooting tips:")
        print("  1. Check if your IP address is whitelisted in MongoDB Atlas")
        print("  2. Verify the username and password are correct")
        print("  3. Ensure the connection string is properly formatted")
        print("  4. Check your internet connection")
        print("  5. Verify the MongoDB cluster is running")
        return False
        
    finally:
        if client:
            client.close()
            print("\nConnection closed.")

if __name__ == "__main__":
    try:
        result = asyncio.run(test_mongodb_connection())
        sys.exit(0 if result else 1)
    except KeyboardInterrupt:
        print("\n\nTest interrupted by user.")
        sys.exit(1)
    except Exception as e:
        print(f"\n\nUnexpected error: {e}")
        sys.exit(1)

