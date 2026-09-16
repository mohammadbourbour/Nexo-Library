# Nexo-Library

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

- Node.js 18+
- Python 3.11+ (for the API)
- PostgreSQL 15 (or Docker)

---

## راه‌اندازی Frontend / Frontend setup

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

### Docker Compose

```bash
cd backend
docker compose up --build
```

Compose starts PostgreSQL and the API on port **8000**. Local compose defaults use database name `nexo_library` and user `nexo` (development placeholders only).

### بدون Docker / Without Docker

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python create_db.py
uvicorn app.main:app --reload --port 8000
```

CORS allows `http://localhost:8080` and `http://localhost:5173`. Uploaded PDFs and covers are served from `/static`.

### متغیرهای محیطی Backend (فقط نام‌ها)

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | SQLAlchemy PostgreSQL URL |
| `JWT_SECRET` | Signing key for access tokens |
| `JWT_ALGORITHM` | JWT algorithm (example: `HS256`) |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token lifetime in minutes |
| `UPLOAD_DIR` | Upload directory used by settings |
| `FRONTEND_URL` | Frontend origin (documented for local/dev) |
| `ADMIN_SECRET` | Required to create additional admins after the first one |
| `ENV` | `development` or `production` (cookie/security related) |

Do not commit `.env` files or real secret values.

---

## API

Routers are mounted in `backend/app/main.py`.

### Auth — `/api/auth`

| Method | Path | Notes |
| --- | --- | --- |
| `POST` | `/signup` | Rate-limited; creates a regular user |
| `POST` | `/login` | OAuth2 password form (`username` = email); sets `access_token` cookie |
| `POST` | `/logout` | Clears the cookie |
| `GET` | `/verify` | Validates the current user |
| `GET` | `/me` | Current user profile |
| `POST` | `/create-admin` | First admin is open; later calls require `ADMIN_SECRET` |

Login JSON does not return the JWT in the body; the frontend also sends `Authorization: Bearer` when it has a token in `localStorage`.

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
| `POST` | `/upload` | Admin; `multipart/form-data` (PDF + cover + book fields). Max file size 10 MB. |

OpenAPI docs: **http://localhost:8000/docs**

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
│   └── docker-compose.yml
├── .env.example
└── backend/.env.example
```

---

## مجوز / License

MIT — see repository settings if a license file is added.

---

<p align="center">Nexo-Library</p>
