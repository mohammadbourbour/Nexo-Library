import { API_BASE_URL } from '@/config/api';

class SavedBooksService {
  // دریافت کتاب‌های ذخیره شده کاربر
  async getSavedBooks() {
    const res = await fetch(`${API_BASE_URL}/api/saved-books`, {
      credentials: 'include',
    });

    if (!res.ok) throw new Error("Failed to fetch saved books");
    return res.json();
  }

  // افزودن کتاب به لیست ذخیره شده
  async saveBook(bookId: string) {
    const res = await fetch(`${API_BASE_URL}/api/saved-books`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ book_id: bookId }),
      credentials: 'include',
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'خطا در ذخیره کتاب');
    }

    return res.json();
  }

  // حذف کتاب از لیست ذخیره شده
  async unsaveBook(bookId: string) {
    const res = await fetch(`${API_BASE_URL}/api/saved-books/${bookId}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'خطا در حذف کتاب');
    }

    return true;
  }

  // بررسی ذخیره بودن کتاب
  async isBookSaved(bookId: string): Promise<boolean> {
    try {
      const savedBooks = await this.getSavedBooks();
      return savedBooks.some((book: any) => book.id === bookId);
    } catch {
      return false;
    }
  }
}

export const savedBooksService = new SavedBooksService();
