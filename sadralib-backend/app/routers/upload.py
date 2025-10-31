from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timezone
import uuid, os
import mimetypes
from app.deps import get_admin_user, get_db
from app.schemas.schemas import BookCreate
from app.crud.crud_books import create_book
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

router = APIRouter(tags=["upload"])

UPLOAD_DIR = "static/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# MIME types مجاز برای فایل‌های مختلف
ALLOWED_MIME_TYPES = {
    "pdf": ["application/pdf"],
    "jpg": ["image/jpeg"],
    "jpeg": ["image/jpeg"],
    "png": ["image/png"],
    "webp": ["image/webp"]
}

@router.post("/upload", response_model=BookCreate)
async def upload_book(
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
    timestamp = int(datetime.now(timezone.utc).timestamp())
    max_size_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024

    async def validate_and_save_file(upload_file: UploadFile, is_pdf: bool = False):
        """
        فایل را اعتبارسنجی و ذخیره کن
        """
        if not upload_file.filename:
            raise HTTPException(status_code=400, detail="نام فایل نامعتبر است")

        # بررسی extension
        ext = upload_file.filename.split(".")[-1].lower()
        if ext not in settings.ALLOWED_UPLOAD_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=f"نوع فایل '{ext}' مجاز نیست. فایل‌های مجاز: {', '.join(settings.ALLOWED_UPLOAD_EXTENSIONS)}"
            )

        # خواندن فایل به حافظه برای بررسی اندازه و MIME type
        contents = await upload_file.read()
        file_size = len(contents)

        # بررسی اندازه فایل
        if file_size > max_size_bytes:
            raise HTTPException(
                status_code=413,
                detail=f"اندازه فایل ({file_size / 1024 / 1024:.2f}MB) از حد مجاز ({settings.MAX_UPLOAD_SIZE_MB}MB) بیشتر است"
            )

        # بررسی MIME type
        mime_type, _ = mimetypes.guess_type(upload_file.filename)
        allowed_mimes = ALLOWED_MIME_TYPES.get(ext, [])

        if mime_type not in allowed_mimes:
            logger.warning(f"MIME type mismatch for {upload_file.filename}: {mime_type}")
            raise HTTPException(
                status_code=400,
                detail=f"فایل دارای نوع نامعتبر است (MIME: {mime_type})"
            )

        # ذخیره فایل امن
        unique_name = f"{timestamp}_{uuid.uuid4().hex}.{ext}"
        path = os.path.join(UPLOAD_DIR, unique_name)

        try:
            with open(path, "wb") as f:
                f.write(contents)
            logger.info(f"File saved: {unique_name} ({file_size} bytes)")
        except Exception as e:
            logger.error(f"Error saving file {unique_name}: {str(e)}")
            raise HTTPException(status_code=500, detail="خطا در ذخیره فایل")

        return unique_name

    try:
        # اعتبارسنجی و ذخیره فایل PDF
        file_filename = await validate_and_save_file(file, is_pdf=True)

        # اعتبارسنجی و ذخیره تصویر cover
        cover_filename = await validate_and_save_file(cover, is_pdf=False)

        # ایجاد رکورد کتاب در دیتابیس
        book_data = BookCreate(
            title=title,
            author=author,
            description=description,
            language=language,
            pdf_url=f"/static/uploads/{file_filename}",
            cover_url=f"/static/uploads/{cover_filename}",
            year=year,
            pages=pages,
            category_id=category_id
        )

        book = create_book(db, book_data, pdf_filename=file_filename, cover_filename=cover_filename)
        logger.info(f"Book created successfully: {book.id}")
        return book

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error during upload: {str(e)}")
        raise HTTPException(status_code=500, detail="خطای داخلی در آپلود فایل")
