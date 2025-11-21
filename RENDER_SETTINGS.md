# Render Deployment Settings Guide

Complete guide for configuring your Zaki Mart application on Render.

## 🔐 Required Environment Variables

### Backend Service (ecommerce-api)

Add these environment variables in Render Dashboard → Your Service → Environment:

#### Required Variables:
```env
MONGO_URL=mongodb+srv://zaki:Samzami0$@zaki.bqkwo4e.mongodb.net/
DB_NAME=sv
CORS_ORIGINS=http://localhost:3000,https://your-frontend-domain.com
JWT_SECRET=your-strong-random-secret-key-here
UPLOADS_DIR=/opt/render/project/src/backend/uploads
PYTHON_VERSION=3.11
OPENAI_API_KEY=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
```

#### Variable Descriptions:

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URL` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/` |
| `DB_NAME` | Database name | `sv` or `zakimart` |
| `CORS_ORIGINS` | Allowed frontend origins (comma-separated) | `https://zakimart.com,https://www.zakimart.com` |
| `JWT_SECRET` | Secret key for JWT tokens (generate a strong random string) | Use a secure random string generator |
| `UPLOADS_DIR` | Path for uploaded images (persistent disk) | `/opt/render/project/src/backend/uploads` |
| `OPENAI_API_KEY` | OpenAI API key for ChatGPT integration | Your OpenAI API key |

### Frontend Service (sandvally-frontend)

```env
REACT_APP_BACKEND_URL=https://your-backend-service.onrender.com
```

---

## 📋 Render Service Configuration

### Backend Service Settings

**Service Name:** `ecommerce-api`

**Configuration:**
- **Type:** Web Service
- **Environment:** Python 3
- **Region:** Oregon (us-west-2)
- **Plan:** Free (or choose your plan)
- **Python Version:** 3.11
- **Build Command:** `bash ./build.sh`
- **Start Command:** `cd backend && uvicorn server:app --host 0.0.0.0 --port $PORT`
- **Health Check Path:** `/api/analytics`

**Persistent Disk:**
- **Name:** `uploads-disk`
- **Mount Path:** `/opt/render/project/src/backend/uploads`
- **Size:** 1 GB (free tier limit)

### Frontend Service Settings

**Service Name:** `sandvally-frontend`

**Configuration:**
- **Type:** Web Service
- **Environment:** Node
- **Region:** Oregon (us-west-2)
- **Plan:** Free
- **Node Version:** 18
- **Build Command:** `cd frontend && yarn install && yarn build`
- **Start Command:** `cd frontend && npx serve -s build -l 3000`

---

## 🚀 Setup Steps

### 1. Create Backend Service

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository: `azzmzmi/zaki`
4. Configure:
   - **Name:** `ecommerce-api`
   - **Region:** Oregon
   - **Branch:** `main` or `dev`
   - **Root Directory:** Leave empty (root)
   - **Environment:** Python 3
   - **Build Command:** `bash ./build.sh`
   - **Start Command:** `cd backend && uvicorn server:app --host 0.0.0.0 --port $PORT`

### 2. Add Environment Variables

In the service dashboard, go to **Environment** tab and add all variables listed above.

### 3. Add Persistent Disk

1. Go to **Disks** tab
2. Click **"Add Disk"**
3. Configure:
   - **Name:** `uploads-disk`
   - **Mount Path:** `/opt/render/project/src/backend/uploads`
   - **Size:** 1 GB

### 4. Create Frontend Service

1. Click **"New +"** → **"Web Service"**
2. Connect same repository: `azzmzmi/zaki`
3. Configure:
   - **Name:** `sandvally-frontend`
   - **Region:** Oregon
   - **Branch:** `main` or `dev`
   - **Root Directory:** Leave empty
   - **Environment:** Node
   - **Build Command:** `cd frontend && yarn install && yarn build`
   - **Start Command:** `cd frontend && npx serve -s build -l 3000`
   - **Add Environment Variable:**
     - `REACT_APP_BACKEND_URL` = Your backend service URL

---

## 🔧 Configuration Files

### render.yaml (Backend)

Your `render.yaml` file is already configured. Key settings:

```yaml
services:
  - type: web
    name: ecommerce-api
    env: python
    region: oregon
    plan: free
    pythonVersion: 3.11
    buildCommand: bash ./build.sh
    startCommand: cd backend && uvicorn server:app --host 0.0.0.0 --port $PORT
    disk:
      name: uploads-disk
      mountPath: /opt/render/project/src/backend/uploads
      sizeGB: 1
```

### render-frontend.yaml (Frontend)

```yaml
services:
  - type: web
    name: sandvally-frontend
    env: node
    nodeVersion: 18
    buildCommand: cd frontend && yarn install && yarn build
    startCommand: cd frontend && npx serve -s build -l 3000
```

---

## 🔑 Generating Secure JWT Secret

Generate a strong JWT secret:

```bash
# Using Python
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Using OpenSSL
openssl rand -base64 32

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Important:** Never commit the JWT secret to git! Only store it in Render environment variables.

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] Backend service is running (check `/health` endpoint)
- [ ] Frontend can connect to backend (check browser console)
- [ ] MongoDB connection works (check backend logs)
- [ ] File uploads work (test in admin panel)
- [ ] Images persist after redeploy (test upload → redeploy → check image)
- [ ] CORS is configured correctly (frontend can make API calls)
- [ ] Environment variables are set correctly
- [ ] Persistent disk is mounted

---

## 🔍 Troubleshooting

### Backend won't start?
- Check logs in Render dashboard
- Verify all required environment variables are set
- Ensure MongoDB connection string is correct
- Check Python version matches (3.11)

### Frontend can't connect to backend?
- Verify `REACT_APP_BACKEND_URL` is correct
- Check CORS_ORIGINS includes your frontend URL
- Ensure backend service is running
- Check browser console for CORS errors

### Images disappearing after deploy?
- Verify persistent disk is configured
- Check `UPLOADS_DIR` environment variable
- Ensure disk is mounted correctly
- Check disk space usage

### OpenAI API not working?
- Verify `OPENAI_API_KEY` is set correctly
- Check API key is valid and has credits
- Review backend logs for API errors

---

## 📝 Notes

1. **Free Tier Limitations:**
   - Services spin down after 15 minutes of inactivity
   - 1 GB persistent disk limit
   - Limited build time

2. **Custom Domain:**
   - Add custom domain in Render dashboard → Your Service → Settings
   - Update `CORS_ORIGINS` to include your custom domain

3. **Auto-Deploy:**
   - Render auto-deploys on push to configured branch
   - You can disable this in service settings

---

Last Updated: 2025-11-20

