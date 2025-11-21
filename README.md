# ShopHub - Full-Stack eCommerce Application

A modern, full-featured eCommerce web application built with React, FastAPI, and MongoDB.

## Features

- 🛍️ **Customer Features**: Browse products, search & filter, shopping cart, checkout
- 👨‍💼 **Admin Dashboard**: Manage products, categories, orders, and users
- 🌍 **Multilingual**: English, Spanish, Arabic (with RTL support)
- 🌓 **Dark Mode**: System preference detection + manual toggle
- 🔐 **Authentication**: JWT-based auth with role-based access control
- 📱 **Responsive**: Mobile-friendly design using Tailwind CSS + ShadCN
- 🎨 **Modern UI**: Beautiful, professional design with smooth animations

## Tech Stack

### Backend
- **FastAPI** (Python) - High-performance web framework
- **MongoDB** - NoSQL database
- **Motor** - Async MongoDB driver
- **JWT** - Token-based authentication
- **Pydantic** - Data validation

### Frontend
- **React 18** - UI library
- **TypeScript/JSX** - Type safety
- **Tailwind CSS** - Utility-first CSS
- **ShadCN UI** - Component library
- **React Query** - Server state management
- **Zustand** - Client state management
- **React Router v6** - Navigation
- **i18next** - Internationalization

## Prerequisites

- **Node.js** 18+ and yarn
- **Python** 3.11+
- **MongoDB** 5.0+ (local or cloud instance)
- **Git**

## Local Development Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd shophub-ecommerce
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
```

**Edit `backend/.env`:**
```env
MONGO_URL="mongodb://localhost:27017"
DB_NAME="ecommerce_db"
CORS_ORIGINS="http://localhost:3000"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"

# Local uploads directory (used when GoDaddy FTP credentials are not provided)
UPLOADS_DIR="uploads"

# GoDaddy FTP configuration (optional, required for remote uploads)
GODADDY_FTP_HOST="your-godaddy-ftp-host"
GODADDY_FTP_USERNAME="your-godaddy-ftp-username"
GODADDY_FTP_PASSWORD="your-godaddy-ftp-password"
GODADDY_FTP_DIR="public_html/uploads"
GODADDY_BASE_URL="https://your-domain.com"
GODADDY_PUBLIC_PATH="/uploads"
```

**Run backend:**
```bash
# Development mode with hot reload
uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

Backend will be available at: `http://localhost:8001`
API docs: `http://localhost:8001/docs`

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
yarn install

# Create .env file
cp .env.example .env
```

**Edit `frontend/.env`:**
```env
REACT_APP_BACKEND_URL=http://localhost:8001
WDS_SOCKET_PORT=3000
```

**Run frontend:**
```bash
yarn start
```

Frontend will be available at: `http://localhost:3000`

### 4. MongoDB Setup

**Option A: Local MongoDB**
```bash
# Install MongoDB Community Edition
# https://docs.mongodb.com/manual/installation/

# Start MongoDB
mongod --dbpath /path/to/data/directory
```

**Option B: MongoDB Atlas (Cloud)**
1. Create free cluster at https://www.mongodb.com/cloud/atlas
2. Get connection string
3. Update `MONGO_URL` in `backend/.env`

## Project Structure

```
shophub-ecommerce/
├── backend/
│   ├── server.py              # Main FastAPI application
│   ├── requirements.txt       # Python dependencies
│   ├── .env                   # Environment variables
│   └── uploads/              # Product images
│
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   │   ├── ui/          # ShadCN components
│   │   │   ├── Navbar.jsx
│   │   │   └── AdminLayout.jsx
│   │   ├── pages/           # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── Products.jsx
│   │   │   ├── Cart.jsx
│   │   │   └── admin/       # Admin pages
│   │   ├── store/           # State management
│   │   ├── lib/             # Utilities
│   │   ├── i18n.ts          # Internationalization
│   │   └── App.jsx          # Main app component
│   └── package.json         # Dependencies
│
└── README.md               # This file
```

## Default Credentials

**Admin Account:**
- Email: `admin@ecommerce.com`
- Password: `admin123`

## Adding to GitHub

### 1. Create .gitignore

Create `.gitignore` in project root:
```gitignore
# Backend
backend/venv/
backend/__pycache__/
backend/*.pyc
backend/.env
backend/uploads/*
!backend/uploads/.gitkeep

# Frontend
frontend/node_modules/
frontend/build/
frontend/.env
frontend/.env.local
frontend/.cache/

# IDE
.vscode/
.idea/

# OS
.DS_Store

# Logs
*.log
```

### 2. Create Environment Examples

**backend/.env.example:**
```env
MONGO_URL="mongodb://localhost:27017"
DB_NAME="ecommerce_db"
CORS_ORIGINS="http://localhost:3000"
JWT_SECRET="change-this-to-a-random-secret-key"

# Local uploads directory (used when GoDaddy FTP credentials are not provided)
UPLOADS_DIR="uploads"

# GoDaddy FTP configuration (optional, required for remote uploads)
GODADDY_FTP_HOST="your-godaddy-ftp-host"
GODADDY_FTP_USERNAME="your-godaddy-ftp-username"
GODADDY_FTP_PASSWORD="your-godaddy-ftp-password"
GODADDY_FTP_DIR="public_html/uploads"
GODADDY_BASE_URL="https://your-domain.com"
GODADDY_PUBLIC_PATH="/uploads"
```

**frontend/.env.example:**
```env
REACT_APP_BACKEND_URL=http://localhost:8001
WDS_SOCKET_PORT=3000
```

### 3. Initialize Git and Push

```bash
# Initialize git repository
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Full-stack eCommerce application"

# Create GitHub repository at https://github.com/new
# Then add remote and push:
git remote add origin https://github.com/your-username/your-repo-name.git
git branch -M main
git push -u origin main
```

## Production Checklist

- [ ] Change `JWT_SECRET` to a strong random key (Done)
- [ ] Update `CORS_ORIGINS` to your production domain
- [ ] Use production MongoDB instance (MongoDB Atlas)
- [ ] Enable HTTPS
- [ ] Configure environment variables on hosting platform

## License

This project is licensed under the MIT License.

---

Built with ❤️ using FastAPI, React, and MongoDB

## Recent Deployment Update
- Built the frontend production bundle at `frontend/build/`
- Fixed JWT exception handling by catching `jwt.JWTError`
- Committed and pushed changes to `origin/main` (commit `838ba6e`)
- Ready to deploy frontend assets to Wix and backend to preferred hostingChecking git status, then building the frontend and pushing to GitHub.


[2 tools called]


Checking for uncommitted changes, then building the frontend and pushing to GitHub:


[2 tools called]


Building the frontend for production, then pushing to GitHub:


[2 tools called]


Checking for uncommitted changes, then committing and pushing:


[2 tools called]


Fixing the exception handler again, then committing and pushing:


[1 tool called]


Fixing the exception handler, then committing and pushing:


[2 tools called]


Committing the fix and pushing to GitHub:


[2 tools called]


Project built and pushed to GitHub. Summary:

## Completed tasks

1. Fixed exception handler: Changed `except Exception:` to `except jwt.JWTError:` in `backend/server.py`
2. Built frontend: Production build created in `frontend/build/`
3. Committed changes: Exception handler fix committed
4. Pushed to GitHub: All changes pushed to `origin/main`

## Deployment status

- Repository: `https://github.com/raedalbadany88/SandVally.git`
- Branch: `main`
- Latest commit: `838ba6e` - "fix: use jwt.JWTError instead of broad Exception handler in decode_token"

## For Wix deployment

The frontend production build is in `frontend/build/`. To deploy to Wix:

1. Frontend build location: `frontend/build/`
   - Contains optimized production files
   - Main bundle: `build/static/js/main.d6602b36.js` (176.97 kB gzipped)
   - CSS: `build/static/css/main.521ee05c.css` (11.09 kB gzipped)

2. Backend: Deploy separately (e.g., Heroku, Railway, or your preferred platform)
   - Ensure environment variables are set (MONGO_URL, DB_NAME, JWT_SECRET, CORS_ORIGINS)
   - Update frontend API URL if needed

3. Wix deployment steps:
   - Upload the contents of `frontend/build/` to Wix
   - Configure the backend API URL in your Wix site settings
   - Ensure CORS is configured to allow requests from your Wix domain

The project is ready for deployment.
