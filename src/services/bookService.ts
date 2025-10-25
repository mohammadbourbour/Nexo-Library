import { API_BASE_URL, API_ENDPOINTS } from '@/config/api';
import { authService } from './authService';

class BookService {
  private getAuthHeaders(token?: string, isFormData = false): HeadersInit {
    const headers: HeadersInit = isFormData ? {} : { 'Content-Type': 'application/json' };
    const finalToken = token || authService.getToken();
    if (finalToken) headers['Authorization'] = `Bearer ${finalToken}`;
    return headers;
  }

  async getAllBooks() {
    const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.BOOKS}`);
    if (!res.ok) throw new Error("Failed to fetch books");
    return res.json();
  }

  async addBook(formData: FormData, token?: string) {
    const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.BOOKS}`, {
      method: "POST",
      headers: this.getAuthHeaders(token, true),
      body: formData,
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(err || "Failed to upload book");
    }
    return await res.json();
  }

  async deleteBook(id: string, token?: string) {
    const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.BOOK_BY_ID(id)}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(token),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(err || "Failed to delete book");
    }

    return true;
  }

  async getCategories() {
    const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.CATEGORIES}`);
    if (!res.ok) throw new Error("Failed to fetch categories");
    return res.json();
  }

  async addCategory(name: string, token?: string) {
    const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.CATEGORIES}`, {
      method: "POST",
      headers: this.getAuthHeaders(token),
      body: JSON.stringify({ name }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(err || "Failed to add category");
    }

    return res.json();
  }

  async deleteCategory(id: string, token?: string) {
    const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.CATEGORY_BY_ID(id)}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(token),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(err || "Failed to delete category");
    }

    return true;
  }
}

export const bookService = new BookService();
