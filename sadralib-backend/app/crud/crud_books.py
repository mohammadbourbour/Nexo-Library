from sqlalchemy.orm import Session
from typing import List, Optional

from app.models.models import Book
from app.schemas.schemas import BookCreate, BookUpdate

# -------------------------
# دریافت همه کتاب‌ها
# -------------------------
def get_books(db: Session) -> List[Book]:
    return db.query(Book).order_by(Book.created_at.desc()).all()


# -------------------------
# دریافت یک کتاب با شناسه
# -------------------------
def get_book_by_id(db: Session, book_id: str) -> Optional[Book]:
    return db.query(Book).filter(Book.id == book_id).first()


# -------------------------
# ایجاد کتاب جدید
# -------------------------
def create_book(db: Session, book: BookCreate) -> Book:
    db_book = Book(
        title=book.title,
        author=book.author,
        description=book.description,
        language=book.language,
        year=book.year,
        pages=book.pages,
        cover_url=book.cover_url,
        pdf_url=book.pdf_url,
        category_id=book.category_id
    )
    db.add(db_book)
    db.commit()
    db.refresh(db_book)
    return db_book


# -------------------------
# بروزرسانی کتاب
# -------------------------
def update_book(db: Session, book_id: str, book: BookUpdate) -> Optional[Book]:
    db_book = get_book_by_id(db, book_id)
    if not db_book:
        return None

    for key, value in book.dict(exclude_unset=True).items():
        setattr(db_book, key, value)

    db.commit()
    db.refresh(db_book)
    return db_book


# -------------------------
# حذف کتاب
# -------------------------
def delete_book(db: Session, book_id: str) -> bool:
    db_book = get_book_by_id(db, book_id)
    if not db_book:
        return False
    db.delete(db_book)
    db.commit()
    return True
