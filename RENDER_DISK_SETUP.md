# Render Persistent Disk Setup Guide

## Problem
Uploaded product images disappear after each deploy because Render uses ephemeral storage by default.

## Solution
Add a persistent disk to your Render service to store uploaded images permanently.

---

## Method 1: Using render.yaml (Recommended)

The `render.yaml` file has been updated with disk configuration. Just push the changes:

```bash
git add .
git commit -m "Add persistent disk configuration for uploads"
git push
```

Render will automatically create the disk on next deploy.

---

## Method 2: Manual Setup via Render Dashboard

If you prefer to set it up manually through the Render dashboard:

### Step 1: Go to Your Service
1. Log in to [Render Dashboard](https://dashboard.render.com)
2. Select your **ecommerce-api** service

### Step 2: Add Disk
1. Click on **"Disks"** in the left sidebar
2. Click **"Add Disk"** button
3. Configure the disk:

#### Disk Configuration:
```
Name: uploads-disk
Mount Path: /opt/render/project/src/backend/uploads
Size: 1 GB
```

**Important Notes:**
- The mount path MUST be exactly: `/opt/render/project/src/backend/uploads`
- This is where your backend code stores uploaded files
- 1 GB is sufficient for product images (Free tier allows up to 1 GB)

### Step 3: Add Environment Variable
1. Go to **"Environment"** tab
2. Click **"Add Environment Variable"**
3. Add:
   ```
   Key: UPLOADS_DIR
   Value: /opt/render/project/src/backend/uploads
   ```

### Step 4: Redeploy
1. Go to **"Manual Deploy"** 
2. Click **"Deploy latest commit"**
3. Wait for deployment to complete

---

## Verification

After deployment, test the persistent storage:

1. **Upload a product image** through the admin panel
2. **Trigger a redeploy** (or wait for next auto-deploy)
3. **Check if image is still visible** after redeploy

If the image persists after redeploy, the disk is working correctly! ✅

---

## Technical Details

### What Changed:

**backend/server.py:**
- Now reads uploads directory from `UPLOADS_DIR` environment variable
- Falls back to local `uploads/` folder for development
- Creates directory with `parents=True` to handle nested paths

**render.yaml:**
- Added `disk` configuration with mount path
- Added `UPLOADS_DIR` environment variable

### File Paths:
- **Development:** `./backend/uploads/` (relative to project)
- **Production (Render):** `/opt/render/project/src/backend/uploads/` (persistent disk)

---

## Troubleshooting

### Images still disappearing?
1. Verify disk is mounted: Check Render dashboard → Disks
2. Check environment variable is set correctly
3. Look at deployment logs for any errors about the uploads directory
4. Ensure the mount path matches exactly: `/opt/render/project/src/backend/uploads`

### Can't upload images?
1. Check disk space usage in Render dashboard
2. Verify upload endpoint is working: Check backend logs
3. Test with curl: 
   ```bash
   curl -X POST https://your-app.onrender.com/api/upload \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -F "file=@/path/to/image.jpg"
   ```

### Disk full?
- Free tier: 1 GB max
- Paid tier: Can increase size
- Consider using external storage (S3, Cloudinary) for production

---

## Alternative: External Storage (Future Enhancement)

For production apps with many images, consider:

### Option A: AWS S3
- Unlimited storage
- CDN integration
- Pay only for what you use

### Option B: Cloudinary
- Image optimization built-in
- Automatic resizing
- Free tier: 25 GB storage

### Option C: ImgBB
- Free image hosting
- Simple API
- Good for demos

---

## Summary

**Quick Setup:**
1. ✅ Code updated to support persistent disk
2. ✅ render.yaml configured with disk settings
3. 📤 Push changes to trigger deploy
4. 🎉 Images will persist after deploys!

**Manual Setup in Dashboard:**
- Mount Path: `/opt/render/project/src/backend/uploads`
- Environment Variable: `UPLOADS_DIR=/opt/render/project/src/backend/uploads`
- Disk Size: 1 GB

---

Last Updated: 2025-11-14
