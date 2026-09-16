from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.core.limiter import limiter
from app.crud.crud_books import get_book_by_id
from app.deps import get_current_user, get_db
from app.models.models import ReadingProgress, User
from app.schemas.schemas import ProgressIn, ProgressOut

router = APIRouter(prefix="/api/me/progress", tags=["progress"])

THROTTLE_SECONDS = 5


@router.get("", response_model=list[ProgressOut])
def list_progress(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rows = (
        db.query(ReadingProgress)
        .filter(ReadingProgress.user_id == current_user.id)
        .order_by(ReadingProgress.updated_at.desc())
        .all()
    )
    return [
        ProgressOut(
            book_id=row.book_id,
            page=row.page,
            updated_at=row.updated_at,
            title=row.book.title if row.book else None,
        )
        for row in rows
    ]


@router.put("/{book_id}", response_model=ProgressOut)
@limiter.limit("30/minute")
def upsert_progress(
    request: Request,
    book_id: str,
    payload: ProgressIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    book = get_book_by_id(db, book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    row = (
        db.query(ReadingProgress)
        .filter(ReadingProgress.user_id == current_user.id, ReadingProgress.book_id == book_id)
        .first()
    )
    now = datetime.utcnow()
    if row:
        if row.updated_at and now - row.updated_at < timedelta(seconds=THROTTLE_SECONDS):
            return ProgressOut(
                book_id=row.book_id,
                page=row.page,
                updated_at=row.updated_at,
                title=book.title,
            )
        row.page = payload.page
        row.updated_at = now
    else:
        row = ReadingProgress(
            user_id=current_user.id,
            book_id=book_id,
            page=payload.page,
            updated_at=now,
        )
        db.add(row)
    db.commit()
    db.refresh(row)
    return ProgressOut(
        book_id=row.book_id,
        page=row.page,
        updated_at=row.updated_at,
        title=book.title,
    )
