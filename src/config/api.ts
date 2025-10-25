export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/api/auth/login',
  SIGNUP: '/api/auth/signup',
  LOGOUT: '/api/auth/logout',
  VERIFY_TOKEN: '/api/auth/verify',

  // Books
  BOOKS: '/api/books',                       // GET → همه کتاب‌ها
  BOOK_BY_ID: (id: string) => `/api/books/${id}`,  // GET / PUT / DELETE
  ADMIN_BOOK_CREATE: '/api/books/',           // POST → ساخت کتاب (فقط ادمین)
  ADMIN_BOOK_UPDATE: (id: string) => `/api/books/${id}`, // PUT → بروزرسانی
  ADMIN_BOOK_DELETE: (id: string) => `/api/books/${id}`, // DELETE → حذف

  // PDF / Cover upload (اختیاری اگر مسیر فایل روی سرور باشه)
  ADMIN_UPLOAD_PDF: '/api/books/uploads/pdf',
  ADMIN_UPLOAD_COVER: '/api/books/uploads/cover',

  // Categories
  CATEGORIES: '/api/categories',             // GET → همه دسته‌بندی‌ها, POST → ساخت
  CATEGORY_BY_ID: (id: string) => `/api/categories/${id}`, // GET / PUT / DELETE
};


export async function request(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  data?: any,
  token?: string
) {
  // اگر endpoint لاگین هست Content-Type رو روی x-www-form-urlencoded می‌ذاریم
  const headers: Record<string, string> = {
    "Content-Type": endpoint === API_ENDPOINTS.LOGIN 
      ? "application/x-www-form-urlencoded" 
      : "application/json"
  };
  
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const body = data
    ? endpoint === API_ENDPOINTS.LOGIN 
      ? new URLSearchParams(data).toString()  // فرم لاگین
      : JSON.stringify(data)                 // بقیه درخواست‌ها JSON
    : undefined;

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text);
  }

  return res.json();
}

// -----------------------------
// Helper مخصوص Login
// -----------------------------
export async function login(username: string, password: string) {
  return request(API_ENDPOINTS.LOGIN, "POST", { username, password });
}
