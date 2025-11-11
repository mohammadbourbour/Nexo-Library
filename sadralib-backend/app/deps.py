# app/deps.py
from fastapi import HTTPException, status, Depends, Request
from sqlalchemy.orm import Session
from jose import jwt, JWTError, ExpiredSignatureError
from app.db.session import get_db
from app.models.models import User
from app.core.config import settings

def _extract_token_from_request(request: Request) -> str:
    # Try Authorization header first
    auth = request.headers.get("Authorization")
    if auth and auth.lower().startswith("bearer "):
        return auth.split()[1]
    # Then cookie
    token = request.cookies.get("access_token")
    if token:
        return token
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated",
                        headers={"WWW-Authenticate": "Bearer"})

def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    token = _extract_token_from_request(request)
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token has expired",
                            headers={"WWW-Authenticate": "Bearer"})
    except JWTError:
        raise credentials_exception

    # user.id in DB is integer in your model
    try:
        user = db.query(User).filter(User.id == int(user_id)).first()
    except Exception:
        raise credentials_exception

    if user is None:
        raise credentials_exception
    return user

def get_admin_user(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin privileges required")
    return current_user

# CSRF verifier dependency: for state-changing methods ensure header matches cookie
def verify_csrf(request: Request):
    # apply only for unsafe methods; for idempotent GET/HEAD/OPTIONS skip
    if request.method in ("GET", "HEAD", "OPTIONS"):
        return
    csrf_cookie = request.cookies.get("csrf_token")
    if not csrf_cookie:
        raise HTTPException(status_code=403, detail="Missing CSRF token cookie")
    csrf_header = request.headers.get("X-CSRF-Token")
    if not csrf_header or csrf_header != csrf_cookie:
        raise HTTPException(status_code=403, detail="Invalid CSRF token")
