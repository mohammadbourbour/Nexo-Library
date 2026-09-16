from fastapi import APIRouter, Depends
from fastapi.responses import FileResponse

from app.core.files import resolve_existing
from app.deps import get_current_user
from app.models.models import User

router = APIRouter(prefix="/api/files", tags=["files"])


@router.get("/pdf/{filename}")
def serve_pdf(filename: str, _user: User = Depends(get_current_user)):
    path = resolve_existing("pdf", filename)
    return FileResponse(
        path,
        media_type="application/pdf",
        filename=filename,
        content_disposition_type="inline",
    )


@router.get("/cover/{filename}")
def serve_cover(filename: str):
    path = resolve_existing("cover", filename)
    return FileResponse(path)
