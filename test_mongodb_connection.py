#!/usr/bin/env python3
"""
MongoDB Connection Test Script
Tests connection to MongoDB Atlas using the provided connection string.
"""

import asyncio
from datetime import datetime
import os
import sys
from urllib.parse import urlparse, urlunparse

import pytest
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")


def _mask_connection_string(uri: str) -> str:
    """Mask credentials in a MongoDB connection string for safe logging."""

    if not uri:
        return "<not provided>"

    parsed = urlparse(uri)
    username = parsed.username or ""
    password = parsed.password
    host = parsed.hostname or ""
    port = f":{parsed.port}" if parsed.port else ""

    auth = ""
    if username:
        auth = username
    if password:
        auth = f"{username}:***"

    netloc = f"{auth + '@' if auth else ''}{host}{port}"
    return urlunparse(
        (
            parsed.scheme,
            netloc,
            parsed.path,
            parsed.params,
            parsed.query,
            parsed.fragment,
        )
    )


async def run_mongodb_connection_test(client: AsyncIOMotorClient) -> bool:
    """Test MongoDB connection and display database information."""
    print("=" * 60)
    print("MongoDB Connection Test")
    print("=" * 60)
    masked_connection = _mask_connection_string(MONGO_URL)
    print(f"Connection String: {masked_connection}")
    print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("-" * 60)

    try:
        print("\n[1/4] Connecting to MongoDB...")

        print("[2/4] Testing connection (listing databases)...")
        db_list = await client.list_database_names()

        print("✓ Connection successful!")
        print(f"\n[3/4] Available databases ({len(db_list)}):")
        for db_name in sorted(db_list):
            db = client[db_name]
            collections = await db.list_collection_names()
            print(f"  - {db_name}: {len(collections)} collection(s)")
            if collections:
                for coll in sorted(collections):
                    count = await db[coll].count_documents({})
                    print(f"    • {coll}: {count} document(s)")

        print("\n[4/4] Testing ping command...")
        ping_result = await client.admin.command("ping")
        print(f"✓ Ping successful: {ping_result}")

        print("\n" + "=" * 60)
        print("✓ MongoDB connection test PASSED")
        print("=" * 60)
        return True

    except Exception as e:  # pragma: no cover - exercised in manual runs
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
        client.close()
        print("\nConnection closed.")


def create_client() -> AsyncIOMotorClient:
    """Create a MongoDB client with a reasonable timeout for manual runs."""

    if not MONGO_URL:
        raise RuntimeError(
            "MONGO_URL is not set. Provide a valid MongoDB connection string in the environment"
        )

    return AsyncIOMotorClient(MONGO_URL, serverSelectionTimeoutMS=5000)


def test_mongodb_connection(capsys):
    """Ensure the MongoDB diagnostic routine can run without real network access."""

    class FakeCollection:
        async def count_documents(self, _):
            return 3

    class FakeDatabase:
        def __init__(self, name: str):
            self.name = name

        async def list_collection_names(self):
            return ["users", "orders"]

        def __getitem__(self, item: str):
            return FakeCollection()

    class FakeAdmin:
        async def command(self, command_name: str):
            assert command_name == "ping"
            return {"ok": 1.0}

    class FakeClient:
        def __init__(self):
            self.admin = FakeAdmin()
            self.closed = False

        async def list_database_names(self):
            return ["db1", "db2"]

        def __getitem__(self, name: str):
            return FakeDatabase(name)

        def close(self):
            self.closed = True

    fake_client = FakeClient()
    result = asyncio.run(run_mongodb_connection_test(fake_client))

    captured = capsys.readouterr().out
    assert result is True
    assert "Connection closed." in captured
    assert "Ping successful" in captured
    assert fake_client.closed is True


if __name__ == "__main__":
    try:
        result = asyncio.run(run_mongodb_connection_test(create_client()))
        sys.exit(0 if result else 1)
    except KeyboardInterrupt:
        print("\n\nTest interrupted by user.")
        sys.exit(1)
    except Exception as e:
        print(f"\n\nUnexpected error: {e}")
        sys.exit(1)

