# GoDaddy FTP - Quick Start Guide

## Configuration Status ✅

Your GoDaddy FTP is **already configured** in `backend/.env`:

```
FTP Host: ftp.abaadexp.com
Username: d6qwckzmfjl9
Password: Samzami0$$
Directory: public_html/uploads
Base URL: abaadexp.com
```

## What's Changed?

### ✅ Backend (server.py)
- Already supports GoDaddy FTP
- Auto-detects credentials from environment variables
- Falls back to local uploads if FTP fails

### ✅ Frontend (imageUtils.js)
- Updated to work with GoDaddy image URLs
- Handles both GoDaddy and API upload URLs

### ✅ Deployment (render.yaml)
- Removed Render persistent disk
- Ready for GoDaddy FTP credentials

## To Deploy on Render

1. Go to: https://dashboard.render.com

2. Select **ecommerce-api** service

3. Click **Environment** tab

4. Add these variables:
   ```
   GODADDY_FTP_HOST=ftp.abaadexp.com
   GODADDY_FTP_USERNAME=d6qwckzmfjl9
   GODADDY_FTP_PASSWORD=Samzami0$$
   GODADDY_FTP_DIR=public_html/uploads
   GODADDY_BASE_URL=abaadexp.com
   GODADDY_PUBLIC_PATH=/uploads
   ```

5. Deploy:
   ```bash
   git push
   ```

6. Test upload in admin panel

## How It Works

```
User uploads image
        ↓
Backend checks: GoDaddy credentials available?
        ├─ YES → Upload to GoDaddy FTP
        │        ↓
        │        Return: https://abaadexp.com/uploads/file.jpg
        │
        └─ NO → Save to local uploads/ directory
                 ↓
                 Return: https://backend.com/api/uploads/file.jpg
```

## Test Locally

```bash
cd /Users/salehazzmzmi/Documents/GitHub/zakimart
python3 -m venv venv
source venv/bin/activate
pip install python-dotenv
python3 test_godaddy_ftp.py
```

## Verify Upload Works

1. Log in as admin: `admin@ecommerce.com` / `admin123`
2. Go to: Admin → Products → Edit any product
3. Upload an image
4. Check that image URL is: `https://abaadexp.com/uploads/filename.jpg`
5. Verify image displays on product page

## Image URLs Format

**GoDaddy FTP:**
```
https://abaadexp.com/uploads/550e8400-e29b-41d4-a716-446655440000.jpg
```

**Local Fallback:**
```
https://your-backend.com/api/uploads/550e8400-e29b-41d4-a716-446655440000.jpg
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "GoDaddy FTP is not configured" | Add environment variables to Render Dashboard |
| FTP connection timeout locally | Normal - works when deployed to Render |
| Images show 404 | Verify `https://abaadexp.com` is accessible |
| Images uploading slowly | Normal for FTP - consider smaller image sizes |

## Files Modified

- ✅ `render.yaml` - Removed persistent disk config
- ✅ `frontend/src/lib/imageUtils.js` - Updated URL handling

## Files Created

- ✅ `test_godaddy_ftp.py` - FTP connection test
- ✅ `GODADDY_FTP_SETUP.md` - Detailed setup guide
- ✅ `GODADDY_FTP_MIGRATION_SUMMARY.txt` - Full migration summary

## Benefits

| Feature | Before | After |
|---------|--------|-------|
| Storage | 1 GB (Render) | Unlimited (GoDaddy) |
| Persistence | Depends on disk | Permanent on GoDaddy |
| Cost | Included | Included with hosting |
| Setup | Complex | Simple (env vars) |

## Need Help?

- **Setup questions:** See `GODADDY_FTP_SETUP.md`
- **Detailed migration:** See `GODADDY_FTP_MIGRATION_SUMMARY.txt`
- **Test connection:** Run `test_godaddy_ftp.py`
- **GoDaddy support:** Contact GoDaddy for FTP access issues
