from fastapi import APIRouter, Depends, File, Form, HTTPException, Request, UploadFile

from app.core.audit import record_audit
from app.core.files import cover_public_url, delete_stored, save_cover, save_pdf
from app.crud.crud_books import create_book
from app.deps import get_admin_user, get_db
from app.models.models import User
from app.schemas.schemas import BookCreate, BookOut
from sqlalchemy.orm import Session

router = APIRouter(tags=["upload"])


async def _pdf_from_request(file: UploadFile | None, pdf: UploadFile | None) -> UploadFile:
    upload = file or pdf
    if upload is None:
        raise HTTPException(status_code=400, detail="PDF file is required")
    return upload


@router.post("/upload", response_model=BookOut)
@router.post("/upload/", response_model=BookOut)
async def upload_book(
    request: Request,
    title: str = Form(...),
    author: str = Form(...),
    description: str = Form(""),
    category_id: str | None = Form(None),
    language: str | None = Form("فارسی"),
    year: int | None = Form(None),
    pages: int | None = Form(None),
    file: UploadFile | None = File(None),
    pdf: UploadFile | None = File(None),
    cover: UploadFile = File(...),
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_admin_user),
):
    pdf_file = await _pdf_from_request(file, pdf)
    pdf_name = cover_name = None
    try:
        pdf_name = await save_pdf(pdf_file)
        cover_name = await save_cover(cover)
        book_data = BookCreate(
            title=title,
            author=author,
            description=description,
            language=language,
            year=year,
            pages=pages,
            category_id=category_id,
        )
        book = create_book(db, book_data, pdf_filename=pdf_name, cover_filename=cover_name)
        record_audit(
            db,
            actor=admin_user,
            action="upload",
            entity_type="book",
            entity_id=book.id,
            request=request,
        )
        return book
    except HTTPException:
        if pdf_name:
            delete_stored("pdf", pdf_name)
        if cover_name:
            delete_stored("cover", cover_name)
        raise
    except Exception:
        if pdf_name:
            delete_stored("pdf", pdf_name)
        if cover_name:
            delete_stored("cover", cover_name)
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/uploads/cover")
async def upload_cover(
    request: Request,
    cover: UploadFile = File(...),
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_admin_user),
):
    cover_name = await save_cover(cover)
    url = cover_public_url(cover_name)
    record_audit(
        db,
        actor=admin_user,
        action="upload",
        entity_type="cover",
        entity_id=cover_name,
        request=request,
    )
    return {"url": url}
