from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import AliasChoices, BaseModel, ConfigDict, EmailStr, Field
from sqlalchemy.orm import Session

from app.core.audit import record_audit
from app.core.config import settings
from app.core.limiter import limiter
from app.core.security import (
    clear_access_cookie,
    create_access_token,
    get_current_user,
    get_password_hash,
    set_access_cookie,
    verify_password,
)
from app.db.session import get_db
from app.models.models import User
from app.schemas.schemas import AuthUserResponse, UserCreate, UserOut, VerifyTokenResponse

router = APIRouter(tags=["auth"])

LOGIN_ERROR = "Incorrect email or password"


def _email_allowed(email: str) -> bool:
    domain = settings.ALLOWED_EMAIL_DOMAIN
    if not domain:
        return True
    suffix = "@" + domain.lower().lstrip("@")
    return email.lower().endswith(suffix)


@router.post("/signup", response_model=AuthUserResponse)
@limiter.limit("5/minute")
def signup(request: Request, user_in: UserCreate, db: Session = Depends(get_db)):
    if not settings.ENABLE_SIGNUP:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Signup is disabled")
    if not _email_allowed(user_in.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email domain is not allowed",
        )
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        email=user_in.email,
        name=user_in.name,
        hashed_password=get_password_hash(user_in.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"success": True, "user": user}


@router.post("/login")
@limiter.limit("5/minute")
def login(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not user.is_active or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail=LOGIN_ERROR)

    access_token = create_access_token({"sub": str(user.id)})
    response = JSONResponse(
        content={
            "success": True,
            "user": {"id": user.id, "email": user.email, "name": user.name, "role": user.role},
        }
    )
    set_access_cookie(response, access_token)
    return response


@router.post("/logout")
def logout(response: Response):
    clear_access_cookie(response)
    return {"success": True, "message": "Logged out successfully"}


@router.get("/verify", response_model=VerifyTokenResponse)
def verify_token(current_user: User = Depends(get_current_user)):
    return {"valid": True, "user": current_user}


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


class CreateAdminRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    email: EmailStr
    password: str = Field(..., min_length=8, max_length=64)
    name: str | None = None
    admin_secret: str | None = Field(
        None, validation_alias=AliasChoices("admin_secret", "ADMIN_SECRET")
    )


@router.post("/create-admin")
@limiter.limit("5/minute")
def create_admin(request: Request, payload: CreateAdminRequest, db: Session = Depends(get_db)):
    if settings.is_production:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")

    existing_admin = db.query(User).filter(User.role == "admin").first()
    if existing_admin:
        if not payload.admin_secret or payload.admin_secret != settings.ADMIN_SECRET:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid admin secret.",
            )

    existing_user = db.query(User).filter(User.email == payload.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered.",
        )

    user = User(
        email=payload.email,
        hashed_password=get_password_hash(payload.password),
        name=payload.name,
        role="admin",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    record_audit(
        db,
        actor=user,
        action="create",
        entity_type="admin",
        entity_id=str(user.id),
        request=request,
    )
    return {
        "success": True,
        "user": {"id": user.id, "email": user.email, "name": user.name, "role": user.role},
    }
