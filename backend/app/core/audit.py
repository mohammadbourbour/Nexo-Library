from fastapi import Request
from sqlalchemy.orm import Session

from app.models.models import AuditEvent, User


def client_ip(request: Request | None) -> str | None:
    if request is None or request.client is None:
        return None
    return request.client.host


def record_audit(
    db: Session,
    *,
    actor: User | None,
    action: str,
    entity_type: str,
    entity_id: str | None,
    request: Request | None = None,
) -> None:
    event = AuditEvent(
        actor_id=actor.id if actor else None,
        action=action,
        entity_type=entity_type,
        entity_id=str(entity_id) if entity_id is not None else None,
        ip=client_ip(request),
    )
    db.add(event)
    db.commit()
