from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
from passlib.context import CryptContext
import aiofiles
from enum import Enum

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'raed123')
JWT_ALGORITHM = 'HS256'
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Create uploads directory
UPLOADS_DIR = ROOT_DIR / 'uploads'
UPLOADS_DIR.mkdir(exist_ok=True)

# Create the main app
app = FastAPI(title="eCommerce API", version="1.0.0")

# Add CORS middleware BEFORE routes
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=[origin.strip() for origin in os.environ.get('CORS_ORIGINS', '*').split(',')],
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Import for file serving
from fastapi.responses import FileResponse

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Enums
class UserRole(str, Enum):
    ADMIN = "admin"
    CUSTOMER = "customer"

class OrderStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"

# Models
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    full_name: str
    role: UserRole = UserRole.CUSTOMER
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    password: Optional[str] = None
    role: Optional[UserRole] = None

class PasswordReset(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: User

class Category(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None

class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    price: float
    category_id: str
    image_url: Optional[str] = None
    stock: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    category_id: str
    image_url: Optional[str] = None
    stock: int = 0

class OrderItem(BaseModel):
    product_id: str
    product_name: str
    quantity: int
    price: float

class AddressInfo(BaseModel):
    street_address: str
    city: str
    state: str
    zip_code: str
    country: str = "United States"
    phone: Optional[str] = None
    full_name: Optional[str] = None

class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    items: List[OrderItem]
    total: float
    status: OrderStatus = OrderStatus.PENDING
    shipping_address: AddressInfo
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class OrderCreate(BaseModel):
    items: List[OrderItem]
    total: float
    shipping_address: AddressInfo

class OrderStatusUpdate(BaseModel):
    status: OrderStatus

# Translation Models
class Translation(BaseModel):
    model_config = ConfigDict(extra="ignore")
    key: str
    en: str
    ar: str
    type: Optional[str] = None
    ref_id: Optional[str] = None
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TranslationCreate(BaseModel):
    key: str
    en: str
    ar: str
    type: Optional[str] = None
    ref_id: Optional[str] = None

# Helper functions
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

def create_refresh_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        logger.error(f"Token has expired: {token[:20]}...")
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.PyJWTError as e:
        logger.error(f"Invalid token: {str(e)}, token: {token[:20]}...")
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    token = credentials.credentials
    payload = decode_token(token)
    
    if payload.get("type") != "access":
        raise HTTPException(status_code=401, detail="Invalid token type")
    
    user_id = payload.get("user_id")
    user_data = await db.users.find_one({"id": user_id}, {"_id": 0})
    
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")
    
    if isinstance(user_data['created_at'], str):
        user_data['created_at'] = datetime.fromisoformat(user_data['created_at'])
    
    return User(**user_data)

async def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

# Auth Routes
@api_router.post("/auth/register", response_model=Token)
async def register(user_data: UserCreate):
    # Check if user exists
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user = User(
        email=user_data.email,
        full_name=user_data.full_name,
        role=UserRole.CUSTOMER
    )
    
    user_dict = user.model_dump()
    user_dict['created_at'] = user_dict['created_at'].isoformat()
    user_dict['password'] = hash_password(user_data.password)
    
    await db.users.insert_one(user_dict)
    
    # Generate tokens
    access_token = create_access_token({"user_id": user.id, "role": user.role})
    refresh_token = create_refresh_token({"user_id": user.id})
    
    return Token(access_token=access_token, refresh_token=refresh_token, user=user)

@api_router.post("/auth/login", response_model=Token)
async def login(credentials: UserLogin):
    user_data = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    
    if not user_data or not verify_password(credentials.password, user_data['password']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if isinstance(user_data['created_at'], str):
        user_data['created_at'] = datetime.fromisoformat(user_data['created_at'])
    
    user_data.pop('password')
    user = User(**user_data)
    
    access_token = create_access_token({"user_id": user.id, "role": user.role})
    refresh_token = create_refresh_token({"user_id": user.id})
    
    return Token(access_token=access_token, refresh_token=refresh_token, user=user)

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@api_router.put("/auth/profile", response_model=User)
async def update_profile(update_data: UserUpdate, current_user: User = Depends(get_current_user)):
    try:
        logger.info(f"Updating profile for user {current_user.id}")
        logger.info(f"Update data: {update_data}")
        
        update_dict = {}
        
        if update_data.full_name is not None:  # Allow empty string
            update_dict['full_name'] = update_data.full_name
        
        if update_data.password:
            update_dict['password'] = hash_password(update_data.password)
        
        if update_data.role and current_user.role == UserRole.ADMIN:
            update_dict['role'] = update_data.role
        
        logger.info(f"Update dict: {update_dict}")
        
        if update_dict:
            result = await db.users.update_one(
                {"id": current_user.id},
                {"$set": update_dict}
            )
            
            logger.info(f"Update result: matched={result.matched_count}, modified={result.modified_count}")
            
            if result.matched_count == 0:
                logger.error(f"User not found: {current_user.id}")
                raise HTTPException(status_code=404, detail="User not found")
        
        updated_user = await db.users.find_one({"id": current_user.id}, {"_id": 0, "password": 0})
        if not updated_user:
            logger.error(f"User not found after update: {current_user.id}")
            raise HTTPException(status_code=404, detail="User not found")
        
        if isinstance(updated_user['created_at'], str):
            updated_user['created_at'] = datetime.fromisoformat(updated_user['created_at'])
        
        logger.info(f"Profile updated successfully for user {current_user.id}")
        return User(**updated_user)
    
    except Exception as e:
        logger.error(f"Error updating profile for user {current_user.id}: {str(e)}")
        raise

@api_router.put("/auth/profile/{user_id}", response_model=User)
async def update_user_by_id(user_id: str, update_data: UserUpdate, admin: User = Depends(require_admin)):
    try:
        logger.info(f"Admin {admin.id} updating profile for user {user_id}")
        logger.info(f"Update data: {update_data}")
        
        update_dict = {}
        
        if update_data.full_name is not None:  # Allow empty string
            update_dict['full_name'] = update_data.full_name
        
        if update_data.password:
            update_dict['password'] = hash_password(update_data.password)
        
        if update_data.role:
            update_dict['role'] = update_data.role
        
        logger.info(f"Update dict: {update_dict}")
        
        if update_dict:
            result = await db.users.update_one(
                {"id": user_id},
                {"$set": update_dict}
            )
            
            logger.info(f"Update result: matched={result.matched_count}, modified={result.modified_count}")
            
            if result.matched_count == 0:
                logger.error(f"User not found: {user_id}")
                raise HTTPException(status_code=404, detail="User not found")
        
        updated_user = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0})
        if not updated_user:
            logger.error(f"User not found after update: {user_id}")
            raise HTTPException(status_code=404, detail="User not found")
        
        if isinstance(updated_user['created_at'], str):
            updated_user['created_at'] = datetime.fromisoformat(updated_user['created_at'])
        
        logger.info(f"Profile updated successfully for user {user_id} by admin {admin.id}")
        return User(**updated_user)
    
    except Exception as e:
        logger.error(f"Error updating profile for user {user_id} by admin {admin.id}: {str(e)}")
        raise

@api_router.post("/auth/forgot-password")
async def forgot_password(request: PasswordReset):
    user = await db.users.find_one({"email": request.email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    reset_token = jwt.encode(
        {"email": request.email, "type": "password_reset", "exp": datetime.now(timezone.utc) + timedelta(hours=1)},
        JWT_SECRET,
        algorithm=JWT_ALGORITHM
    )
    
    await db.password_resets.update_one(
        {"email": request.email},
        {"$set": {"token": reset_token, "created_at": datetime.now(timezone.utc).isoformat()}},
        upsert=True
    )
    
    return {"message": "Password reset token sent to email", "token": reset_token}

@api_router.post("/auth/reset-password")
async def reset_password(request: PasswordResetConfirm):
    try:
        payload = jwt.decode(request.token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "password_reset":
            raise HTTPException(status_code=400, detail="Invalid token type")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=400, detail="Reset token has expired")
    except jwt.PyJWTError:
        raise HTTPException(status_code=400, detail="Invalid reset token")
    
    email = payload.get("email")
    user = await db.users.find_one({"email": email})
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    hashed_password = hash_password(request.new_password)
    await db.users.update_one(
        {"email": email},
        {"$set": {"password": hashed_password}}
    )
    
    await db.password_resets.delete_one({"email": email})
    
    return {"message": "Password has been reset successfully"}

# Category Routes
@api_router.get("/categories", response_model=List[Category])
async def get_categories():
    categories = await db.categories.find({}, {"_id": 0}).to_list(1000)
    for cat in categories:
        if isinstance(cat['created_at'], str):
            cat['created_at'] = datetime.fromisoformat(cat['created_at'])
    return categories

@api_router.post("/categories", response_model=Category)
async def create_category(category_data: CategoryCreate, admin: User = Depends(require_admin)):
    category = Category(**category_data.model_dump())
    cat_dict = category.model_dump()
    cat_dict['created_at'] = cat_dict['created_at'].isoformat()
    await db.categories.insert_one(cat_dict)
    return category

@api_router.put("/categories/{category_id}", response_model=Category)
async def update_category(category_id: str, category_data: CategoryCreate, admin: User = Depends(require_admin)):
    result = await db.categories.update_one(
        {"id": category_id},
        {"$set": category_data.model_dump()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    
    updated = await db.categories.find_one({"id": category_id}, {"_id": 0})
    if not updated:
        raise HTTPException(status_code=404, detail="Category not found")
    if isinstance(updated['created_at'], str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    return Category(**updated)

@api_router.delete("/categories/{category_id}")
async def delete_category(category_id: str, admin: User = Depends(require_admin)):
    result = await db.categories.delete_one({"id": category_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    return {"message": "Category deleted"}

# Product Routes
@api_router.get("/products", response_model=List[Product])
async def get_products(category_id: Optional[str] = None, search: Optional[str] = None):
    query = {}
    if category_id:
        query["category_id"] = category_id
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]
    
    products = await db.products.find(query, {"_id": 0}).to_list(1000)
    for prod in products:
        if isinstance(prod['created_at'], str):
            prod['created_at'] = datetime.fromisoformat(prod['created_at'])
    return products

@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if isinstance(product['created_at'], str):
        product['created_at'] = datetime.fromisoformat(product['created_at'])
    return Product(**product)

@api_router.post("/products", response_model=Product)
async def create_product(product_data: ProductCreate, admin: User = Depends(require_admin)):
    product = Product(**product_data.model_dump())
    prod_dict = product.model_dump()
    prod_dict['created_at'] = prod_dict['created_at'].isoformat()
    await db.products.insert_one(prod_dict)
    return product

@api_router.put("/products/{product_id}", response_model=Product)
async def update_product(product_id: str, product_data: ProductCreate, admin: User = Depends(require_admin)):
    result = await db.products.update_one(
        {"id": product_id},
        {"$set": product_data.model_dump()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    
    updated = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not updated:
        raise HTTPException(status_code=404, detail="Product not found")
    if isinstance(updated['created_at'], str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    return Product(**updated)

@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str, admin: User = Depends(require_admin)):
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted"}

# Translation Routes
@api_router.get("/translations/{lang}")
async def get_translations(lang: str):
    if lang not in ("en", "ar"):
        raise HTTPException(status_code=400, detail="Unsupported language")
    entries = await db.translations.find({}, {"_id": 0}).to_list(10000)
    result = {}
    for e in entries:
        val = e.get(lang) or e.get("en") or ""
        result[e["key"]] = val
    return result

@api_router.post("/translations")
async def upsert_translation(entry: TranslationCreate, admin: User = Depends(require_admin)):
    payload = entry.model_dump()
    payload["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.translations.update_one({"key": entry.key}, {"$set": payload}, upsert=True)
    return {"message": "OK"}

# Order Routes
@api_router.get("/orders", response_model=List[Order])
async def get_orders(current_user: User = Depends(get_current_user)):
    query = {} if current_user.role == UserRole.ADMIN else {"user_id": current_user.id}
    orders = await db.orders.find(query, {"_id": 0}).to_list(1000)
    for order in orders:
        if isinstance(order['created_at'], str):
            order['created_at'] = datetime.fromisoformat(order['created_at'])
    return orders

@api_router.get("/orders/{order_id}", response_model=Order)
async def get_order(order_id: str, current_user: User = Depends(get_current_user)):
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if current_user.role != UserRole.ADMIN and order['user_id'] != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    if isinstance(order['created_at'], str):
        order['created_at'] = datetime.fromisoformat(order['created_at'])
    return Order(**order)

@api_router.post("/orders", response_model=Order)
async def create_order(order_data: OrderCreate, current_user: User = Depends(get_current_user)):
    order = Order(
        user_id=current_user.id,
        items=order_data.items,
        total=order_data.total,
        shipping_address=order_data.shipping_address
    )
    
    order_dict = order.model_dump()
    order_dict['created_at'] = order_dict['created_at'].isoformat()
    await db.orders.insert_one(order_dict)
    
    return order

@api_router.put("/orders/{order_id}/status", response_model=Order)
async def update_order_status(order_id: str, status_update: OrderStatusUpdate, admin: User = Depends(require_admin)):
    result = await db.orders.update_one(
        {"id": order_id},
        {"$set": {"status": status_update.status}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    
    updated = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not updated:
        raise HTTPException(status_code=404, detail="Order not found")
    if isinstance(updated['created_at'], str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    return Order(**updated)

# User Management (Admin)
@api_router.get("/users", response_model=List[User])
async def get_users(admin: User = Depends(require_admin)):
    users = await db.users.find({}, {"_id": 0, "password": 0}).to_list(1000)
    for user in users:
        if isinstance(user['created_at'], str):
            user['created_at'] = datetime.fromisoformat(user['created_at'])
    return users

# Analytics (Admin)
@api_router.get("/analytics")
async def get_analytics(admin: User = Depends(require_admin)):
    total_users = await db.users.count_documents({})
    total_products = await db.products.count_documents({})
    total_orders = await db.orders.count_documents({})
    
    orders = await db.orders.find({}, {"_id": 0, "total": 1}).to_list(10000)
    total_sales = sum(order['total'] for order in orders)
    
    return {
        "total_users": total_users,
        "total_products": total_products,
        "total_orders": total_orders,
        "total_sales": total_sales
    }

# File Upload
@api_router.post("/upload")
async def upload_file(file: UploadFile = File(...), admin: User = Depends(require_admin)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="Invalid file")
    file_extension = file.filename.split('.')[-1]
    file_name = f"{uuid.uuid4()}.{file_extension}"
    file_path = UPLOADS_DIR / file_name
    
    async with aiofiles.open(file_path, 'wb') as f:
        content = await file.read()
        await f.write(content)
    
    # Return URL with /api prefix so it's accessible through Kubernetes ingress
    file_url = f"/api/uploads/{file_name}"
    return {"url": file_url}

# Include the router in the main app
app.include_router(api_router)

# Serve uploaded files - must be defined AFTER api_router is included
@app.get("/api/uploads/{filename}")
async def serve_upload(filename: str):
    file_path = UPLOADS_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(file_path)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.get("/api/analytics")
async def analytics_health():
    return {"status": "ok"}

@app.get("/api/debug/cors")
async def debug_cors():
    cors_origins = os.environ.get('CORS_ORIGINS', '*').split(',')
    return {
        "cors_origins": [origin.strip() for origin in cors_origins],
        "raw_env": os.environ.get('CORS_ORIGINS', 'NOT SET')
    }

@app.options("/{full_path:path}")
async def preflight_handler(full_path: str):
    return {"status": "ok"}

@app.on_event("startup")
async def startup():
    logger.info("Starting up application...")
    # Create admin user if not exists
    try:
        logger.info(f"Connecting to MongoDB at {mongo_url}")
        admin_exists = await db.users.find_one({"email": "info@sandvalley.com"})
        logger.info("Database connection successful")
        if not admin_exists:
            admin = User(
                email="info@sandvalley.com",
                full_name="Admin User",
                role=UserRole.ADMIN
            )
            admin_dict = admin.model_dump()
            admin_dict['created_at'] = admin_dict['created_at'].isoformat()
            admin_dict['password'] = hash_password("admin@SV")
            await db.users.insert_one(admin_dict)
            logger.info("Admin user created: info@sandvalley.com / admin@SV")
        else:
            logger.info("Admin user already exists")
    except Exception as e:
        logger.error(f"Error during startup: {e}")
        raise

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()