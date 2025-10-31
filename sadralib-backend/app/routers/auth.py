from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from passlib.context import CryptContext
from datetime import timedelta
from pydantic import BaseModel, EmailStr
from app.db.session import get_db
from app.models.models import User
from app.schemas.schemas import UserCreate, UserOut
from app.core.config import settings
from app.deps import get_current_user
from app.core.security import get_password_hash, create_access_token
from app.core.rate_limiter import limiter
import logging

logger = logging.getLogger(__name__)

router = APIRouter(tags=["auth"])


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# -------------------------
# ثبت‌نام کاربر جدید
# -------------------------
@router.post("/signup", response_model=UserOut)
def signup(user_in: UserCreate, db: Session = Depends(get_db)):
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
@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not pwd_context.verify(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    access_token = create_access_token({"sub": str(user.id), "role": user.role})
    return {"token": access_token, "token_type": "bearer", "user": {"id": user.id, "email": user.email, "name": user.name, "role": user.role}}

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
    admin_secret: str | None = None  # در صورتی که بخواهیم پس از اولین ادمین از secret استفاده کنیم

@router.post("/create-admin")
def create_admin(payload: CreateAdminRequest, db: Session = Depends(get_db)):
    # آیا ادمینی از قبل وجود دارد؟
    existing_admin = db.query(User).filter(User.role == "admin").first()

    if existing_admin:
        # اگر ادمین وجود داره، برای ساخت ادمین جدید باید admin_secret صحیح باشه
        if not payload.admin_secret or payload.admin_secret != settings.ADMIN_SECRET:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin creation is restricted.")
        # ادامه: ساخت ادمین جدید با تایید secret

    # بررسی وجود ایمیل
    existing_user = db.query(User).filter(User.email == payload.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_pw = get_password_hash(payload.password)
    user = User(email=payload.email, hashed_password=hashed_pw, name=payload.name, role="admin")
    db.add(user)
    db.commit()
    db.refresh(user)

    # در پاسخ توکن برمی‌گردونیم تا بعداً با آن وارد شویم
    access_token = create_access_token({"sub": str(user.id), "role": user.role},
                                       expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))

    return {"success": True, "token": access_token, "user": {"id": user.id, "email": user.email, "name": user.name, "role": user.role}}
