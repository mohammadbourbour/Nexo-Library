import { API_BASE_URL, API_ENDPOINTS } from '@/config/api';

export interface ReadingProgress {
  book_id: string;
  page: number;
  updated_at?: string;
  title?: string;
}

class ProgressService {
  async list(): Promise<ReadingProgress[]> {
    const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.MY_PROGRESS}`, {
      credentials: 'include',
    });
    if (!res.ok) {
      if (res.status === 401) return [];
      throw new Error('Failed to fetch reading progress');
    }
    return res.json();
  }

  async save(bookId: string, page: number): Promise<ReadingProgress | null> {
    const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.MY_PROGRESS_BY_BOOK(bookId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page }),
      credentials: 'include',
    });
    if (!res.ok) return null;
    return res.json();
  }
}

export const progressService = new ProgressService();
