from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.crud.crud_books import get_book_by_id
from app.deps import get_current_user, get_db
from app.models.models import SavedBook, User
from app.schemas.schemas import BookOut, SavedBookIn

router = APIRouter(prefix="/api/saved-books", tags=["saved-books"])


@router.get("", response_model=list[BookOut])
def list_saved_books(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rows = (
        db.query(SavedBook)
        .filter(SavedBook.user_id == current_user.id)
        .order_by(SavedBook.created_at.desc())
        .all()
    )
    return [row.book for row in rows if row.book]


@router.post("", response_model=BookOut, status_code=status.HTTP_201_CREATED)
def save_book(
    payload: SavedBookIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    book = get_book_by_id(db, payload.book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    existing = (
        db.query(SavedBook)
        .filter(SavedBook.user_id == current_user.id, SavedBook.book_id == payload.book_id)
        .first()
    )
    if existing:
        return book
    row = SavedBook(user_id=current_user.id, book_id=payload.book_id)
    db.add(row)
    db.commit()
    return book


@router.delete("/{book_id}")
def unsave_book(
    book_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    row = (
        db.query(SavedBook)
        .filter(SavedBook.user_id == current_user.id, SavedBook.book_id == book_id)
        .first()
    )
    if not row:
        raise HTTPException(status_code=404, detail="Saved book not found")
    db.delete(row)
    db.commit()
    return {"success": True}
