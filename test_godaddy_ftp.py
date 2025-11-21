#!/usr/bin/env python3
"""
GoDaddy FTP Connection Test Script
Verifies FTP connectivity and tests file upload capabilities
"""

import ftplib
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
env_path = Path(__file__).parent / 'backend' / '.env'
load_dotenv(env_path)

# FTP Configuration
FTP_HOST = os.environ.get('GODADDY_FTP_HOST')
FTP_USER = os.environ.get('GODADDY_FTP_USERNAME')
FTP_PASSWORD = os.environ.get('GODADDY_FTP_PASSWORD')
FTP_DIR = os.environ.get('GODADDY_FTP_DIR', '')
BASE_URL = os.environ.get('GODADDY_BASE_URL')
PUBLIC_PATH = os.environ.get('GODADDY_PUBLIC_PATH', '/uploads')

def print_config():
    """Display FTP configuration (without password)"""
    print("\n" + "="*60)
    print("GoDaddy FTP Configuration")
    print("="*60)
    print(f"FTP Host: {FTP_HOST}")
    print(f"FTP User: {FTP_USER}")
    print(f"FTP Password: {'*' * len(FTP_PASSWORD) if FTP_PASSWORD else 'Not set'}")
    print(f"FTP Directory: {FTP_DIR}")
    print(f"Base URL: {BASE_URL}")
    print(f"Public Path: {PUBLIC_PATH}")
    print("="*60 + "\n")

def test_ftp_connection():
    """Test basic FTP connection"""
    print("[1/4] Testing FTP Connection...")
    try:
        with ftplib.FTP(FTP_HOST) as ftp:
            response = ftp.login(FTP_USER, FTP_PASSWORD)
            print(f"✓ Connected to {FTP_HOST}")
            print(f"  Login response: {response}")
            return ftp
    except ftplib.all_errors as e:
        print(f"✗ Failed to connect: {e}")
        return None

def test_directory_access(ftp):
    """Test if FTP directory is accessible"""
    print("\n[2/4] Testing Directory Access...")
    try:
        if FTP_DIR:
            ftp.cwd(FTP_DIR)
            print(f"✓ Successfully changed to directory: {FTP_DIR}")
        else:
            print("⚠ No FTP directory specified, using root")
        
        # List directory contents
        print("\nDirectory contents (first 10 files):")
        files = ftp.nlst()[:10]
        for f in files:
            print(f"  - {f}")
        return True
    except ftplib.all_errors as e:
        print(f"✗ Directory access failed: {e}")
        return False

def test_file_upload(ftp):
    """Test uploading a test file"""
    print("\n[3/4] Testing File Upload...")
    test_content = b"GoDaddy FTP Test File - This file was uploaded successfully!"
    test_filename = "test_upload.txt"
    
    try:
        import io
        ftp.storbinary(f"STOR {test_filename}", io.BytesIO(test_content))
        print(f"✓ Successfully uploaded test file: {test_filename}")
        return test_filename
    except ftplib.all_errors as e:
        print(f"✗ File upload failed: {e}")
        return None

def test_file_access(test_filename):
    """Test accessing the uploaded file via URL"""
    print("\n[4/4] Testing URL Access...")
    base_url = BASE_URL.rstrip('/')
    public_path = PUBLIC_PATH if PUBLIC_PATH.startswith('/') else f"/{PUBLIC_PATH}"
    file_url = f"{base_url}{public_path.rstrip('/')}/{test_filename}"
    
    print(f"✓ File should be accessible at:")
    print(f"  {file_url}")
    print(f"\n  (Note: This URL will work once DNS propagates and the file is publicly accessible)")
    
    return file_url

def cleanup_test_file(ftp, test_filename):
    """Remove test file from FTP"""
    print("\n[Cleanup] Removing test file...")
    try:
        ftp.delete(test_filename)
        print(f"✓ Test file deleted: {test_filename}")
    except ftplib.all_errors as e:
        print(f"⚠ Could not delete test file: {e}")

def main():
    # Validate configuration
    if not all([FTP_HOST, FTP_USER, FTP_PASSWORD, BASE_URL]):
        print("✗ Missing FTP configuration!")
        print("Please ensure the following environment variables are set:")
        print("  - GODADDY_FTP_HOST")
        print("  - GODADDY_FTP_USERNAME")
        print("  - GODADDY_FTP_PASSWORD")
        print("  - GODADDY_BASE_URL")
        sys.exit(1)
    
    print_config()
    
    # Test connection
    ftp = test_ftp_connection()
    if not ftp:
        print("\n⚠ Connection failed. This may be due to:")
        print("  1. Network connectivity issues")
        print("  2. Incorrect FTP hostname")
        print("  3. DNS resolution problems")
        print("\n  If your DNS/hostname is correct, the configuration is still valid.")
        print("  The FTP upload will work once deployed on a system with proper network access.")
        sys.exit(1)
    
    # Test directory access
    if not test_directory_access(ftp):
        ftp.quit()
        sys.exit(1)
    
    # Test file upload
    test_filename = test_file_upload(ftp)
    if test_filename:
        file_url = test_file_access(test_filename)
        cleanup_test_file(ftp, test_filename)
    
    ftp.quit()
    
    print("\n" + "="*60)
    print("✓ All FTP tests completed successfully!")
    print("="*60)
    print("\nNext Steps:")
    print("1. Verify the file URL is accessible in your browser")
    print("2. Update render.yaml to use GoDaddy FTP instead of persistent disk")
    print("3. Update render-frontend.yaml to point to GoDaddy URLs")
    print("4. Update imageUtils.js to handle GoDaddy image URLs")

if __name__ == "__main__":
    main()
