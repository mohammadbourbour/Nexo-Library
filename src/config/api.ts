// API Configuration
// Set your Python backend URL here
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  // Authentication
  LOGIN: '/api/auth/login',
  SIGNUP: '/api/auth/signup',
  LOGOUT: '/api/auth/logout',
  VERIFY_TOKEN: '/api/auth/verify',
  
  // Books
  BOOKS: '/api/books',
  BOOK_BY_ID: (id: string) => `/api/books/${id}`,
  BOOK_PDF: (id: string) => `/api/books/${id}/pdf`,
  
  // Categories
  CATEGORIES: '/api/categories',
  
  // Admin
  ADMIN_BOOKS: '/api/admin/books',
  ADMIN_BOOK_CREATE: '/api/admin/books/create',
  ADMIN_BOOK_UPDATE: (id: string) => `/api/admin/books/${id}`,
  ADMIN_BOOK_DELETE: (id: string) => `/api/admin/books/${id}`,
  ADMIN_UPLOAD_PDF: '/api/admin/upload/pdf',
  ADMIN_UPLOAD_COVER: '/api/admin/upload/cover',
};
