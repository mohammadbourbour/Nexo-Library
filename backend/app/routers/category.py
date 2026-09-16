from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.core.audit import record_audit
from app.crud.crud_categories_tags import (
    create_category,
    delete_category,
    get_categories,
    get_category,
    update_category,
)
from app.deps import get_admin_user, get_db
from app.models.models import User
from app.schemas.schemas import CategoryCreate, CategoryOut, CategoryUpdate

router = APIRouter(tags=["categories"])


@router.get("/", response_model=list[CategoryOut])
def list_categories(db: Session = Depends(get_db)):
    return get_categories(db)


@router.get("/{category_id}", response_model=CategoryOut)
def retrieve_category(category_id: str, db: Session = Depends(get_db)):
    category = get_category(db, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category


@router.post("/", response_model=CategoryOut)
def create_new_category(
    request: Request,
    data: CategoryCreate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_admin_user),
):
    created = create_category(db, data.name, data.description)
    record_audit(
        db,
        actor=admin_user,
        action="create",
        entity_type="category",
        entity_id=created.id,
        request=request,
    )
    return created


@router.put("/{category_id}", response_model=CategoryOut)
def update_existing_category(
    request: Request,
    category_id: str,
    data: CategoryUpdate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_admin_user),
):
    updated = update_category(db, category_id, **data.model_dump(exclude_unset=True))
    if not updated:
        raise HTTPException(status_code=404, detail="Category not found")
    record_audit(
        db,
        actor=admin_user,
        action="update",
        entity_type="category",
        entity_id=category_id,
        request=request,
    )
    return updated


@router.delete("/{category_id}")
def remove_category(
    request: Request,
    category_id: str,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_admin_user),
):
    success = delete_category(db, category_id)
    if not success:
        raise HTTPException(status_code=404, detail="Category not found")
    record_audit(
        db,
        actor=admin_user,
        action="delete",
        entity_type="category",
        entity_id=category_id,
        request=request,
    )
    return {"message": "Category deleted successfully"}
