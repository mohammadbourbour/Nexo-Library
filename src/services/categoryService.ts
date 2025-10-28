import { API_ENDPOINTS, request } from "@/config/api";

export interface Category {
  id: string;
  name: string;
  description?: string;
  count?: number;
}

class CategoryService {
  // Helper برای گرفتن توکن از localStorage
  private getToken(token?: string) {
    return token || localStorage.getItem("auth_token") || "";
  }

  // ------------------ دریافت همه دسته‌ها ------------------
  async getAllCategories(token?: string): Promise<Category[]> {
    return request(API_ENDPOINTS.CATEGORIES, "GET");
  }

  // ------------------ اضافه کردن دسته ------------------
  async createCategory(name: string, token?: string): Promise<Category> {
    return request(API_ENDPOINTS.CATEGORIES, "POST", { name }, this.getToken(token));
  }

  async deleteCategory(id: string, token?: string): Promise<void> {
    const t = token || localStorage.getItem("token");
    if (!t) throw new Error("توکن موجود نیست!");

    // API توی body اسم دسته رو میخواد
    const category = { name: id }; // یا اگر API id می‌خواد اینو id بذار

    await request(API_ENDPOINTS.CATEGORY_BY_ID(id), "DELETE", category, t);
  }

}

export const categoryService = new CategoryService();
