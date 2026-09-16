#!/usr/bin/env python3
"""Create an admin user from the CLI (the HTTP /create-admin route is disabled in production)."""

import argparse
import sys

from app.core.security import get_password_hash
from app.db.session import SessionLocal
from app.models.models import User


def main() -> int:
    parser = argparse.ArgumentParser(description="Create an Nexo-Library admin user")
    parser.add_argument("--email", required=True)
    parser.add_argument("--password", required=True)
    parser.add_argument("--name", default="Admin")
    args = parser.parse_args()

    if len(args.password) < 8:
        print("Password must be at least 8 characters.", file=sys.stderr)
        return 1

    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == args.email).first()
        if existing:
            if existing.role != "admin":
                existing.role = "admin"
                existing.hashed_password = get_password_hash(args.password)
                existing.name = args.name
                db.commit()
                print(f"Promoted existing user to admin: {args.email}")
                return 0
            print("A user with that email already exists.", file=sys.stderr)
            return 1

        user = User(
            email=args.email,
            hashed_password=get_password_hash(args.password),
            name=args.name,
            role="admin",
        )
        db.add(user)
        db.commit()
        print(f"Admin created: {args.email}")
        return 0
    finally:
        db.close()


if __name__ == "__main__":
    raise SystemExit(main())
