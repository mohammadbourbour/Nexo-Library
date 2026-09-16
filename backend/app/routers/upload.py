from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timezone
import uuid, os
from app.deps import get_admin_user, get_db
from app.schemas.schemas import BookCreate
from app.crud.crud_books import create_book
import imghdr

router = APIRouter(tags=["upload"])

UPLOAD_DIR = "static/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
ALLOWED_EXTENSIONS = ["pdf", "jpg", "png", "jpeg", "webp"]
ALLOWED_IMAGE_EXTENSIONS = ["jpg", "png", "jpeg", "webp"]

async def save_file(upload_file: UploadFile, allowed_exts: list[str]) -> str:
    ext = upload_file.filename.split(".")[-1].lower()
    if ext not in allowed_exts:
        raise HTTPException(status_code=400, detail=f"File type not allowed: {ext}")

    contents = await upload_file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail=f"File too large: {upload_file.filename}")

    # برای تصاویر، چک MIME/فرمت واقعی
    if ext in ALLOWED_IMAGE_EXTENSIONS:
        import io
        if not imghdr.what(io.BytesIO(contents)):
            raise HTTPException(status_code=400, detail="Invalid image file")

    timestamp = int(datetime.now(timezone.utc).timestamp())
    unique_name = f"{timestamp}_{uuid.uuid4().hex}.{ext}"
    path = os.path.join(UPLOAD_DIR, unique_name)

    with open(path, "wb") as f:
        f.write(contents)

    return unique_name

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
    file_filename = cover_filename = None
    try:
        # ذخیره امن فایل‌ها
        file_filename = await save_file(file, ALLOWED_EXTENSIONS)
        cover_filename = await save_file(cover, ALLOWED_IMAGE_EXTENSIONS)

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

        return create_book(db, book_data, pdf_filename=file_filename, cover_filename=cover_filename)

    except HTTPException:
        # در صورت خطای HTTP، فایل‌های ذخیره شده پاک شوند
        for f_name in [file_filename, cover_filename]:
            if f_name:
                try:
                    os.remove(os.path.join(UPLOAD_DIR, f_name))
                except Exception:
                    pass
        raise

    except Exception as e:
        # پاکسازی فایل‌ها در صورت خطا
        for f_name in [file_filename, cover_filename]:
            if f_name:
                try:
                    os.remove(os.path.join(UPLOAD_DIR, f_name))
                except Exception:
                    pass
        raise HTTPException(status_code=500, detail="Internal server error")
