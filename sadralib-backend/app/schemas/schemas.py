from pydantic import BaseModel, Field
from typing import Optional
from pydantic import BaseModel, EmailStr
from typing import Optional, List
# -------------------------
# Base Book Schema
# -------------------------
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

# -------------------------
# Schema برای ایجاد کتاب
# -------------------------
class BookCreate(BookBase):
    pass  # همه فیلدها از BookBase ارث‌بری می‌کنه

# -------------------------
# Schema برای بروزرسانی کتاب
# -------------------------
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

# -------------------------
# Schema خروجی
# -------------------------
class BookOut(BookBase):
    id: str

    class Config:
        orm_mode = True



# -------------------------
# Schema برای ثبت‌نام و ورود
# -------------------------
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = None

class UserOut(BaseModel):
    id: int
    email: EmailStr
    name: Optional[str] = None
    role: str

    class Config:
        from_attributes = True  # pydantic v2 جایگزین orm_mode
