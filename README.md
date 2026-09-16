# Nexo-Library (V1)

<p align="center">
  <strong>سامانه مدیریت کتابخانه الکترونیک</strong><br />
  <em>Electronic library management for students, faculty, and administrators</em>
</p>

<p align="center">
  <img alt="React 18" src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" />
  <img alt="Vite" src="https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white" />
  <img alt="FastAPI" src="https://img.shields.io/badge/FastAPI-Python-009688?logo=fastapi&logoColor=white" />
  <img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql&logoColor=white" />
</p>

---

## فارسی

**Nexo-Library** پلتفرمی برای مدیریت کتابخانه الکترونیک است: گردش‌کار ادمین ساده‌تر، و دسترسی آنلاین دانشجویان به منابع علمی و کتاب‌های دیجیتال.

معماری پروژه طوری طراحی شده که در آینده بتوان قابلیت‌های هوشمند مبتنی بر هوش مصنوعی و اتوماسیون‌های داخلی را بدون بازنویسی هسته اضافه کرد (برای مثال پیشنهاد منابع، طبقه‌بندی کمکی، یا گردش‌کارهای پس‌زمینه). این امکانات هنوز پیاده‌سازی نشده‌اند؛ لایه سرویس و API فعلی نقطه اتصال آن‌هاست.

### امکانات دانشجویان
- جستجو در عنوان، نویسنده و توضیحات
- فیلتر پیشرفته بر اساس دسته، زبان و سال انتشار
- مطالعه PDF در مرورگر با جابه‌جایی صفحه و بزرگ‌نمایی
- ثبت‌نام، ورود و مشاهده جزئیات منابع

### امکانات مدیران
- پنل کامل برای بارگذاری، ویرایش و حذف منابع
- دسته‌بندی منابع
- احراز هویت و نقش ادمین برای مسیرهای مدیریتی

### پشته فنی (Frontend)
- **React 18** و **TypeScript**
- **Vite**، **Tailwind CSS**، **shadcn/ui**
- **React Router**، **TanStack Query**، **react-pdf**

### پشته فنی (Backend)
پیاده‌سازی واقعی در پوشه `backend/`:
- **FastAPI** + **Uvicorn**
- **PostgreSQL** با **SQLAlchemy** و **Alembic** (پوشه مهاجرت اختیاری)
- احراز هویت **JWT** (توکن در کوکی `HttpOnly` پس از ورود)
- ذخیره فایل روی دیسک در `static/uploads`

---

## English

**Nexo-Library** is an electronic library for cataloguing and serving scientific resources and digital books. Administrators manage the collection; students search, filter, and read PDFs in the browser.

The codebase is structured so AI-assisted features and internal automations can be added later without replacing the core app—for example resource suggestions, assisted classification, or background workflows. Those capabilities are not shipped yet; current services and HTTP APIs are the intended extension points.

### Students
- Search across titles, authors, and descriptions
- Advanced filters: category, language, publication year
- In-browser PDF reader with page navigation and zoom
- Account signup and login

### Administrators
- Full panel to upload, edit, and delete resources
- Category management
- Role-based access for admin routes

### Frontend stack
React **18.3** + TypeScript, Vite, Tailwind CSS, shadcn/ui, React Router, TanStack Query, and react-pdf.

### Backend stack
Located in `backend/`: FastAPI, PostgreSQL, SQLAlchemy, Alembic, JWT cookies, and local file storage under `static/uploads`.

---

## پیش‌نیازها / Prerequisites

- **یک فرمان با Docker:** Docker Engine **24+** و Compose **V2** (`docker compose`)
- بدون Docker: Node.js 18+، Python 3.11+، PostgreSQL 15

---

## یک فرمان / One command (Docker)

```bash
docker compose up --build
```

پس‌زمینه: `docker compose up --build -d`

| سرویس | آدرس پیش‌فرض |
| --- | --- |
| UI (nginx + SPA) | http://localhost:8080 |
| API | http://localhost:8000 |
| PostgreSQL | localhost:5432 |

مرورگر باید UI را روی **8080** باز کند. Nginx مسیر `/api` را به بک‌اند پروکسی می‌کند (کوکی JWT روی همان origin). `FRONTEND_URL` در Compose برابر origin عمومی UI است (`http://localhost:8080`).

متغیرها (از جمله `JWT_SECRET` و `ADMIN_SECRET`) در `.env.example` نام‌گذاری شده‌اند. فایل `.env` را commit نکنید؛ بدون آن هم Compose با پیش‌فرض‌های توسعه بالا می‌آید:

```bash
cp .env.example .env   # اختیاری — برای بازنویسی اسرار و پورت‌ها
```

اولین ادمین (HTTP `/create-admin` در production غیرفعال است):

```bash
docker compose exec backend python create_admin.py --email admin@example.edu --password 'your-password' --name Admin
```

توقف: `docker compose down` — حجم‌های نام‌گذاری‌شده `postgres_data` و `uploads_data` داده و فایل‌ها را نگه می‌دارند.

**English:** Docker Engine **24+** with Compose V2. `docker compose up --build` starts the UI on **8080**, the API on **8000**, and Postgres on **5432**. Open the UI origin in the browser; nginx proxies `/api` so JWT cookies and CORS (`FRONTEND_URL`) stay on that origin. Override `JWT_SECRET` and `ADMIN_SECRET` in `.env` (see `.env.example`; never commit secrets). First admin: `docker compose exec backend python create_admin.py --email admin@example.edu --password 'your-password' --name Admin`.

---

## راه‌اندازی Frontend / Frontend setup (بدون Docker / without Docker)

```bash
cp .env.example .env
npm install
npm run dev
```

The Vite dev server listens on **http://localhost:8080**.

Environment variable (name only):

| Variable | Purpose |
| --- | --- |
| `VITE_API_URL` | Base URL of the FastAPI server (default in code: `http://127.0.0.1:8000`) |

```bash
npm run build
npm run preview
```

---

## راه‌اندازی Backend / Backend setup

```bash
cd backend
cp .env.example .env
# Edit .env with your own secrets — never commit it
```

### Docker Compose (API + database only)

Prefer the **root** `docker compose up --build` for the full stack. API-only:

```bash
cd backend
docker compose up --build
```

That file starts PostgreSQL and the API on port **8000**. Local defaults use database name `nexo_library` and user `nexo` (development placeholders only).

### بدون Docker / Without Docker

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python create_db.py
uvicorn app.main:app --reload --port 8000
```

CORS uses `FRONTEND_URL` (plus localhost origins in development). Uploaded covers are public at `/api/files/cover/{filename}`; PDFs require a logged-in session at `/api/files/pdf/{filename}`. OpenAPI (`/docs`) is disabled when `ENV=production`.

Create the first production admin with:

```bash
cd backend
python create_admin.py --email admin@example.edu --password 'your-password' --name Admin
```

### متغیرهای محیطی Backend (فقط نام‌ها)

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | SQLAlchemy PostgreSQL URL |
| `JWT_SECRET` | Signing key for access tokens (rejected if default/weak in production) |
| `JWT_ALGORITHM` | JWT algorithm (example: `HS256`) |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token lifetime in minutes |
| `UPLOAD_DIR` | Upload directory (PDFs and covers stored outside the public static tree) |
| `FRONTEND_URL` | Exact frontend origin for CORS and cookie-backed requests |
| `ADMIN_SECRET` | Required to create additional admins in development (HTTP create-admin is disabled in production) |
| `ENV` | `development` or `production` |
| `ALLOWED_EMAIL_DOMAIN` | Optional; if set, signup emails must match this domain |
| `ENABLE_SIGNUP` | Optional; set `false` to disable self-registration |
| `MAX_PDF_SIZE_MB` | Academic PDF size limit (default 80) |
| `MAX_COVER_SIZE_MB` | Cover image size limit (default 5) |

Do not commit `.env` files or real secret values.

---

## API

Routers are mounted in `backend/app/main.py`. Protected routes accept the JWT from the `access_token` **httpOnly cookie** or an `Authorization: Bearer` header. Admin checks use the user row in the database, not the JWT `role` claim.

### Auth — `/api/auth`

| Method | Path | Notes |
| --- | --- | --- |
| `POST` | `/signup` | Rate-limited; optional email-domain policy |
| `POST` | `/login` | OAuth2 password form (`username` = email); sets `access_token` cookie (`Secure` in production) |
| `POST` | `/logout` | Clears the cookie |
| `GET` | `/verify` | Cookie or Bearer; returns `{ valid, user }` |
| `GET` | `/me` | Current user profile |
| `POST` | `/create-admin` | Development only; after the first admin requires `admin_secret` or `ADMIN_SECRET`. Disabled in production — use `create_admin.py` |

### Books — `/api/books`

| Method | Path | Auth |
| --- | --- | --- |
| `GET` | `/` | Public list (`category_id` query optional) |
| `GET` | `/{book_id}` | Public detail |
| `POST` | `/` | Admin — create metadata |
| `PUT` | `/{book_id}` | Admin — update |
| `DELETE` | `/{book_id}` | Admin — delete (`204`) |

### Categories — `/api/categories`

| Method | Path | Auth |
| --- | --- | --- |
| `GET` | `/` | Public |
| `GET` | `/{category_id}` | Public |
| `POST` | `/` | Admin |
| `PUT` | `/{category_id}` | Admin |
| `DELETE` | `/{category_id}` | Admin |

### Upload — `/api`

| Method | Path | Auth |
| --- | --- | --- |
| `POST` | `/upload/` | Admin; `multipart/form-data` with PDF (`file` or `pdf`), `cover`, and book fields. PDF magic-byte check; PDF up to `MAX_PDF_SIZE_MB`, covers up to `MAX_COVER_SIZE_MB`. |
| `POST` | `/uploads/cover` | Admin; cover image only, returns `{ url }` |

### Files

| Method | Path | Auth |
| --- | --- | --- |
| `GET` | `/api/files/pdf/{filename}` | Logged-in user |
| `GET` | `/api/files/cover/{filename}` | Public |

### Student library

| Method | Path | Auth |
| --- | --- | --- |
| `GET` | `/api/saved-books` | Current user |
| `POST` | `/api/saved-books` | Body `{ book_id }` |
| `DELETE` | `/api/saved-books/{book_id}` | Current user |
| `GET` | `/api/me/progress` | Current user (resume list) |
| `PUT` | `/api/me/progress/{book_id}` | Body `{ page }`; throttled |

### Admin reports — `/api/admin`

| Method | Path | Auth |
| --- | --- | --- |
| `GET` | `/audit` | Admin; `page`, `page_size` |
| `GET` | `/stats/reading` | Admin; unique readers per book (no student identity) |

OpenAPI docs (development): **http://localhost:8000/docs**

---

## ساختار پروژه / Project layout

```
├── src/                     # React + TypeScript UI
│   ├── components/          # Header, Footer, BookCard, admin widgets, UI kit
│   ├── pages/               # Home, reader, admin, auth, about, contact
│   ├── services/            # auth, books, admin, categories
│   ├── contexts/            # AuthContext
│   └── config/api.ts        # API base URL and paths
├── backend/                 # FastAPI application
│   ├── app/routers/         # auth, books, category, upload
│   ├── app/models/          # SQLAlchemy models
│   ├── app/crud/            # persistence
│   └── docker-compose.yml   # API + Postgres only
├── docker/frontend/         # nginx image for the built SPA
├── docker-compose.yml       # full stack: UI + API + Postgres
├── .env.example
└── backend/.env.example
```

---

## مجوز / License

MIT — see repository settings if a license file is added.

---

<p align="center">Nexo-Library</p>
