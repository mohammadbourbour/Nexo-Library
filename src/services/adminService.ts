import { API_BASE_URL, API_ENDPOINTS } from '@/config/api';
import { Book } from '@/types/book';
import { authService } from './authService';

export interface CreateBookData {
  title: string;
  author: string;
  description?: string;
  category_id?: string;
  tags?: string[];
  language?: string;
  year?: number;
  pages?: number;
  cover_path?: string; // اگر فایل روی سرور باشه
  pdf_path?: string;   // اگر فایل روی سرور باشه
}

export interface UpdateBookData extends Partial<CreateBookData> {
  id: string;
}

class AdminService {
  private getAuthHeaders(isFormData = false): HeadersInit {
    const headers: HeadersInit = isFormData ? {} : { 'Content-Type': 'application/json' };
    const token = authService.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  }

  async createBook(bookData: CreateBookData): Promise<Book> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ADMIN_BOOK_CREATE}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(bookData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create book');
    }
    return await response.json();
  }

  async updateBook(bookData: UpdateBookData): Promise<Book> {
    const { id, ...data } = bookData;
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ADMIN_BOOK_UPDATE(id)}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update book');
    }
    return await response.json();
  }

  async deleteBook(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ADMIN_BOOK_DELETE(id)}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete book');
    }
  }

  async uploadPdf(file: File, bookId?: string): Promise<{ url: string; bookId?: string }> {
    const formData = new FormData();
    formData.append('pdf', file);
    if (bookId) formData.append('bookId', bookId);

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ADMIN_UPLOAD_PDF}`, {
      method: 'POST',
      headers: this.getAuthHeaders(true),
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to upload PDF');
    }
    return await response.json();
  }

  async uploadCover(file: File, bookId?: string): Promise<{ url: string; bookId?: string }> {
    const formData = new FormData();
    formData.append('cover', file);
    if (bookId) formData.append('bookId', bookId);

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ADMIN_UPLOAD_COVER}`, {
      method: 'POST',
      headers: this.getAuthHeaders(true),
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to upload cover');
    }
    return await response.json();
  }
}

export const adminService = new AdminService();
