# کتابخانه الکترونیک دانشگاه صدرالمتألهین

یک سیستم مدیریت کتابخانه الکترونیک مدرن با قابلیت خواندن PDF آنلاین، مدیریت کتاب‌ها و احراز هویت کاربران.

## ویژگی‌های اصلی

### برای کاربران عادی
- 📚 مشاهده و جستجوی کتاب‌ها
- 📖 خواندن PDF آنلاین با قابلیت زوم و ناوبری بین صفحات
- 🔍 فیلتر کردن بر اساس دسته‌بندی، زبان و سال انتشار
- 💾 دانلود فایل PDF کتاب‌ها
- 👤 ثبت‌نام و ورود به سیستم

### برای مدیران
- ➕ افزودن کتاب جدید
- ✏️ ویرایش اطلاعات کتاب‌ها
- 🗑️ حذف کتاب‌ها
- 📤 آپلود فایل PDF و تصویر کاور
- 📊 مدیریت دسته‌بندی‌ها

## تکنولوژی‌های استفاده شده

### Frontend
- **React 18** - کتابخانه اصلی UI
- **TypeScript** - تایپ‌سیف JavaScript
- **Vite** - ابزار بیلد سریع
- **Tailwind CSS** - فریمورک CSS
- **Shadcn/ui** - کامپوننت‌های آماده UI
- **React Router** - مدیریت روت‌ها
- **React PDF** - نمایش و خواندن PDF
- **Tanstack Query** - مدیریت state و cache
- **Lucide React** - آیکون‌ها

### Backend API (نیاز به پیاده‌سازی)
پروژه آماده اتصال به بک‌اند پایتون است. تمام سرویس‌ها و endpoint‌ها تعریف شده‌اند.

## نصب و راه‌اندازی

### پیش‌نیازها
- Node.js (نسخه 18 یا بالاتر)
- npm یا bun

### مراحل نصب

1. کلون کردن پروژه:
```bash
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
```

2. نصب وابستگی‌ها:
```bash
npm install
# یا
bun install
```

3. ایجاد فایل محیطی:
```bash
cp .env.example .env
```

4. تنظیم URL بک‌اند در فایل `.env`:
```env
VITE_API_URL=http://localhost:8000
```

5. اجرای پروژه در حالت توسعه:
```bash
npm run dev
# یا
bun dev
```

پروژه روی `http://localhost:5173` اجرا می‌شود.

## ساختار پروژه

```
src/
├── components/          # کامپوننت‌های قابل استفاده مجدد
│   ├── ui/             # کامپوننت‌های پایه UI
│   ├── BookCard.tsx    # کارت نمایش کتاب
│   ├── Header.tsx      # هدر سایت
│   └── Footer.tsx      # فوتر سایت
├── contexts/           # React Context ها
│   └── AuthContext.tsx # مدیریت احراز هویت
├── pages/              # صفحات اصلی
│   ├── Home.tsx        # صفحه اصلی
│   ├── BookDetail.tsx  # جزئیات کتاب
│   ├── ReadBook.tsx    # خواندن PDF
│   ├── Admin.tsx       # پنل مدیریت
│   ├── Login.tsx       # ورود و ثبت‌نام
│   ├── About.tsx       # درباره ما
│   └── Contact.tsx     # تماس با ما
├── services/           # سرویس‌های API
│   ├── authService.ts  # سرویس احراز هویت
│   ├── bookService.ts  # سرویس کتاب‌ها
│   └── adminService.ts # سرویس مدیریت
├── config/             # تنظیمات
│   └── api.ts         # تنظیمات API
├── types/              # تعریف Type ها
│   └── book.ts        # تایپ کتاب
├── data/               # داده‌های موقت
│   └── mockBooks.ts   # کتاب‌های نمونه
└── lib/                # توابع کمکی
    └── utils.ts       # توابع عمومی
```

## اتصال به بک‌اند پایتون

### API Endpoints مورد نیاز

پروژه انتظار دارد بک‌اند شما این endpoint‌ها را پیاده‌سازی کند:

#### احراز هویت
```
POST   /api/auth/login      - ورود کاربر
POST   /api/auth/signup     - ثبت‌نام کاربر
POST   /api/auth/logout     - خروج کاربر
GET    /api/auth/verify     - تایید توکن
```

#### کتاب‌ها
```
GET    /api/books           - دریافت لیست کتاب‌ها
GET    /api/books/:id       - دریافت جزئیات یک کتاب
GET    /api/books/:id/pdf   - دریافت فایل PDF کتاب
```

#### مدیریت (نیاز به توکن ادمین)
```
POST   /api/admin/books/create       - ایجاد کتاب جدید
PUT    /api/admin/books/:id          - ویرایش کتاب
DELETE /api/admin/books/:id          - حذف کتاب
POST   /api/admin/upload/pdf         - آپلود PDF
POST   /api/admin/upload/cover       - آپلود تصویر کاور
```

### فرمت داده‌ها

#### User Object
```typescript
{
  id: string;
  email: string;
  name: string;
  role: "admin" | "user";
}
```

#### Book Object
```typescript
{
  id: string;
  title: string;
  author: string;
  description: string;
  category: string;
  tags: string[];
  language: string;
  year: number;
  pages: number;
  coverUrl: string;
  pdfUrl: string;
  createdAt: string;
}
```

#### Login/Signup Response
```typescript
{
  success: boolean;
  token?: string;
  user?: User;
  error?: string;
}
```

### احراز هویت با JWT

بک‌اند باید از JWT token برای احراز هویت استفاده کند:

1. بعد از login/signup موفق، توکن JWT برگردانده می‌شود
2. Frontend توکن را در localStorage ذخیره می‌کند
3. در درخواست‌های بعدی، توکن در header ارسال می‌شود:
```
Authorization: Bearer <token>
```

### مثال پیاده‌سازی با FastAPI

```python
from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
import jwt

app = FastAPI()
security = HTTPBearer()

class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    success: bool
    token: str = None
    user: dict = None
    error: str = None

@app.post("/api/auth/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    # بررسی اعتبار کاربر در دیتابیس
    # اگر معتبر بود، JWT token تولید کن
    token = create_jwt_token(user_id, user_role)
    return LoginResponse(
        success=True,
        token=token,
        user={
            "id": user_id,
            "email": request.email,
            "name": user_name,
            "role": user_role
        }
    )

@app.get("/api/books")
async def get_books(credentials: HTTPAuthorizationCredentials = Depends(security)):
    # بررسی توکن
    user = verify_token(credentials.credentials)
    # برگرداندن لیست کتاب‌ها
    return books
```

## CORS Configuration

بک‌اند پایتون باید CORS را فعال کند:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://your-domain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## بیلد برای تولید

```bash
npm run build
# یا
bun build
```

فایل‌های بیلد شده در پوشه `dist/` قرار می‌گیرند.

## تست بیلد

```bash
npm run preview
# یا
bun preview
```

## دیپلوی در Lovable

برای دیپلوی پروژه، به [Lovable](https://lovable.dev/projects/ffb28755-adc2-4522-bf49-1109ec0ec321) بروید و روی Share > Publish کلیک کنید.

## اتصال دامنه سفارشی

می‌توانید یک دامنه سفارشی به پروژه خود متصل کنید:
- به Project > Settings > Domains بروید
- روی Connect Domain کلیک کنید
- [مستندات](https://docs.lovable.dev/features/custom-domain#custom-domain)

## مشارکت در پروژه

1. Fork کردن پروژه
2. ایجاد branch جدید (`git checkout -b feature/AmazingFeature`)
3. Commit کردن تغییرات (`git commit -m 'Add some AmazingFeature'`)
4. Push کردن به branch (`git push origin feature/AmazingFeature`)
5. باز کردن Pull Request

## لایسنس

این پروژه تحت لایسنس MIT منتشر شده است.

---

ساخته شده با ❤️ برای دانشگاه صدرالمتألهین
