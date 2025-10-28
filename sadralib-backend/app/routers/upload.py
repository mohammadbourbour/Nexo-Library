from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timezone
import uuid, os
from app.deps import get_admin_user, get_db
from app.schemas.schemas import BookCreate
from app.crud.crud_books import create_book

router = APIRouter(tags=["upload"])

UPLOAD_DIR = "static/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

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
    allowed_extensions = ["pdf", "jpg", "png", "jpeg", "webp"]
    timestamp = int(datetime.now(timezone.utc).timestamp())

    async def save_file(upload_file: UploadFile):
        ext = upload_file.filename.split(".")[-1].lower()
        if ext not in allowed_extensions:
            raise HTTPException(status_code=400, detail=f"File type not allowed: {ext}")
        unique_name = f"{timestamp}_{uuid.uuid4().hex}.{ext}"
        path = os.path.join(UPLOAD_DIR, unique_name)
        with open(path, "wb") as f:
            f.write(await upload_file.read())
        return unique_name

    try:
        # ذخیره فایل‌ها
        file_filename = await save_file(file)
        cover_filename = await save_file(cover)

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
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
