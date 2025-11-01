from fastapi import Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
import jwt
from app.db.session import get_db
from app.models.models import User
from app.core.config import settings


def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    """
    دریافت کاربر لاگین شده از کوکی یا هدر Authorization.
    """
    # 👇 فقط برای دیباگ توکن و کوکی‌ها
    print("🍪 Cookies:", request.cookies)
    print("🔑 Authorization header:", request.headers.get("Authorization"))

    token = None

    # 1️⃣ ابتدا از هدر بگیر (برای curl و Postman)
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        print("✅ Token from header:", token)
    else:
        # 2️⃣ اگر در هدر نبود، از کوکی بگیر (برای مرورگر)
        token = request.cookies.get("access_token")
        print("✅ Token from cookie:", token if token else "❌ No access_token cookie found")

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )

    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        user_id: str = payload.get("sub")
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )

    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )

    return user


def get_admin_user(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    return current_user
