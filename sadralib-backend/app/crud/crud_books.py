from sqlalchemy.orm import Session, joinedload
from typing import List, Optional, Tuple
from app.models.models import Book
from app.schemas.schemas import BookCreate, BookUpdate
from sqlalchemy import and_

# -------------------------
# دریافت همه کتاب‌ها با پشتیبانی Pagination و Search
# -------------------------
def get_books(
    db: Session,
    category_id: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 20
) -> Tuple[List[Book], int]:
    """
    دریافت کتاب‌ها با پشتیبانی pagination و search

    Args:
        db: Database session
        category_id: فیلتر بر اساس دسته‌بندی
        search: جستجو در عنوان و نویسنده
        skip: تعداد رکوردهایی که باید رد شود
        limit: تعداد رکوردهایی که باید برگردانده شود

    Returns:
        Tuple of (books, total_count)
    """
    query = db.query(Book).filter(Book.is_deleted == False)  # فقط کتاب‌های حذف نشده

    if category_id:
        query = query.filter(Book.category_id == category_id)

    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Book.title.ilike(search_term),
                Book.author.ilike(search_term)
            )
        )

    # دریافت تعداد کل
    total = query.count()

    # اعمال pagination
    books = query.order_by(Book.created_at.desc()).offset(skip).limit(limit).all()

    return books, total


# -------------------------
# دریافت یک کتاب با شناسه
# -------------------------
def get_book_by_id(db: Session, book_id: str) -> Optional[Book]:
    return db.query(Book).filter(Book.id == book_id).first()


# -------------------------
# ایجاد کتاب جدید
# -------------------------
def create_book(db: Session, book: BookCreate, pdf_filename: str = None, cover_filename: str = None) -> Book:
    db_book = Book(
        title=book.title,
        author=book.author,
        description=book.description,
        language=book.language,
        year=book.year,
        pages=book.pages,
        category_id=book.category_id,
        pdf_url=f"sadralib-backend/static/uploads/{pdf_filename}" if pdf_filename else None,
        cover_url=f"sadralib-backend/static/uploads/{cover_filename}" if cover_filename else None
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
