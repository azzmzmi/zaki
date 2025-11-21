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
import asyncio
import ftplib
import io
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
# Use environment variable for uploads path in production (for persistent disk)
UPLOADS_PATH = os.environ.get('UPLOADS_DIR', str(ROOT_DIR / 'uploads'))
UPLOADS_DIR = Path(UPLOADS_PATH)
UPLOADS_DIR.mkdir(exist_ok=True, parents=True)

# GoDaddy FTP configuration
GODADDY_FTP_HOST = os.environ.get('GODADDY_FTP_HOST')
GODADDY_FTP_PORT = int(os.environ.get('GODADDY_FTP_PORT', '21'))
GODADDY_FTP_USER = os.environ.get('GODADDY_FTP_USERNAME')
GODADDY_FTP_PASSWORD = os.environ.get('GODADDY_FTP_PASSWORD')
GODADDY_FTP_DIR = os.environ.get('GODADDY_FTP_DIR', '')
GODADDY_BASE_URL = os.environ.get('GODADDY_BASE_URL')
GODADDY_PUBLIC_PATH = os.environ.get('GODADDY_PUBLIC_PATH', '/uploads')

# Create the main app
app = FastAPI(title="eCommerce API", version="1.0.0")

# Parse CORS origins
cors_origins_str = os.environ.get('CORS_ORIGINS', '*')
if cors_origins_str == '*':
    cors_origins = ['*']
else:
    cors_origins = [origin.strip() for origin in cors_origins_str.split(',') if origin.strip()]

# Add CORS middleware BEFORE routes
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=cors_origins,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Import for file serving
from fastapi.responses import FileResponse

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Error Messages Configuration
ERROR_MESSAGES = {
    # Authentication
    "INVALID_CREDENTIALS": "Invalid credentials",
    "EMAIL_ALREADY_REGISTERED": "Email already registered",
    "TOKEN_EXPIRED": "Token has expired",
    "INVALID_TOKEN": "Invalid token",
    "INVALID_TOKEN_TYPE": "Invalid token type",
    "RESET_TOKEN_EXPIRED": "Reset token has expired",
    "INVALID_RESET_TOKEN": "Invalid reset token",
    
    # Authorization
    "ADMIN_ACCESS_REQUIRED": "Admin access required",
    
    # Not Found
    "USER_NOT_FOUND": "User not found",
    "CATEGORY_NOT_FOUND": "Category not found",
    "PRODUCT_NOT_FOUND": "Product not found",
    "ORDER_NOT_FOUND": "Order not found",
    
    # Validation
    "UNSUPPORTED_LANGUAGE": "Unsupported language",
    "INVALID_FILE": "Invalid file",
}
def _godaddy_configured() -> bool:
    return all([
        GODADDY_FTP_HOST,
        GODADDY_FTP_USER,
        GODADDY_FTP_PASSWORD,
        GODADDY_BASE_URL,
    ])


def _build_godaddy_url(file_name: str) -> str:
    base_url = GODADDY_BASE_URL.rstrip('/')
    # Ensure URL starts with https://
    if not base_url.startswith('http://') and not base_url.startswith('https://'):
        base_url = f'https://{base_url}'
    public_path = GODADDY_PUBLIC_PATH if GODADDY_PUBLIC_PATH.startswith('/') else f"/{GODADDY_PUBLIC_PATH}"
    return f"{base_url}{public_path.rstrip('/')}/{file_name}"


async def upload_file_to_godaddy(file_name: str, content: bytes) -> str:
    if not _godaddy_configured():
        raise HTTPException(status_code=500, detail="GoDaddy FTP is not configured")

    def _upload():
        with ftplib.FTP() as ftp:
            ftp.connect(GODADDY_FTP_HOST, GODADDY_FTP_PORT)
            ftp.login(GODADDY_FTP_USER, GODADDY_FTP_PASSWORD)
            if GODADDY_FTP_DIR:
                ftp.cwd(GODADDY_FTP_DIR)
            ftp.storbinary(f"STOR {file_name}", io.BytesIO(content))

    try:
        await asyncio.to_thread(_upload)
    except ftplib.all_errors as exc:
        logger.error("Failed to upload file to GoDaddy via FTP: %s", exc)
        raise HTTPException(status_code=500, detail="Failed to upload image to GoDaddy")

    return _build_godaddy_url(file_name)



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
    image_url: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None
    image_url: Optional[str] = None

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

# Theme Models
class ThemeSettings(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: "theme_config")
    primary_color: str = "#2563eb"  # blue-600
    secondary_color: str = "#4f46e5"  # indigo-600
    accent_color: str = "#dc2626"  # red-600
    font_size: str = "base"  # base, sm, lg
    border_radius: str = "md"  # sm, md, lg
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ThemeSettingsUpdate(BaseModel):
    primary_color: Optional[str] = None
    secondary_color: Optional[str] = None
    accent_color: Optional[str] = None
    font_size: Optional[str] = None
    border_radius: Optional[str] = None

class Partner(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    logo_url: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PartnerCreate(BaseModel):
    name: str
    logo_url: str

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
        raise HTTPException(status_code=401, detail=ERROR_MESSAGES["TOKEN_EXPIRED"])
    except jwt.PyJWTError as e:
        logger.error(f"Invalid token: {str(e)}, token: {token[:20]}...")
        raise HTTPException(status_code=401, detail=ERROR_MESSAGES["INVALID_TOKEN"])

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    token = credentials.credentials
    payload = decode_token(token)
    
    if payload.get("type") != "access":
        raise HTTPException(status_code=401, detail=ERROR_MESSAGES["INVALID_TOKEN_TYPE"])
    
    user_id = payload.get("user_id")
    user_data = await db.users.find_one({"id": user_id}, {"_id": 0})
    
    if not user_data:
        raise HTTPException(status_code=404, detail=ERROR_MESSAGES["USER_NOT_FOUND"])
    
    if isinstance(user_data['created_at'], str):
        user_data['created_at'] = datetime.fromisoformat(user_data['created_at'])
    
    return User(**user_data)

async def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail=ERROR_MESSAGES["ADMIN_ACCESS_REQUIRED"])
    return current_user

# Auth Routes
@api_router.post("/auth/register", response_model=Token)
async def register(user_data: UserCreate):
    # Check if user exists
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail=ERROR_MESSAGES["EMAIL_ALREADY_REGISTERED"])
    
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
        raise HTTPException(status_code=401, detail=ERROR_MESSAGES["INVALID_CREDENTIALS"])
    
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
                raise HTTPException(status_code=404, detail=ERROR_MESSAGES["USER_NOT_FOUND"])
        
        updated_user = await db.users.find_one({"id": current_user.id}, {"_id": 0, "password": 0})
        if not updated_user:
            logger.error(f"User not found after update: {current_user.id}")
            raise HTTPException(status_code=404, detail=ERROR_MESSAGES["USER_NOT_FOUND"])
        
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
                raise HTTPException(status_code=404, detail=ERROR_MESSAGES["USER_NOT_FOUND"])
        
        updated_user = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0})
        if not updated_user:
            logger.error(f"User not found after update: {user_id}")
            raise HTTPException(status_code=404, detail=ERROR_MESSAGES["USER_NOT_FOUND"])
        
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
        raise HTTPException(status_code=404, detail=ERROR_MESSAGES["USER_NOT_FOUND"])
    
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
@api_router.get("/categories")
async def get_categories(page: int = 1, limit: int = 12):
    page = max(1, page)
    limit = min(limit, 100)
    skip = (page - 1) * limit
    
    total_count = await db.categories.count_documents({})
    categories = await db.categories.find({}, {"_id": 0}).skip(skip).limit(limit).to_list(limit)
    for cat in categories:
        if isinstance(cat['created_at'], str):
            cat['created_at'] = datetime.fromisoformat(cat['created_at'])
    
    return {
        "data": [Category(**cat) for cat in categories],
        "pagination": {
            "total": total_count,
            "page": page,
            "limit": limit,
            "pages": (total_count + limit - 1) // limit
        }
    }

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
@api_router.get("/products")
async def get_products(category_id: Optional[str] = None, search: Optional[str] = None, page: int = 1, limit: int = 12):
    # Validate pagination parameters
    page = max(1, page)
    limit = min(limit, 500)  # Max 100 per page
    skip = (page - 1) * limit
    query = {}
    if category_id:
        query["category_id"] = category_id
    
    # If search term provided, we need to search both product DB and translations
    if search:
        product_ids_from_search = set()
        
        # Search in products collection (English names/descriptions)
        search_query = query.copy()
        search_query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]
        english_results = await db.products.find(search_query, {"_id": 0, "id": 1}).limit(100).to_list(100)
        for prod in english_results:
            product_ids_from_search.add(prod["id"])
        
        # Search in translations collection (Arabic names/descriptions)
        translation_query = {
            "key": {"$regex": "entity.product.", "$options": "i"},
            "$or": [
                {"ar": {"$regex": search, "$options": "i"}},
            ]
        }
        arabic_results = await db.translations.find(translation_query, {"_id": 0, "key": 1}).limit(100).to_list(100)
        for trans in arabic_results:
            # Extract product ID from key like "entity.product.{id}.name"
            key_parts = trans["key"].split(".")
            if len(key_parts) >= 3 and key_parts[0] == "entity" and key_parts[1] == "product":
                product_ids_from_search.add(key_parts[2])
        
        # Now get the actual products with IDs from both searches
        if product_ids_from_search:
            final_query = {"id": {"$in": list(product_ids_from_search)}, **({
            "category_id": category_id} if category_id else {})}
            total_count = await db.products.count_documents(final_query)
            products = await db.products.find(
                final_query,
                {"_id": 0}
            ).skip(skip).limit(limit).to_list(limit)
        else:
            total_count = 0
            products = []
    else:
        # No search term, just filter by category
        total_count = await db.products.count_documents(query)
        products = await db.products.find(query, {"_id": 0}).skip(skip).limit(limit).to_list(limit)
    
    for prod in products:
        if isinstance(prod['created_at'], str):
            prod['created_at'] = datetime.fromisoformat(prod['created_at'])
    
    return {
        "data": [Product(**p) for p in products],
        "pagination": {
            "total": total_count,
            "page": page,
            "limit": limit,
            "pages": (total_count + limit - 1) // limit
        }
    }

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
async def get_translations(lang: str, ref_id: Optional[str] = None):
    if lang not in ("en", "ar"):
        raise HTTPException(status_code=400, detail=ERROR_MESSAGES["UNSUPPORTED_LANGUAGE"])
    # Filter by ref_id if provided, otherwise get all translations
    query = {"ref_id": ref_id} if ref_id else {}
    entries = await db.translations.find(query, {"_id": 0}).limit(1000).to_list(1000)
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
@api_router.get("/orders")
async def get_orders(current_user: User = Depends(get_current_user), page: int = 1, limit: int = 12):
    page = max(1, page)
    limit = min(limit, 100)
    skip = (page - 1) * limit
    
    query = {} if current_user.role == UserRole.ADMIN else {"user_id": current_user.id}
    total_count = await db.orders.count_documents(query)
    orders_list = await db.orders.find(query, {"_id": 0}).skip(skip).limit(limit).to_list(limit)
    result = []
    for order in orders_list:
        try:
            if isinstance(order.get('created_at'), str):
                order['created_at'] = datetime.fromisoformat(order['created_at'])
            # Skip orders with invalid shipping_address (string instead of object)
            if isinstance(order.get('shipping_address'), str):
                logger.warning(f"Skipping order {order.get('id')} with invalid shipping_address")
                continue
            # Ensure all required fields are present
            if all(key in order for key in ['id', 'user_id', 'items', 'total', 'shipping_address', 'created_at']):
                result.append(Order(**order))
        except Exception as e:
            logger.error(f"Error processing order {order.get('id')}: {str(e)}")
            continue
    
    return {
        "data": result,
        "pagination": {
            "total": total_count,
            "page": page,
            "limit": limit,
            "pages": (total_count + limit - 1) // limit
        }
    }

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
@api_router.get("/users")
async def get_users(admin: User = Depends(require_admin), page: int = 1, limit: int = 12):
    page = max(1, page)
    limit = min(limit, 100)
    skip = (page - 1) * limit
    
    total_count = await db.users.count_documents({})
    users = await db.users.find({}, {"_id": 0, "password": 0}).skip(skip).limit(limit).to_list(limit)
    for user in users:
        if isinstance(user['created_at'], str):
            user['created_at'] = datetime.fromisoformat(user['created_at'])
    
    return {
        "data": [User(**u) for u in users],
        "pagination": {
            "total": total_count,
            "page": page,
            "limit": limit,
            "pages": (total_count + limit - 1) // limit
        }
    }

# Analytics (Admin)
@api_router.get("/analytics")
async def get_analytics(admin: User = Depends(require_admin)):
    total_users = await db.users.count_documents({})
    total_products = await db.products.count_documents({})
    total_orders = await db.orders.count_documents({})
    
    orders = await db.orders.find({}, {"_id": 0, "total": 1, "created_at": 1, "status": 1, "items": 1}).to_list(10000)
    
    # Convert string dates to datetime objects
    for order in orders:
        if isinstance(order['created_at'], str):
            order['created_at'] = datetime.fromisoformat(order['created_at'])
    
    total_sales = sum(order['total'] for order in orders)
    
    # Get recent orders (last 30 days)
    thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)
    recent_orders = [order for order in orders if order['created_at'] >= thirty_days_ago]
    recent_sales = sum(order['total'] for order in recent_orders)
    
    # Order status breakdown
    status_breakdown = {}
    for order in orders:
        status = order.get('status', 'pending')
        status_breakdown[status] = status_breakdown.get(status, 0) + 1
    
    # Sales by day for chart (last 7 days)
    seven_days_ago = datetime.now(timezone.utc) - timedelta(days=7)
    daily_sales = {}
    for order in orders:
        if order['created_at'] >= seven_days_ago:
            date_key = order['created_at'].strftime('%Y-%m-%d')
            daily_sales[date_key] = daily_sales.get(date_key, 0) + order['total']
    
    # Top selling products
    product_sales = {}
    for order in orders:
        for item in order.get('items', []):
            product_id = item.get('product_id')
            quantity = item.get('quantity', 0)
            product_sales[product_id] = product_sales.get(product_id, 0) + quantity
    
    # Get top 5 products by quantity sold
    top_products = sorted(product_sales.items(), key=lambda x: x[1], reverse=True)[:5]
    
    # Get product details for top products
    top_product_details = []
    for product_id, quantity in top_products:
        product = await db.products.find_one({"id": product_id}, {"_id": 0, "name": 1})
        if product:
            top_product_details.append({
                "name": product.get('name', 'Unknown'),
                "quantity": quantity
            })
    
    return {
        "total_users": total_users,
        "total_products": total_products,
        "total_orders": total_orders,
        "total_sales": total_sales,
        "recent_sales": recent_sales,  # Sales in last 30 days
        "status_breakdown": status_breakdown,
        "daily_sales": daily_sales,
        "top_products": top_product_details
    }

# Theme Settings Routes
@api_router.get("/theme", response_model=ThemeSettings)
async def get_theme():
    theme = await db.theme_settings.find_one({"id": "theme_config"}, {"_id": 0})
    if not theme:
        # Return default theme
        return ThemeSettings()
    if isinstance(theme['updated_at'], str):
        theme['updated_at'] = datetime.fromisoformat(theme['updated_at'])
    return ThemeSettings(**theme)

@api_router.put("/theme", response_model=ThemeSettings)
async def update_theme(theme_data: ThemeSettingsUpdate, admin: User = Depends(require_admin)):
    update_dict = {}
    if theme_data.primary_color:
        update_dict['primary_color'] = theme_data.primary_color
    if theme_data.secondary_color:
        update_dict['secondary_color'] = theme_data.secondary_color
    if theme_data.accent_color:
        update_dict['accent_color'] = theme_data.accent_color
    if theme_data.font_size:
        update_dict['font_size'] = theme_data.font_size
    if theme_data.border_radius:
        update_dict['border_radius'] = theme_data.border_radius
    
    update_dict['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.theme_settings.update_one(
        {"id": "theme_config"},
        {"$set": update_dict},
        upsert=True
    )
    
    updated = await db.theme_settings.find_one({"id": "theme_config"}, {"_id": 0})
    if isinstance(updated['updated_at'], str):
        updated['updated_at'] = datetime.fromisoformat(updated['updated_at'])
    return ThemeSettings(**updated)

# Partner Routes
@api_router.get("/partners")
async def get_partners():
    """Get all partners"""
    partners = await db.partners.find({}, {"_id": 0}).to_list(length=None)
    return partners or []

@api_router.post("/partners", response_model=Partner)
async def create_partner(partner_data: PartnerCreate, admin: User = Depends(require_admin)):
    """Create a new partner"""
    partner = Partner(
        name=partner_data.name,
        logo_url=partner_data.logo_url
    )
    
    partner_dict = partner.model_dump()
    partner_dict['created_at'] = partner_dict['created_at'].isoformat()
    
    result = await db.partners.insert_one(partner_dict)
    partner_dict['id'] = str(result.inserted_id) if hasattr(result, 'inserted_id') else partner.id
    
    return Partner(**partner_dict)

@api_router.delete("/partners/{partner_id}")
async def delete_partner(partner_id: str, admin: User = Depends(require_admin)):
    """Delete a partner"""
    result = await db.partners.delete_one({"id": partner_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Partner not found")
    
    return {"message": "Partner deleted successfully"}

# File Upload
@api_router.post("/upload")
async def upload_file(file: UploadFile = File(...), admin: User = Depends(require_admin)):
    try:
        if not file.filename:
            raise HTTPException(status_code=400, detail=ERROR_MESSAGES["INVALID_FILE"])
        file_extension = file.filename.split('.')[-1]
        file_name = f"{uuid.uuid4()}.{file_extension}"
        content = await file.read()

        if _godaddy_configured():
            try:
                # Try GoDaddy FTP upload first
                file_url = await upload_file_to_godaddy(file_name, content)
                logger.info(f"Successfully uploaded {file_name} to GoDaddy FTP")
            except Exception as ftp_error:
                # Fallback to local storage if FTP fails
                logger.warning(f"GoDaddy FTP upload failed for {file_name}: {str(ftp_error)}. Falling back to local storage.")
                file_path = UPLOADS_DIR / file_name
                async with aiofiles.open(file_path, 'wb') as f:
                    await f.write(content)
                file_url = f"/api/uploads/{file_name}"
        else:
            # GoDaddy not configured, use local storage
            file_path = UPLOADS_DIR / file_name
            async with aiofiles.open(file_path, 'wb') as f:
                await f.write(content)
            file_url = f"/api/uploads/{file_name}"
        
        return {"url": file_url}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Upload failed for file {file_name if 'file_name' in locals() else 'unknown'}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to upload image")

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
    logger.info(f"Connecting to MongoDB at {mongo_url}")
    logger.info("Database connection successful")
    
    # Create database indexes for performance
    try:
        # Products collection indexes
        await db.products.create_index("id")
        await db.products.create_index("category_id")
        await db.products.create_index([("name", "text"), ("description", "text")])
        logger.info("✓ Products indexes created")
        
        # Categories collection indexes
        await db.categories.create_index("id")
        logger.info("✓ Categories indexes created")
        
        # Translations collection indexes
        await db.translations.create_index("key")
        await db.translations.create_index("ref_id")
        await db.translations.create_index([("key", "text"), ("ar", "text"), ("en", "text")])
        logger.info("✓ Translations indexes created")
        
        # Users collection indexes
        await db.users.create_index("email", unique=True)
        logger.info("✓ Users indexes created")
        
        # Orders collection indexes
        await db.orders.create_index("user_id")
        await db.orders.create_index("id")
        logger.info("✓ Orders indexes created")
    except Exception as e:
        logger.warning(f"Index creation failed (may already exist): {e}")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
