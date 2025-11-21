# GoDaddy FTP Architecture

## System Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          USER BROWSER                               │
│                                                                       │
│  Admin Panel                                                         │
│  (Upload Product Image)                                             │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │ POST /api/upload
                             │ + File + Auth Token
                             │
                             ↓
┌─────────────────────────────────────────────────────────────────────┐
│                     BACKEND (Render)                                │
│                                                                       │
│  /api/upload Endpoint                                               │
│  │                                                                    │
│  ├─→ Check: GoDaddy FTP Configured?                                 │
│  │                                                                    │
│  ├─ YES (if GODADDY_FTP_HOST env var exists)                       │
│  │  │                                                                │
│  │  └─→ upload_file_to_godaddy()                                    │
│  │      │                                                            │
│  │      ├─→ Connect to FTP                                          │
│  │      │   (ftp.abaadexp.com)                                      │
│  │      │                                                            │
│  │      ├─→ Authenticate                                            │
│  │      │   (d6qwckzmfjl9 / password)                               │
│  │      │                                                            │
│  │      ├─→ Change directory                                        │
│  │      │   (public_html/uploads)                                   │
│  │      │                                                            │
│  │      ├─→ Upload file                                             │
│  │      │   (uuid.jpg)                                              │
│  │      │                                                            │
│  │      └─→ Return URL                                              │
│  │          https://abaadexp.com/uploads/uuid.jpg                   │
│  │                                                                    │
│  │                                                                    │
│  └─ NO (if env vars not set)                                        │
│     │                                                                │
│     └─→ Save to Local Directory                                     │
│         │                                                            │
│         ├─→ Create directory if needed                              │
│         │   (backend/uploads)                                       │
│         │                                                            │
│         ├─→ Write file to disk                                      │
│         │   (uuid.jpg)                                              │
│         │                                                            │
│         └─→ Return URL                                              │
│             /api/uploads/uuid.jpg                                   │
│                                                                       │
└────┬──────────────────────────────────────────────────────────┬────┘
     │                                                            │
     │ JSON Response:                                            │
     │ {"url": "..."}                                            │
     │                                                            │
     ↓                                                            ↓
    
┌────────────────────────────┐          ┌────────────────────────────┐
│  GoDaddy Hosting Server    │          │  Render Container Disk     │
│  (abaadexp.com)            │          │  (Ephemeral - lost on     │
│                            │          │   redeploy)                │
│  public_html/uploads/      │          │                            │
│  ├─ uuid1.jpg             │          │  backend/uploads/          │
│  ├─ uuid2.jpg             │          │  ├─ uuid1.jpg             │
│  ├─ uuid3.jpg             │          │  ├─ uuid2.jpg             │
│  └─ ...                   │          │  └─ ...                   │
│                            │          │                            │
│  (Permanent Storage)       │          │  (Temporary Fallback)      │
│  (Unlimited)              │          │  (Limited to Render)       │
└────────────────────────────┘          └────────────────────────────┘
     ↑                                              ↑
     │ FTP Upload                                  │ Fallback
     │ (if credentials available)                  │ (if FTP fails)
     │                                              │
     └──────────────────────┬───────────────────────┘
                            │
                   ┌────────┴────────┐
                   │                 │
                   │ Store URL:      │
                   │ GoDaddy or API  │
                   │                 │
                   └────────┬────────┘
                            │
                            │ Save to MongoDB
                            │
                            ↓
                   ┌─────────────────┐
                   │   MongoDB       │
                   │                 │
                   │  Products       │
                   │  ├─ id          │
                   │  ├─ name        │
                   │  ├─ image_url ──┼──→ Stored URL
                   │  └─ ...         │
                   │                 │
                   └─────────────────┘


       Frontend Image Display
       ├─ getImageUrl(image_url)
       │  ├─ If starts with http: return as-is
       │  ├─ If /api/uploads: return backend_url + path
       │  └─ If relative: prepend backend_url
       │
       └─→ <img src={finalUrl} />
           Display image from GoDaddy or Render API
```

## Environment Variables

### Local Development (backend/.env)

```env
# GoDaddy FTP Configuration
GODADDY_FTP_HOST=ftp.abaadexp.com
GODADDY_FTP_USERNAME=d6qwckzmfjl9
GODADDY_FTP_PASSWORD=Samzami0$$
GODADDY_FTP_DIR=public_html/uploads
GODADDY_BASE_URL=abaadexp.com
GODADDY_PUBLIC_PATH=/uploads
```

### Production (Render Dashboard)

```
Environment Variables to set in Render:

GODADDY_FTP_HOST        = ftp.abaadexp.com
GODADDY_FTP_USERNAME    = d6qwckzmfjl9
GODADDY_FTP_PASSWORD    = Samzami0$$
GODADDY_FTP_DIR         = public_html/uploads
GODADDY_BASE_URL        = abaadexp.com
GODADDY_PUBLIC_PATH     = /uploads

(Plus existing: MONGO_URL, DB_NAME, CORS_ORIGINS, JWT_SECRET)
```

## Data Flow - Image Upload

```
1. BROWSER (Admin)
   └─→ Select file & click "Upload"

2. FRONTEND (React)
   └─→ POST /api/upload with FormData
       (file + Bearer token)

3. BACKEND API
   └─→ @app.post("/api/upload")
       ├─ Verify admin authentication
       ├─ Generate unique filename (uuid.jpg)
       └─ Read file content

4. DECISION POINT
   └─→ if _godaddy_configured():
       │   ├─ Try GoDaddy FTP upload
       │   ├─ Return: https://abaadexp.com/uploads/uuid.jpg
       │   └─ Store in MongoDB
       │
       └─ else:
           ├─ Save to backend/uploads/uuid.jpg
           ├─ Return: /api/uploads/uuid.jpg
           └─ Store in MongoDB

5. RESPONSE
   └─→ {"url": "https://abaadexp.com/uploads/uuid.jpg"}
       │
       └─→ Frontend receives URL
           └─→ Save in product document

6. DISPLAY
   └─→ Product page requests product data
       │
       └─→ Product data includes image_url
           │
           └─→ Frontend calls getImageUrl(image_url)
               │
               └─→ Returns full URL
                   │
                   └─→ <img src={finalUrl} />
                       │
                       └─→ Browser displays image
                           from GoDaddy or Render API
```

## Data Flow - Image Display

```
1. USER (Browser)
   └─→ Load Product Page

2. FRONTEND
   └─→ GET /api/products/{id}

3. BACKEND
   └─→ Query MongoDB
       └─→ Return Product with image_url field
           (e.g., "https://abaadexp.com/uploads/uuid.jpg"
            or "/api/uploads/uuid.jpg")

4. FRONTEND PROCESSING
   └─→ imageUtils.js getImageUrl(imageUrl)
       │
       ├─ If URL is external (http/https)
       │  └─→ Return as-is
       │       (e.g., https://abaadexp.com/uploads/uuid.jpg)
       │
       ├─ If URL is /api/uploads/
       │  └─→ Return backendUrl + path
       │       (e.g., https://backend.render.com/api/uploads/uuid.jpg)
       │
       └─ Otherwise prepend backend URL

5. BROWSER
   └─→ <img src={processedUrl} />
       │
       ├─ If GoDaddy URL
       │  └─→ Fetch from abaadexp.com
       │
       └─ If API URL
           └─→ Fetch from backend.render.com
               (backend serves from local disk)
```

## Storage Comparison

### GoDaddy FTP
```
✓ Permanent storage
✓ Unlimited capacity (check hosting plan)
✓ Redundant backups
✓ Easy to manage via FTP client
✓ Can access files directly via FTP
✓ No Render quota used
✗ Slower upload speed (network dependent)
✗ Requires FTP credentials
```

### Render Persistent Disk
```
✓ Fast local storage
✓ No additional setup needed
✓ Integrated with Render
✗ Limited to 1 GB
✗ Only works on paid Render plans
✗ Takes Render quota
✗ Lost if disk removed
```

### Local Ephemeral Storage (Render)
```
✓ Very fast
✓ Free
✗ Lost on redeploy
✗ No persistence
✗ Not suitable for production
```

## Configuration Checklist

### For Local Development

- [x] GoDaddy FTP credentials in backend/.env
- [x] backend/server.py has FTP support
- [ ] Run `python3 test_godaddy_ftp.py` to verify

### For Production (Render)

- [ ] Push code changes:
  ```bash
  git add render.yaml frontend/src/lib/imageUtils.js
  git commit -m "Configure GoDaddy FTP"
  git push
  ```

- [ ] Add 6 environment variables to Render service:
  - GODADDY_FTP_HOST
  - GODADDY_FTP_USERNAME
  - GODADDY_FTP_PASSWORD
  - GODADDY_FTP_DIR
  - GODADDY_BASE_URL
  - GODADDY_PUBLIC_PATH

- [ ] (Optional) Delete Render persistent disk to free 1GB

- [ ] Wait for Render to redeploy

- [ ] Test image upload in admin panel

- [ ] Verify image displays with correct GoDaddy URL

## Fallback Behavior

If GoDaddy FTP fails for any reason:

```
Admin uploads image
    │
    ├─→ Attempt GoDaddy FTP upload
    │   │
    │   └─→ Connection fails (error logged)
    │
    └─→ Automatic fallback:
        ├─→ Save to backend/uploads/ locally
        ├─→ Return /api/uploads/uuid.jpg
        ├─→ Image stays in MongoDB
        │
        └─→ On next Render redeploy:
            ├─→ Image lost (ephemeral storage)
            │
            └─→ RECOMMENDATION:
                Fix FTP credentials or keep Render disk
```

## Security

- Credentials stored in environment variables only
- Never in version control (backend/.env in .gitignore)
- Render encrypts environment variables
- FTP password is secure
- No credentials logged
- API requires authentication token
- Images served directly from GoDaddy or Render API

