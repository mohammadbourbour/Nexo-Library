from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.audit import record_audit
from app.crud.crud_books import create_book, delete_book, get_book_by_id, get_books, update_book
from app.deps import get_admin_user, get_db
from app.models.models import User
from app.schemas.schemas import BookCreate, BookOut, BookUpdate

router = APIRouter(tags=["books"])


@router.get("/", response_model=list[BookOut])
def list_books(category_id: str | None = None, db: Session = Depends(get_db)):
    return get_books(db, category_id)


@router.get("/{book_id}", response_model=BookOut)
def book_detail(book_id: str, db: Session = Depends(get_db)):
    book = get_book_by_id(db, book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    return book


@router.post("/", response_model=BookOut)
def create_new_book(
    request: Request,
    book: BookCreate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_admin_user),
):
    created = create_book(db, book)
    record_audit(
        db,
        actor=admin_user,
        action="create",
        entity_type="book",
        entity_id=created.id,
        request=request,
    )
    return created


@router.put("/{book_id}", response_model=BookOut)
def update_existing_book(
    request: Request,
    book_id: str,
    book: BookUpdate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_admin_user),
):
    updated_book = update_book(db, book_id, book)
    if not updated_book:
        raise HTTPException(status_code=404, detail="Book not found")
    record_audit(
        db,
        actor=admin_user,
        action="update",
        entity_type="book",
        entity_id=book_id,
        request=request,
    )
    return updated_book


@router.delete("/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_book(
    request: Request,
    book_id: str,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_admin_user),
):
    success = delete_book(db, book_id)
    if not success:
        raise HTTPException(status_code=404, detail="Book not found")
    record_audit(
        db,
        actor=admin_user,
        action="delete",
        entity_type="book",
        entity_id=book_id,
        request=request,
    )
    return None
