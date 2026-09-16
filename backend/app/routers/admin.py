from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.deps import get_admin_user, get_db
from app.models.models import AuditEvent, Book, ReadingProgress, User
from app.schemas.schemas import AuditEventOut, AuditPageOut, ReadingStatOut

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/audit", response_model=AuditPageOut)
def list_audit(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    _admin: User = Depends(get_admin_user),
):
    query = db.query(AuditEvent).order_by(AuditEvent.created_at.desc())
    total = query.count()
    items = query.offset((page - 1) * page_size).limit(page_size).all()
    return AuditPageOut(
        items=[AuditEventOut.model_validate(item) for item in items],
        page=page,
        page_size=page_size,
        total=total,
    )


@router.get("/stats/reading", response_model=list[ReadingStatOut])
def reading_stats(
    db: Session = Depends(get_db),
    _admin: User = Depends(get_admin_user),
):
    rows = (
        db.query(
            ReadingProgress.book_id,
            Book.title,
            func.count(func.distinct(ReadingProgress.user_id)).label("unique_readers"),
            func.max(ReadingProgress.updated_at).label("last_activity"),
        )
        .join(Book, Book.id == ReadingProgress.book_id)
        .group_by(ReadingProgress.book_id, Book.title)
        .order_by(func.max(ReadingProgress.updated_at).desc())
        .all()
    )
    return [
        ReadingStatOut(
            book_id=row.book_id,
            title=row.title,
            unique_readers=row.unique_readers,
            last_activity=row.last_activity,
        )
        for row in rows
    ]
