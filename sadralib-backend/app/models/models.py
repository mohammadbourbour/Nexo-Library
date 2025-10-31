from sqlalchemy import Column, String, Integer, Text, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base
import uuid
from sqlalchemy import Table

# تولید UUID به عنوان شناسه یکتا
def generate_uuid():
    return str(uuid.uuid4())

# جدول دسته‌بندی‌ها
class Category(Base):
    __tablename__ = "categories"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # رابطه با کتاب‌ها
    books = relationship("Book", back_populates="category", cascade="all, delete-orphan")


# جدول کتاب‌ها
class Book(Base):
    __tablename__ = "books"

    id = Column(String, primary_key=True, default=generate_uuid)
    title = Column(String(200), nullable=False)
    author = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    language = Column(String(50), default="فارسی")
    year = Column(Integer, nullable=True)
    pages = Column(Integer, nullable=True)
    cover_url = Column(String, nullable=True)
    pdf_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_deleted = Column(Boolean, default=False)  # Soft Delete Flag
    deleted_at = Column(DateTime, nullable=True)

    category_id = Column(String, ForeignKey("categories.id", ondelete="SET NULL"))
    category = relationship("Category", back_populates="books")


# جدول کاربران
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    name = Column(String, nullable=True)
    role = Column(String, default="user")  # admin | user
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)



# جدول واسط کتاب-برچسب (Many-to-Many)
book_tags = Table(
    "book_tags",
    Base.metadata,
    Column("book_id", String, ForeignKey("books.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id", String, ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True),
)

# جدول برچسب‌ها
class Tag(Base):
    __tablename__ = "tags"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(50), unique=True, nullable=False)

    # رابطه با کتاب‌ها
    books = relationship("Book", secondary=book_tags, back_populates="tags")


# اضافه کردن رابطه در Book
Book.tags = relationship("Tag", secondary=book_tags, back_populates="books")
