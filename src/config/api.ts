export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export function resolveMediaUrl(url?: string | null, fallback = ""): string {
  if (!url) return fallback;
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
    return url;
  }
  if (url.startsWith("/placeholder") || url.startsWith("/sample")) {
    return url;
  }
  const path = url.startsWith("/") ? url : `/${url}`;
  return `${API_BASE_URL}${path}`;
}

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/api/auth/login',
  SIGNUP: '/api/auth/signup',
  LOGOUT: '/api/auth/logout',
  VERIFY_TOKEN: '/api/auth/verify',
  ME: '/api/auth/me',

  // Books
  BOOKS: '/api/books',
  BOOK_BY_ID: (id: string) => `/api/books/${id}`,
  ADMIN_BOOK_CREATE: '/api/books/',
  ADMIN_BOOK_UPDATE: (id: string) => `/api/books/${id}`,
  ADMIN_BOOK_DELETE: (id: string) => `/api/books/${id}`,

  // PDF / Cover upload (single contract with the API)
  ADMIN_UPLOAD_PDF: '/api/upload/',
  ADMIN_UPLOAD_COVER: '/api/uploads/cover',

  // Student library
  SAVED_BOOKS: '/api/saved-books',
  SAVED_BOOK_BY_ID: (id: string) => `/api/saved-books/${id}`,
  MY_PROGRESS: '/api/me/progress',
  MY_PROGRESS_BY_BOOK: (bookId: string) => `/api/me/progress/${bookId}`,

  // Admin
  ADMIN_AUDIT: '/api/admin/audit',
  ADMIN_READING_STATS: '/api/admin/stats/reading',

  // Categories
  CATEGORIES: '/api/categories',
  CATEGORY_BY_ID: (id: string) => `/api/categories/${id}`,
};

export async function request(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  data?: any,
  token?: string
) {
  const headers: Record<string, string> = {};

  const isMultipart = endpoint.includes("/upload");
  if (!isMultipart) {
    headers["Content-Type"] = endpoint === API_ENDPOINTS.LOGIN
      ? "application/x-www-form-urlencoded"
      : "application/json";
  }

  if (token) headers["Authorization"] = `Bearer ${token}`;

  let body: any;
  if (data) {
    if (endpoint === API_ENDPOINTS.LOGIN) {
      body = new URLSearchParams(data).toString();
    } else if (isMultipart) {
      body = data;
    } else {
      body = JSON.stringify(data);
    }
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body,
    credentials: "include",
  });

  if (!res.ok) {
    let error;
    try {
      error = await res.json();
    } catch {
      error = await res.text();
    }
    throw new Error(error.detail || error || "خطا در درخواست");
  }

  return res.json();
}

export async function login(username: string, password: string) {
  return request(API_ENDPOINTS.LOGIN, "POST", { username, password });
}
