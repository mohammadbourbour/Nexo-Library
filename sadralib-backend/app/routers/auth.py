# app/routers/auth.py
from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import jwt
from app.db.session import get_db
from app.models.models import User
from app.schemas.schemas import UserCreate, UserOut
from app.core.config import settings
from app.core.security import get_password_hash, verify_password
import secrets

router = APIRouter(tags=["auth"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt

@router.post("/signup", response_model=UserOut)
def signup(user_in: UserCreate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = get_password_hash(user_in.password)
    user = User(email=user_in.email, name=user_in.name, hashed_password=hashed_password)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.post("/login")
def login(response: Response, form_data: dict = Depends(), db: Session = Depends(get_db)):
    # Note: your frontend likely posts JSON {username, password}
    username = form_data.get("username") or form_data.get("email")
    password = form_data.get("password")
    if not username or not password:
        raise HTTPException(status_code=400, detail="Missing credentials")
    user = db.query(User).filter(User.email == username).first()
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")

    access_token = create_access_token({"sub": str(user.id), "role": user.role})
    csrf_token = secrets.token_urlsafe(32)

    secure_flag = True if settings.ENV == "production" else False

    # Set httponly cookie for token, and a readable csrf cookie
    response = Response(content='{"success":true}', media_type="application/json")
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=secure_flag,
        samesite="strict",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/"
    )
    # csrf cookie (not httponly) so that frontend JS can read and send it in header
    response.set_cookie(
        key="csrf_token",
        value=csrf_token,
        httponly=False,
        secure=secure_flag,
        samesite="strict",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/"
    )

    return response

@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(key="access_token", path="/")
    response.delete_cookie(key="csrf_token", path="/")
    return {"success": True, "message": "Logged out successfully"}

@router.get("/me", response_model=UserOut)
def get_me(current_user=Depends(lambda: None)):
    # leave this to use Depends(get_current_user) in route includes; kept placeholder
    pass

# Admin creation endpoint: require ADMIN_SECRET always
from pydantic import BaseModel, EmailStr
class CreateAdminRequest(BaseModel):
    email: EmailStr
    password: str
    name: str | None = None
    admin_secret: str

@router.post("/create-admin")
def create_admin(payload: CreateAdminRequest, db: Session = Depends(get_db)):
    if payload.admin_secret != settings.ADMIN_SECRET:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin creation is restricted.")
    existing_user = db.query(User).filter(User.email == payload.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_pw = get_password_hash(payload.password)
    user = User(email=payload.email, hashed_password=hashed_pw, name=payload.name, role="admin")
    db.add(user)
    db.commit()
    db.refresh(user)
    access_token = create_access_token({"sub": str(user.id), "role": user.role},
                                       expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    return {"success": True, "token": access_token, "user": {"id": user.id, "email": user.email, "name": user.name, "role": user.role}}
