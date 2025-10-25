from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.schemas.schemas import BookCreate, BookUpdate, BookOut
from app.crud.crud_books import create_book, get_books, get_book_by_id, update_book, delete_book
from app.deps import get_db, get_admin_user

router = APIRouter(
    prefix="/books",
    tags=["books"]
)

# -------------------------
# دریافت همه کتاب‌ها (عمومی)
# -------------------------
@router.get("/", response_model=List[BookOut])
def list_books(db: Session = Depends(get_db)):
    return get_books(db)


# -------------------------
# دریافت جزئیات یک کتاب (عمومی)
# -------------------------
@router.get("/{book_id}", response_model=BookOut)
def book_detail(book_id: str, db: Session = Depends(get_db)):
    book = get_book_by_id(db, book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    return book


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
