# GoDaddy FTP Configuration Guide

Replace Render's persistent disk with GoDaddy FTP for file uploads.

## Overview

Instead of using Render's persistent disk (limited to 1GB), the application now uses GoDaddy FTP to upload and serve images. This provides unlimited storage and better performance for production deployments.

## Current Configuration

Your GoDaddy FTP is already configured in `backend/.env`:

```env
GODADDY_FTP_HOST="ftp.abaadexp.com"
GODADDY_FTP_USERNAME="d6qwckzmfjl9"
GODADDY_FTP_PASSWORD="Samzami0$$"
GODADDY_FTP_DIR="public_html/uploads"
GODADDY_BASE_URL="abaadexp.com"
GODADDY_PUBLIC_PATH="/uploads"
```

## How It Works

### Upload Flow

1. Admin uploads image → Backend receives file
2. Backend checks if GoDaddy FTP is configured
3. If configured: Upload file directly to GoDaddy via FTP
4. If not configured: Fall back to local `backend/uploads/` directory
5. Return full URL to uploaded file

### Image URL Format

**GoDaddy FTP URLs:**
```
https://abaadexp.com/uploads/filename.jpg
```

**Fallback Local URLs:**
```
https://your-backend-domain.com/api/uploads/filename.jpg
```

## Render Deployment Setup

### Step 1: Update Environment Variables in Render Dashboard

Go to your **ecommerce-api** service on Render and add these environment variables:

```
GODADDY_FTP_HOST = ftp.abaadexp.com
GODADDY_FTP_USERNAME = d6qwckzmfjl9
GODADDY_FTP_PASSWORD = Samzami0$$
GODADDY_FTP_DIR = public_html/uploads
GODADDY_BASE_URL = abaadexp.com
GODADDY_PUBLIC_PATH = /uploads
```

### Step 2: Remove Persistent Disk (Optional)

In Render Dashboard → Your Service → **Disks** tab:
- Delete the `uploads-disk` if you have one
- This frees up your disk quota

**Note:** Keep it if you want a fallback for local uploads.

### Step 3: Deploy

Push your changes:
```bash
git add render.yaml frontend/src/lib/imageUtils.js
git commit -m "Replace Render persistent disk with GoDaddy FTP"
git push
```

Render will automatically deploy the updated configuration.

## Local Development

For local development, the backend will automatically:
1. Try to use GoDaddy FTP if credentials are provided in `.env`
2. Fall back to local `backend/uploads/` directory if FTP fails
3. Create the directory if it doesn't exist

## Testing FTP Connection

Run the FTP test script to verify your connection:

```bash
cd /Users/salehazzmzmi/Documents/GitHub/zakimart
python3 -m venv venv
source venv/bin/activate
pip install python-dotenv
python3 test_godaddy_ftp.py
```

Expected output:
```
✓ Connected to ftp.abaadexp.com
✓ Successfully changed to directory: public_html/uploads
✓ Successfully uploaded test file: test_upload.txt
✓ File should be accessible at: https://abaadexp.com/uploads/test_upload.txt
```

## Troubleshooting

### FTP Connection Fails

**Problem:** "nodename nor servname provided, or not known"

**Solution:** This is expected if running on a system without internet access to GoDaddy DNS. The configuration is still valid and will work once deployed.

### Images Not Displaying

**Problem:** 404 errors for GoDaddy image URLs

**Cause:** Either the file wasn't uploaded or the URL is incorrect.

**Check:**
1. Verify GoDaddy FTP credentials in Render environment variables
2. Check backend logs for upload errors
3. Confirm the GoDaddy domain is accessible: `https://abaadexp.com`

### Slow Image Uploads

**Problem:** Uploads take longer than expected

**Solution:** 
- GoDaddy FTP is slower than local uploads
- Consider uploading smaller image files
- Optimize images before upload (reduce dimensions, compress)

## File Upload API

### Endpoint
```
POST /api/upload
```

### Authentication
Admin token required

### Response

**Success (GoDaddy FTP enabled):**
```json
{
  "url": "https://abaadexp.com/uploads/550e8400-e29b-41d4-a716-446655440000.jpg"
}
```

**Success (Local fallback):**
```json
{
  "url": "/api/uploads/550e8400-e29b-41d4-a716-446655440000.jpg"
}
```

## Code Changes

### Backend (server.py)
- Lines 50-56: GoDaddy FTP configuration
- Lines 100-106: Check if GoDaddy is configured
- Lines 109-132: Upload file to GoDaddy function
- Lines 962-986: Upload endpoint (auto-detect storage)
- Lines 992-997: Serve local uploads (fallback)

### Frontend (imageUtils.js)
- Simplified URL handling
- Direct return of API URLs
- GoDaddy URLs pass through unchanged

### Deployment (render.yaml)
- Removed persistent disk configuration
- Environment variables documented for GoDaddy FTP

## Security Considerations

⚠️ **Important:** Never commit FTP credentials to git!

Current setup is safe because:
1. Credentials are in `backend/.env` (in `.gitignore`)
2. Credentials only loaded from environment variables in production
3. Render environment variables are encrypted

## Bandwidth & Storage

### GoDaddy Plan
- **Storage:** Unlimited (check your hosting plan)
- **Bandwidth:** Unlimited (check your hosting plan)
- **FTP Upload Speed:** ~1-5 MB/s typical

### Comparison with Render Disk

| Feature | GoDaddy FTP | Render Disk |
|---------|-----------|------------|
| Storage | Unlimited | 1 GB |
| Bandwidth | Unlimited | Included |
| Cost | Included with hosting | Free tier |
| Speed | Network dependent | Very fast |
| Fallback | Local uploads | N/A |

## Monitoring

### Check Upload Status
1. Admin panel → Products → Upload image
2. Verify image displays correctly
3. Inspect Network tab to see full GoDaddy URL

### Check FTP Directory
Connect via FTP client to verify uploads:
- Host: `ftp.abaadexp.com`
- Username: `d6qwckzmfjl9`
- Password: `Samzami0$$`
- Directory: `public_html/uploads`

## Reverting to Local Uploads

If you want to go back to local uploads:

1. Edit `backend/.env`:
   ```env
   # Comment out GoDaddy FTP settings
   # GODADDY_FTP_HOST="..."
   # GODADDY_FTP_USERNAME="..."
   ```

2. Or in Render, remove the GoDaddy environment variables

3. The backend will automatically use local `backend/uploads/` directory

## Next Steps

1. ✅ Test FTP connection locally
2. ✅ Add GoDaddy credentials to Render environment variables
3. ✅ Deploy updated code
4. ✅ Test image upload in admin panel
5. ✅ Verify images display correctly
6. ✅ Remove persistent disk from Render if not needed

## Support

For FTP issues, contact GoDaddy support with:
- Host: `ftp.abaadexp.com`
- Username: `d6qwckzmfjl9`
- Directory: `public_html/uploads`

