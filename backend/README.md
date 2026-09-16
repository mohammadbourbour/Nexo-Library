# Nexo-Library API

FastAPI + PostgreSQL backend for Nexo-Library.

See the root [README](../README.md) for environment variables, API routes, and how to run the stack.

Full stack: from the repo root, `docker compose up --build`. First admin:

```bash
docker compose exec backend python create_admin.py --email admin@example.edu --password 'your-password' --name Admin
```
