from sqlalchemy.orm import Session
from app.models.models import Category, Tag
from typing import List, Optional
import uuid

# -------------------------
# دسته‌بندی‌ها
# -------------------------
def get_categories(db: Session, skip: int = 0, limit: int = 100) -> List[Category]:
    return db.query(Category).offset(skip).limit(limit).all()

def get_category(db: Session, category_id: str) -> Optional[Category]:
    return db.query(Category).filter(Category.id == category_id).first()

def create_category(db: Session, name: str, description: str = "") -> Category:
    category = Category(
        id=str(uuid.uuid4()),
        name=name,
        description=description
    )
    db.add(category)
    db.commit()
    db.refresh(category)
    return category

def update_category(db: Session, category_id: str, **kwargs) -> Optional[Category]:
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        return None
    for key, value in kwargs.items():
        if hasattr(category, key):
            setattr(category, key, value)
    db.commit()
    db.refresh(category)
    return category

def delete_category(db: Session, category_id: str) -> bool:
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        return False
    db.delete(category)
    db.commit()
    return True


# -------------------------
# برچسب‌ها
# -------------------------
def get_tags(db: Session, skip: int = 0, limit: int = 100) -> List[Tag]:
    return db.query(Tag).offset(skip).limit(limit).all()

def get_tag(db: Session, tag_id: str) -> Optional[Tag]:
    return db.query(Tag).filter(Tag.id == tag_id).first()

def create_tag(db: Session, name: str) -> Tag:
    tag = Tag(
        id=str(uuid.uuid4()),
        name=name
    )
    db.add(tag)
    db.commit()
    db.refresh(tag)
    return tag

def update_tag(db: Session, tag_id: str, **kwargs) -> Optional[Tag]:
    tag = db.query(Tag).filter(Tag.id == tag_id).first()
    if not tag:
        return None
    for key, value in kwargs.items():
        if hasattr(tag, key):
            setattr(tag, key, value)
    db.commit()
    db.refresh(tag)
    return tag

def delete_tag(db: Session, tag_id: str) -> bool:
    tag = db.query(Tag).filter(Tag.id == tag_id).first()
    if not tag:
        return False
    db.delete(tag)
    db.commit()
    return True
