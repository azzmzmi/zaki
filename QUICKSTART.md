# Quick Start Guide

Get ShopHub running on your local machine in 5 minutes!

## Step 1: Install Prerequisites

Make sure you have installed:
- Node.js 18+ (https://nodejs.org/)
- Python 3.11+ (https://www.python.org/)
- MongoDB 5.0+ (https://www.mongodb.com/try/download/community)
- Yarn (`npm install -g yarn`)

## Step 2: Clone and Setup

```bash
# Clone repository
git clone <your-repo-url>
cd shophub-ecommerce

# Backend setup
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env

# Frontend setup (in new terminal)
cd frontend
yarn install
cp .env.example .env
```

## Step 3: Start MongoDB

```bash
# Start MongoDB (if using local installation)
mongod

# Or use MongoDB Atlas cloud instance
# Update MONGO_URL in backend/.env with your connection string
```

## Step 4: Seed Database

```bash
# From backend directory with activated venv
python seed_database.py
```

This creates:
- Admin user: `admin@ecommerce.com` / `admin123`
- 4 categories
- 8 sample products

## Step 5: Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

**Terminal 2 - Frontend:**
```bash
cd frontend
yarn start
```

## Step 6: Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8001
- **API Docs:** http://localhost:8001/docs

## Step 7: Login

Use these credentials:
- **Admin:** admin@ecommerce.com / admin123
- **Customer:** Register a new account

## Common Issues

### Port Already in Use
```bash
# Change backend port
uvicorn server:app --reload --port 8002

# Kill process using port 3000 (Mac/Linux)
lsof -ti:3000 | xargs kill -9
```

### MongoDB Connection Error
```bash
# Make sure MongoDB is running
mongosh  # Should connect successfully
```

### Module Not Found (Frontend)
```bash
cd frontend
rm -rf node_modules yarn.lock
yarn install
```

## Next Steps

1. Explore the admin dashboard at http://localhost:3000/admin
2. Browse products and add items to cart
3. Test the checkout flow
4. Try switching languages (EN/ES/AR)
5. Toggle dark mode

## Need Help?

- Check the full [README.md](README.md)
- Review API documentation at http://localhost:8001/docs
- Create an issue on GitHub

Happy coding! 🚀
