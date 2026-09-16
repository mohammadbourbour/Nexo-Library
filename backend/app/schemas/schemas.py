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
        from_attributes = True



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


# -------------------------
# Category Schemas
# -------------------------
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

    class Config:
        from_attributes = True
        
        
from pydantic import BaseModel, EmailStr, Field, constr

class UserCreate(BaseModel):
    email: EmailStr
    password: str = constr(min_length=8, max_length=64)  # حداقل طول پسورد
    name: str = constr(min_length=2, max_length=50)

class UserLogin(BaseModel):
    email: EmailStr
    password: str = constr(min_length=8, max_length=64)
