import { API_BASE_URL, API_ENDPOINTS } from '@/config/api';

class BookService {
  // ------------------ دریافت همه کتاب‌ها ------------------
  async getAllBooks() {
    const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.BOOKS}`);
    if (!res.ok) throw new Error("Failed to fetch books");
    return res.json();
  }

  // ------------------ اضافه کردن کتاب با کاور ------------------
  async addBookWithCover(
    file: File,
    cover: File,
    title: string,
    author: string,
    description: string,
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
  
    const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ADMIN_UPLOAD_PDF}`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || "خطا در آپلود کتاب");
    }

    return await res.json();
  }

  // ------------------ ویرایش کتاب ------------------
  async updateBook(
    id: string,
    data: {
      title?: string;
      author?: string;
      description?: string;
      category_id?: string;
      language?: string;
      year?: number | null;
      pages?: number | null;
    }
  ) {
    const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.BOOK_BY_ID(id)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || "خطا در ویرایش کتاب");
    }

    return await res.json();
  }

  // ------------------ حذف کتاب ------------------
  async deleteBook(id: string) {
    const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.BOOK_BY_ID(id)}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(err || "Failed to delete book");
    }

    return true;
  }
}

export const bookService = new BookService();
