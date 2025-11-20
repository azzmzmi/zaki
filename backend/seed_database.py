"""
Database seeding script for ShopHub eCommerce application.
Run this script to populate the database with initial data.

Usage:
    python seed_database.py
"""

import asyncio
import os
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'ecommerce_db')

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def seed_database():
    """Seed the database with initial data."""
    
    # Connect to MongoDB
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    print(f"Connected to MongoDB: {DB_NAME}")
    
    # Create admin user
    print("\n1. Creating admin user...")
    admin_exists = await db.users.find_one({"email": "info@zakimart.com"})
    
    if not admin_exists:
        admin_user = {
            "id": "admin-001",
            "email": "info@zakimart.com",
            "full_name": "Admin User",
            "role": "admin",
            "password": pwd_context.hash("admin@ZM"),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(admin_user)
        print("   ✓ Admin user created (info@zakimart.com / admin123)")
    else:
        print("   ✓ Admin user already exists")
    
    # Create categories
    print("\n2. Creating categories...")
    categories = [
        {
            "id": "cat-001",
            "name": "Electronics",
            "description": "Electronic devices and accessories",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "cat-002",
            "name": "Fashion",
            "description": "Clothing and fashion items",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "cat-003",
            "name": "Home & Garden",
            "description": "Home decor and garden supplies",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "cat-004",
            "name": "Sports",
            "description": "Sports equipment and gear",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    category_ids = {}
    for cat in categories:
        existing = await db.categories.find_one({"name": cat["name"]})
        if not existing:
            await db.categories.insert_one(cat)
            print(f"   ✓ Created: {cat['name']}")
        else:
            print(f"   ✓ Already exists: {cat['name']}")
        category_ids[cat["name"]] = cat["id"]
    
    # Create products
    print("\n3. Creating products...")
    products = [
        {
            "id": "prod-001",
            "name": "Wireless Headphones",
            "description": "Premium noise-cancelling wireless headphones with 30-hour battery life",
            "price": 149.99,
            "category_id": category_ids["Electronics"],
            "stock": 50,
            "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&h=400&q=80",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "prod-002",
            "name": "Smart Watch",
            "description": "Fitness tracking smartwatch with heart rate monitor",
            "price": 299.99,
            "category_id": category_ids["Electronics"],
            "stock": 30,
            "image_url": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&h=400&q=80",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "prod-003",
            "name": "Laptop Backpack",
            "description": "Water-resistant backpack with laptop compartment",
            "price": 79.99,
            "category_id": category_ids["Fashion"],
            "stock": 100,
            "image_url": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=400&h=400&q=80",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "prod-004",
            "name": "Running Shoes",
            "description": "Comfortable running shoes with excellent support",
            "price": 129.99,
            "category_id": category_ids["Sports"],
            "stock": 75,
            "image_url": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&h=400&q=80",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "prod-005",
            "name": "Coffee Maker",
            "description": "Automatic coffee maker with programmable timer",
            "price": 89.99,
            "category_id": category_ids["Home & Garden"],
            "stock": 40,
            "image_url": "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=400&h=400&q=80",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "prod-006",
            "name": "Yoga Mat",
            "description": "Non-slip yoga mat with carrying strap",
            "price": 34.99,
            "category_id": category_ids["Sports"],
            "stock": 120,
            "image_url": "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=400&h=400&q=80",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "prod-007",
            "name": "Bluetooth Speaker",
            "description": "Portable waterproof bluetooth speaker",
            "price": 59.99,
            "category_id": category_ids["Electronics"],
            "stock": 60,
            "image_url": "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=400&h=400&q=80",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "prod-008",
            "name": "Designer Sunglasses",
            "description": "UV protection designer sunglasses",
            "price": 199.99,
            "category_id": category_ids["Fashion"],
            "stock": 45,
            "image_url": "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=400&h=400&q=80",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    for prod in products:
        existing = await db.products.find_one({"name": prod["name"]})
        if not existing:
            await db.products.insert_one(prod)
            print(f"   ✓ Created: {prod['name']}")
        else:
            print(f"   ✓ Already exists: {prod['name']}")
    
    print("\n✅ Database seeded successfully!")
    print(f"\nAdmin credentials:")
    print(f"   Email: info@zakimart.com")
    print(f"   Password: admin123")
    
    # Close connection
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_database())
