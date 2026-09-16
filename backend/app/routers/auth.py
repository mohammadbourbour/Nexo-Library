from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from passlib.context import CryptContext
from datetime import datetime, timedelta
import jwt
from app.db.session import get_db
from app.models.models import User
from app.schemas.schemas import UserCreate, UserOut
from app.core.config import settings
from app.deps import get_current_user
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from app.db.session import get_db
from app.models.models import User
from app.core.config import settings
from app.core.security import get_password_hash, create_access_token
from datetime import timedelta
from slowapi import Limiter
from fastapi.responses import JSONResponse
import os

IS_PROD = os.getenv("ENV", "development") == "production"


router = APIRouter(tags=["auth"])
limiter = Limiter(key_func=lambda request: request.client.host)  # یا get_remote_address


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# -------------------------
# توکن JWT ایجاد کن
# -------------------------
def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt

# -------------------------
# ثبت‌نام کاربر جدید
# -------------------------
@limiter.limit("5/minute")
@router.post("/signup", response_model=UserOut)
def signup(request: Request, user_in: UserCreate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = pwd_context.hash(user_in.password)
    user = User(email=user_in.email, name=user_in.name, hashed_password=hashed_password)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

# -------------------------
# ورود و دریافت توکن
# -------------------------
from fastapi.responses import JSONResponse

@router.post("/login")
def login(request: Request, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not pwd_context.verify(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")

    access_token = create_access_token({"sub": str(user.id), "role": user.role})

    # ✅ ست کردن کوکی
    response = JSONResponse(
        content={"success": True, "user": {"id": user.id, "email": user.email, "name": user.name, "role": user.role}} 
    )
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        samesite="lax",
        path="/"
    )
    return response

@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(key="access_token", path="/")
    return {"success": True, "message": "Logged out successfully"}
# -------------------------

@router.get("/verify")
async def verify_token(current_user: dict = Depends(get_current_user)):
    """
    Verify JWT token and return user info if valid.
    """
    return {"valid": True, "user": current_user}
# -------------------------
# مسیر تستی برای کاربر جاری
# -------------------------
@router.get("/me", response_model=UserOut)
def get_me(current_user=Depends(get_current_user)):
    return current_user




# schema برای درخواست ساخت ادمین
class CreateAdminRequest(BaseModel):
    email: EmailStr
    password: str
    name: str | None = None
    ADMIN_SECRET: str | None = None  # در صورتی که بخواهیم پس از اولین ادمین از secret استفاده کنیم

@limiter.limit("5/minute")
@router.post("/create-admin")
def create_admin(request: Request, payload: CreateAdminRequest, db: Session = Depends(get_db)):
    """
    ایجاد ادمین سیستم
    - در اولین بار بدون نیاز به secret ساخته می‌شود.
    - پس از آن، فقط با وارد کردن admin_secret معتبر امکان ساخت ادمین جدید وجود دارد.
    """
    existing_admin = db.query(User).filter(User.role == "admin").first()

    # اگر ادمین از قبل وجود دارد، برای ایجاد ادمین جدید باید secret معتبر باشد
    if existing_admin:
        if not payload.admin_secret:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Admin secret is required to create another admin."
            )
        if payload.admin_secret != settings.ADMIN_SECRET:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid admin secret."
            )

    # بررسی وجود ایمیل تکراری
    existing_user = db.query(User).filter(User.email == payload.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered."
        )

    # هش کردن پسورد
    hashed_pw = get_password_hash(payload.password)

    # ساخت کاربر جدید با نقش ادمین
    user = User(
        email=payload.email,
        hashed_password=hashed_pw,
        name=payload.name,
        role="admin"
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # ساخت توکن برای ورود فوری ادمین
    access_token = create_access_token(
        data={"sub": str(user.id), "role": user.role},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    return {"success": True, "token": access_token, "user": {"id": user.id, "email": user.email, "name": user.name, "role": user.role}}


