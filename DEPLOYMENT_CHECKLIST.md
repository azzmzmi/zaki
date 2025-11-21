# GoDaddy FTP Deployment Checklist

Use this checklist to ensure smooth deployment of GoDaddy FTP configuration.

## Pre-Deployment

- [ ] Read `GODADDY_FTP_QUICK_START.md`
- [ ] Verify GoDaddy FTP credentials are correct:
  - [ ] Host: `ftp.abaadexp.com`
  - [ ] Username: `d6qwckzmfjl9`
  - [ ] Directory: `public_html/uploads`
- [ ] Backend `server.py` reviewed (no changes needed)
- [ ] Frontend `imageUtils.js` updated

## Deployment Steps

### Step 1: Commit & Push Code

```bash
git status  # Should show render.yaml and imageUtils.js as modified
git add render.yaml frontend/src/lib/imageUtils.js
git commit -m "Replace Render persistent disk with GoDaddy FTP"
git push
```

- [ ] Files committed
- [ ] Push completed successfully
- [ ] No merge conflicts

### Step 2: Configure Render Environment Variables

Access: https://dashboard.render.com

1. [ ] Navigate to `ecommerce-api` service
2. [ ] Click `Environment` tab
3. [ ] Add these 6 environment variables:

   ```
   GODADDY_FTP_HOST=ftp.abaadexp.com
   GODADDY_FTP_USERNAME=d6qwckzmfjl9
   GODADDY_FTP_PASSWORD=Samzami0$$
   GODADDY_FTP_DIR=public_html/uploads
   GODADDY_BASE_URL=abaadexp.com
   GODADDY_PUBLIC_PATH=/uploads
   ```

4. [ ] Click `Save`
5. [ ] Verify all variables are visible in the list

### Step 3: Monitor Deployment

1. [ ] Go to `Events` tab in Render service
2. [ ] Watch for redeploy to start (should be automatic)
3. [ ] Wait for deployment to complete (2-5 minutes)
4. [ ] Check for any error messages in deployment logs

Expected logs:
- `Building image`
- `Running build command`
- `Starting service`

- [ ] Deployment completed without errors
- [ ] Service shows as "Live" status

### Step 4: Test Image Upload

1. [ ] Open admin panel (or restart browser to clear cache)
2. [ ] Login with: `admin@ecommerce.com` / `admin123`
3. [ ] Navigate to: `Admin` → `Products` → `Edit Product`
4. [ ] Upload a test image
5. [ ] Check the returned URL:
   - [ ] Should start with `https://abaadexp.com/uploads/`
   - [ ] Should NOT be `/api/uploads/` (that means FTP failed)

6. [ ] Verify image displays on product page
7. [ ] Test with different file types:
   - [ ] JPG image
   - [ ] PNG image
   - [ ] WebP image (if supported)

## Post-Deployment Verification

### Local Testing
```bash
# Test FTP connection (optional, for diagnostic purposes)
python3 -m venv venv
source venv/bin/activate
pip install python-dotenv
python3 test_godaddy_ftp.py
```

- [ ] Test script runs (may show connection issues if no internet)
- [ ] Configuration is validated

### Production Verification
- [ ] Upload multiple images
- [ ] Verify all URLs use GoDaddy domain
- [ ] Check images display correctly on product pages
- [ ] Test on different browsers/devices
- [ ] Mobile responsive display works

### Optional Cleanup
- [ ] Remove Render persistent disk if not needed:
  - [ ] Go to `Disks` tab
  - [ ] Delete `uploads-disk`
  - [ ] Confirms 1GB freed up in quota

## Rollback Plan (If Needed)

If something goes wrong, you can revert to the previous configuration:

1. [ ] Revert code changes:
   ```bash
   git revert HEAD
   git push
   ```

2. [ ] Restore Render disk:
   - [ ] Go to Render service → `Disks`
   - [ ] Create disk `uploads-disk` at `/opt/render/project/src/backend/uploads`
   - [ ] Size: 1GB

3. [ ] Re-add environment variable:
   - [ ] Go to `Environment` tab
   - [ ] Add: `UPLOADS_DIR=/opt/render/project/src/backend/uploads`

4. [ ] Wait for redeploy to complete

## Troubleshooting

### Issue: Images return `/api/uploads/` URLs instead of GoDaddy URLs

**Cause:** GoDaddy FTP credentials not configured

**Solution:**
1. [ ] Verify all 6 environment variables are set in Render
2. [ ] Check variable names are exactly correct (case-sensitive)
3. [ ] Verify passwords don't have special characters that need escaping
4. [ ] Redeploy service

### Issue: FTP Connection Timeout

**Cause:** Network cannot reach `ftp.abaadexp.com`

**Solution:**
1. [ ] This is normal for local testing
2. [ ] Verify connection works when deployed to Render
3. [ ] Check Render logs for FTP errors

### Issue: 404 Error on GoDaddy Image URLs

**Cause:** File not uploaded to GoDaddy or URL format incorrect

**Solution:**
1. [ ] Verify `abaadexp.com` domain is accessible
2. [ ] Check FTP directory exists: `public_html/uploads`
3. [ ] Review Render logs for upload errors
4. [ ] Test FTP manually with FTP client

### Issue: Images display but very slowly

**Cause:** GoDaddy FTP server responding slowly

**Solution:**
1. [ ] This is expected during high load periods
2. [ ] Consider optimizing image file sizes
3. [ ] Compress images before upload
4. [ ] Monitor GoDaddy server performance

## Testing Checklist

### Upload Tests
- [ ] Upload 100KB JPG image
- [ ] Upload 500KB PNG image
- [ ] Upload multiple images at once
- [ ] Upload special characters in filename
- [ ] Test with different image dimensions

### Display Tests
- [ ] Product page loads correctly
- [ ] Images lazy-load properly
- [ ] Images responsive on mobile
- [ ] Images responsive on tablet
- [ ] Images responsive on desktop

### Edge Cases
- [ ] Empty filename handling
- [ ] Very large file upload (>50MB)
- [ ] Invalid image file
- [ ] Concurrent uploads

## Documentation

- [ ] Team informed of changes
- [ ] Documentation files created and reviewed:
  - [ ] `GODADDY_FTP_QUICK_START.md`
  - [ ] `GODADDY_FTP_SETUP.md`
  - [ ] `GODADDY_FTP_ARCHITECTURE.md`
  - [ ] `GODADDY_FTP_MIGRATION_SUMMARY.txt`

## Success Criteria

✅ All checkboxes completed when:

1. [ ] Code deployed successfully
2. [ ] All environment variables configured in Render
3. [ ] Service redeployed and shows as "Live"
4. [ ] Test image uploaded successfully
5. [ ] Image URL uses GoDaddy domain
6. [ ] Image displays correctly on product page
7. [ ] No errors in Render logs

## Sign-Off

- [ ] Deployment completed successfully
- [ ] All tests passed
- [ ] Team notified
- [ ] Documentation reviewed

**Deployed By:** ___________________  
**Date:** ___________________  
**Notes:** ___________________________________________________

---

For more information, see `GODADDY_FTP_README.txt`
