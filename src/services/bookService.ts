import { API_BASE_URL, API_ENDPOINTS } from '@/config/api';
import { authService } from './authService';
import { title } from 'process';

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

 // services/bookService.ts
   async addBookWithCover(
    file: File,
    cover: File,
    title: string,
    author: string,
    description: string,
    token: string,
    category_id?: string,
    language?: string,
    year?: number | null,
    pages?: number | null
  ) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("cover", cover);
    formData.append("title", title);
    formData.append("author", author);
    formData.append("description", description);
    if (category_id) formData.append("category_id", category_id);
    if (language) formData.append("language", language);
    if (year !== undefined && year !== null) formData.append("year", year.toString());
    if (pages !== undefined && pages !== null) formData.append("pages", pages.toString());

    const res = await fetch(`${API_BASE_URL}/api/upload/`, {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || "خطا در آپلود کتاب");
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
}

export const bookService = new BookService();
