from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.schemas.schemas import CategoryCreate, CategoryUpdate, CategoryOut
from app.crud.crud_categories_tags import (
    get_categories,
    get_category,
    create_category,
    update_category,
    delete_category,
)
from app.deps import get_db, get_admin_user

router = APIRouter(tags=["categories"])


# دریافت همه دسته‌ها (عمومی)
@router.get("/", response_model=List[CategoryOut])
def list_categories(db: Session = Depends(get_db)):
    return get_categories(db)


# دریافت یک دسته با ID
@router.get("/{category_id}", response_model=CategoryOut)
def retrieve_category(category_id: str, db: Session = Depends(get_db)):
    category = get_category(db, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category


# ایجاد دسته جدید (فقط ادمین)
@router.post("/", response_model=CategoryOut)
def create_new_category(
    data: CategoryCreate,
    db: Session = Depends(get_db),
    admin_user=Depends(get_admin_user)
):
    return create_category(db, data.name, data.description)


# بروزرسانی دسته (فقط ادمین)
@router.put("/{category_id}", response_model=CategoryOut)
def update_existing_category(
    category_id: str,
    data: CategoryUpdate,
    db: Session = Depends(get_db),
    admin_user=Depends(get_admin_user)
):
    updated = update_category(db, category_id, **data.dict(exclude_unset=True))
    if not updated:
        raise HTTPException(status_code=404, detail="Category not found")
    return updated


# حذف دسته (فقط ادمین)
@router.delete("/{category_id}")
def remove_category(
    category_id: str,
    db: Session = Depends(get_db),
    admin_user=Depends(get_admin_user)
):
    success = delete_category(db, category_id)
    if not success:
        raise HTTPException(status_code=404, detail="Category not found")
    return {"message": "Category deleted successfully"}
