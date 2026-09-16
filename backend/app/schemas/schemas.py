from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class BookBase(BaseModel):
    title: str = Field(..., max_length=200)
    author: str = Field(..., max_length=100)
    description: Optional[str] = None
    language: Optional[str] = "فارسی"
    year: Optional[int] = None
    pages: Optional[int] = None
    cover_url: Optional[str] = None
    pdf_url: Optional[str] = None
    category_id: Optional[str] = None


class BookCreate(BookBase):
    pass


class BookUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=200)
    author: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None
    language: Optional[str] = None
    year: Optional[int] = None
    pages: Optional[int] = None
    cover_url: Optional[str] = None
    pdf_url: Optional[str] = None
    category_id: Optional[str] = None


class BookOut(BookBase):
    id: str
    model_config = ConfigDict(from_attributes=True)


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=64)
    name: Optional[str] = Field(None, min_length=2, max_length=50)


class UserOut(BaseModel):
    id: int
    email: EmailStr
    name: Optional[str] = None
    role: str
    model_config = ConfigDict(from_attributes=True)


class AuthUserResponse(BaseModel):
    success: bool = True
    user: UserOut


class VerifyTokenResponse(BaseModel):
    valid: bool
    user: UserOut


class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


class CategoryOut(CategoryBase):
    id: str
    model_config = ConfigDict(from_attributes=True)


class SavedBookIn(BaseModel):
    book_id: str


class ProgressIn(BaseModel):
    page: int = Field(..., ge=1)


class ProgressOut(BaseModel):
    book_id: str
    page: int
    updated_at: Optional[datetime] = None
    title: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)


class AuditEventOut(BaseModel):
    id: int
    actor_id: Optional[int] = None
    action: str
    entity_type: str
    entity_id: Optional[str] = None
    ip: Optional[str] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class AuditPageOut(BaseModel):
    items: List[AuditEventOut]
    page: int
    page_size: int
    total: int


class ReadingStatOut(BaseModel):
    book_id: str
    title: str
    unique_readers: int
    last_activity: Optional[datetime] = None
