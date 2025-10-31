from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List

from app.schemas.schemas import BookCreate, BookUpdate, BookOut
from app.crud.crud_books import create_book, get_books, get_book_by_id, update_book, delete_book
from app.deps import get_db, get_admin_user
from app.core.rate_limiter import limiter
import logging

logger = logging.getLogger(__name__)

router = APIRouter(tags=["books"])

# مسیر پایه فایل‌های آپلود شده
UPLOAD_BASE_URL = "/static/uploads"

@router.get("/", response_model=dict)
@limiter.limit("30/minute")
def list_books(
    category_id: str | None = None,
    search: str | None = Query(None, min_length=1, max_length=100),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    request=None  # برای rate limiter
):
    """
    لیست کتاب‌ها با پشتیبانی pagination و search
    """
    books, total = get_books(db, category_id=category_id, search=search, skip=skip, limit=limit)

    result = []
    for b in books:
        book_dict = b.__dict__.copy()
        # حذف internal attributes
        book_dict.pop('_sa_instance_state', None)
        result.append(book_dict)

    return {
        "items": result,
        "total": total,
        "skip": skip,
        "limit": limit,
        "has_more": (skip + limit) < total
    }


@router.get("/{book_id}", response_model=BookOut)
def book_detail(book_id: str, db: Session = Depends(get_db)):
    book = get_book_by_id(db, book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    book_dict = book.__dict__.copy()
    if book_dict.get("pdf_url"):
        book_dict["pdf_url"] = f"/static/uploads/{book_dict['pdf_url']}"
    if book_dict.get("cover_url"):
        book_dict["cover_url"] = f"/static/uploads/{book_dict['cover_url']}"
    
    return book_dict




# -------------------------
# ایجاد کتاب جدید (فقط ادمین)
# -------------------------
@router.post("/", response_model=BookOut)
def create_new_book(book: BookCreate, db: Session = Depends(get_db), admin_user=Depends(get_admin_user)):
    return create_book(db, book)


# -------------------------
# بروزرسانی کتاب (فقط ادمین)
# -------------------------
@router.put("/{book_id}", response_model=BookOut)
def update_existing_book(book_id: str, book: BookUpdate, db: Session = Depends(get_db), admin_user=Depends(get_admin_user)):
    updated_book = update_book(db, book_id, book)
    if not updated_book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    if updated_book.pdf_url:
        updated_book.pdf_url = f"{UPLOAD_BASE_URL}/{updated_book.pdf_url}"
    if updated_book.cover_url:
        updated_book.cover_url = f"{UPLOAD_BASE_URL}/{updated_book.cover_url}"
    
    return updated_book


# -------------------------
# حذف کتاب (فقط ادمین)
# -------------------------
@router.delete("/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_book(book_id: str, db: Session = Depends(get_db), admin_user=Depends(get_admin_user)):
    success = delete_book(db, book_id)
    if not success:
        raise HTTPException(status_code=404, detail="Book not found")
    return None
