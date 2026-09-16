import { API_BASE_URL, API_ENDPOINTS } from '@/config/api';

export interface CreateBookData {
  title: string;
  author: string;
  description?: string;
  category_id?: string;
  tags?: string[];
  language?: string;
  year?: number;
  pages?: number;
  cover_path?: string;
  pdf_path?: string;
}

export interface UpdateBookData extends Partial<CreateBookData> {
  id: string;
}

export interface AuditEvent {
  id: number;
  actor_id: number | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  ip: string | null;
  created_at: string;
}

export interface AuditPage {
  items: AuditEvent[];
  page: number;
  page_size: number;
  total: number;
}

export interface ReadingStat {
  book_id: string;
  title: string;
  unique_readers: number;
  last_activity: string | null;
}

class AdminService {
  async createBook(bookData: CreateBookData) {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ADMIN_BOOK_CREATE}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create book');
    }
    return await response.json();
  }

  async updateBook(bookData: UpdateBookData) {
    const { id, ...data } = bookData;
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ADMIN_BOOK_UPDATE(id)}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
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
      credentials: 'include',
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
      credentials: 'include',
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
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to upload cover');
    }
    return await response.json();
  }

  async getAudit(page = 1, pageSize = 20): Promise<AuditPage> {
    const res = await fetch(
      `${API_BASE_URL}${API_ENDPOINTS.ADMIN_AUDIT}?page=${page}&page_size=${pageSize}`,
      { credentials: 'include' }
    );
    if (!res.ok) throw new Error('Failed to fetch audit log');
    return res.json();
  }

  async getReadingStats(): Promise<ReadingStat[]> {
    const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ADMIN_READING_STATS}`, {
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to fetch reading stats');
    return res.json();
  }
}

export const adminService = new AdminService();
