import { API_BASE_URL, API_ENDPOINTS } from '@/config/api';
import { Book } from '@/types/book';
import { authService } from './authService';

class BookService {
  private getAuthHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    const token = authService.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  async getAllBooks(): Promise<Book[]> {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.BOOKS}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch books');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching books:', error);
      throw error;
    }
  }

  async getBookById(id: string): Promise<Book> {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.BOOK_BY_ID(id)}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch book');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching book:', error);
      throw error;
    }
  }

  async getBookPdfUrl(id: string): Promise<string> {
    const token = authService.getToken();
    const url = `${API_BASE_URL}${API_ENDPOINTS.BOOK_PDF(id)}`;
    return token ? `${url}?token=${token}` : url;
  }

  async searchBooks(query: string): Promise<Book[]> {
    try {
      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.BOOKS}?search=${encodeURIComponent(query)}`,
        {
          method: 'GET',
          headers: this.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to search books');
      }

      return await response.json();
    } catch (error) {
      console.error('Error searching books:', error);
      throw error;
    }
  }

  async getBooksByCategory(category: string): Promise<Book[]> {
    try {
      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.BOOKS}?category=${encodeURIComponent(category)}`,
        {
          method: 'GET',
          headers: this.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch books by category');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching books by category:', error);
      throw error;
    }
  }
}

export const bookService = new BookService();
