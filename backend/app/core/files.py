import imghdr
import io
import os
import uuid
from datetime import datetime, timezone
from pathlib import Path

from fastapi import HTTPException, UploadFile

from app.core.config import settings

PDF_MAGIC = b"%PDF"
ALLOWED_IMAGE_EXTENSIONS = {"jpg", "jpeg", "png", "webp"}


def _ensure_dirs() -> tuple[Path, Path]:
    base = Path(settings.UPLOAD_DIR)
    pdf_dir = base / "pdfs"
    cover_dir = base / "covers"
    pdf_dir.mkdir(parents=True, exist_ok=True)
    cover_dir.mkdir(parents=True, exist_ok=True)
    return pdf_dir, cover_dir


def stored_filename(value: str | None) -> str | None:
    if not value:
        return None
    name = value.rstrip("/").split("/")[-1]
    if not name or name in {".", ".."} or "/" in name or "\\" in name:
        return None
    return name


def pdf_public_url(filename: str) -> str:
    return f"/api/files/pdf/{filename}"


def cover_public_url(filename: str) -> str:
    return f"/api/files/cover/{filename}"


def resolve_existing(kind: str, name: str) -> Path:
    filename = stored_filename(name)
    if not filename:
        raise HTTPException(status_code=404, detail="File not found")
    pdf_dir, cover_dir = _ensure_dirs()
    base = pdf_dir if kind == "pdf" else cover_dir
    path = (base / filename).resolve()
    if not str(path).startswith(str(base.resolve())) or not path.is_file():
        raise HTTPException(status_code=404, detail="File not found")
    return path


def _unique_name(ext: str) -> str:
    ts = int(datetime.now(timezone.utc).timestamp())
    return f"{ts}_{uuid.uuid4().hex}.{ext}"


async def save_pdf(upload_file: UploadFile) -> str:
    original = upload_file.filename or "file.pdf"
    ext = original.rsplit(".", 1)[-1].lower() if "." in original else "pdf"
    if ext != "pdf":
        raise HTTPException(status_code=400, detail="File type not allowed: PDF required")

    contents = await upload_file.read()
    if len(contents) > settings.max_pdf_bytes:
        raise HTTPException(
            status_code=400,
            detail=f"PDF too large (max {settings.MAX_PDF_SIZE_MB} MB)",
        )
    if not contents.startswith(PDF_MAGIC):
        raise HTTPException(status_code=400, detail="Invalid PDF file")

    pdf_dir, _ = _ensure_dirs()
    name = _unique_name("pdf")
    path = pdf_dir / name
    with open(path, "wb") as f:
        f.write(contents)
    return name


async def save_cover(upload_file: UploadFile) -> str:
    original = upload_file.filename or "cover.jpg"
    ext = original.rsplit(".", 1)[-1].lower() if "." in original else ""
    if ext not in ALLOWED_IMAGE_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"File type not allowed: {ext or 'unknown'}")

    contents = await upload_file.read()
    if len(contents) > settings.max_cover_bytes:
        raise HTTPException(
            status_code=400,
            detail=f"Cover too large (max {settings.MAX_COVER_SIZE_MB} MB)",
        )
    kind = imghdr.what(io.BytesIO(contents))
    is_webp = ext == "webp" and contents[:4] == b"RIFF" and contents[8:12] == b"WEBP"
    if kind not in {"jpeg", "png", "gif", "webp"} and not is_webp:
        raise HTTPException(status_code=400, detail="Invalid image file")

    _, cover_dir = _ensure_dirs()
    name = _unique_name(ext)
    path = cover_dir / name
    with open(path, "wb") as f:
        f.write(contents)
    return name


def delete_stored(kind: str, url_or_name: str | None) -> None:
    name = stored_filename(url_or_name)
    if not name:
        return
    try:
        path = resolve_existing(kind, name)
        os.remove(path)
    except HTTPException:
        return
