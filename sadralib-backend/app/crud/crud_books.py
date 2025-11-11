# app/crud/crud_books.py
from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.models import Book
from app.schemas.schemas import BookCreate, BookUpdate
from app.core.config import settings

def get_books(db: Session, category_id: Optional[str] = None) -> List[Book]:
    query = db.query(Book)
    if category_id:
        query = query.filter(Book.category_id == category_id)
    return query.order_by(Book.created_at.desc()).all()

def get_book_by_id(db: Session, book_id: str) -> Optional[Book]:
    return db.query(Book).filter(Book.id == book_id).first()

def create_book(db: Session, book: BookCreate, pdf_filename: str = None, cover_filename: str = None) -> Book:
    db_book = Book(
        title=book.title,
        author=book.author,
        description=book.description,
        language=book.language,
        year=book.year,
        pages=book.pages,
        category_id=book.category_id,
        pdf_url=pdf_filename,   # store filename only
        cover_url=cover_filename
    )
    db.add(db_book)
    db.commit()
    db.refresh(db_book)
    return db_book

def update_book(db: Session, book_id: str, book: BookUpdate) -> Optional[Book]:
    db_book = get_book_by_id(db, book_id)
    if not db_book:
        return None
    for key, value in book.dict(exclude_unset=True).items():
        setattr(db_book, key, value)
    db.commit()
    db.refresh(db_book)
    return db_book

def delete_book(db: Session, book_id: str) -> bool:
    db_book = get_book_by_id(db, book_id)
    if not db_book:
        return False
    db.delete(db_book)
    db.commit()
    return True
