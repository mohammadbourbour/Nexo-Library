# app/routers/upload.py
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends, Request
from sqlalchemy.orm import Session
from datetime import datetime, timezone
import uuid, os, logging
from app.deps import get_admin_user, get_db, verify_csrf
from app.schemas.schemas import BookCreate
from app.crud.crud_books import create_book
from app.core.config import settings
import magic

router = APIRouter(tags=["upload"])

UPLOAD_DIR = "static/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload", response_model=BookCreate, dependencies=[Depends(verify_csrf)])
async def upload_book(
    request: Request,
    title: str = Form(...),
    author: str = Form(...),
    description: str = Form(...),
    category_id: str | None = Form(None),
    language: str | None = Form("فارسی"),
    year: int | None = Form(None),
    pages: int | None = Form(None),
    file: UploadFile = File(...),
    cover: UploadFile = File(...),
    db: Session = Depends(get_db),
    admin_user=Depends(get_admin_user)
):
    allowed_mimes = ["application/pdf", "image/jpeg", "image/png", "image/webp"]
    timestamp = int(datetime.now(timezone.utc).timestamp())

    async def save_file(upload_file: UploadFile):
        content = await upload_file.read()
        # size check
        if len(content) > settings.MAX_UPLOAD_SIZE_BYTES:
            raise HTTPException(status_code=413, detail="File too large")
        # mime check using python-magic
        try:
            mime = magic.from_buffer(content, mime=True)
        except Exception:
            logging.exception("magic failed")
            raise HTTPException(status_code=400, detail="Could not determine file type")
        if mime not in allowed_mimes:
            raise HTTPException(status_code=400, detail=f"File MIME not allowed: {mime}")
        # ensure extension sanity
        ext = upload_file.filename.split(".")[-1].lower()
        unique_name = f"{timestamp}_{uuid.uuid4().hex}.{ext}"
        path = os.path.join(UPLOAD_DIR, unique_name)
        try:
            with open(path, "wb") as f:
                f.write(content)
        except Exception as e:
            logging.exception("failed to save upload")
            raise HTTPException(status_code=500, detail="Failed to save file")
        return unique_name

    try:
        file_filename = await save_file(file)
        cover_filename = await save_file(cover)

        # store only filenames in DB; create_book expects filenames
        book_data = BookCreate(
            title=title,
            author=author,
            description=description,
            language=language,
            pdf_url=file_filename,   # filename only
            cover_url=cover_filename,
            year=year,
            pages=pages,
            category_id=category_id
        )

        return create_book(db, book_data, pdf_filename=file_filename, cover_filename=cover_filename)

    except HTTPException:
        raise
    except Exception:
        logging.exception("unexpected error in upload")
        raise HTTPException(status_code=500, detail="Internal server error")
