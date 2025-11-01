import { API_ENDPOINTS, request } from "@/config/api";

export interface Category {
  id: string;
  name: string;
  description?: string;
  count?: number;
}

class CategoryService {
  async getAllCategories(): Promise<Category[]> {
    return request(API_ENDPOINTS.CATEGORIES, "GET");
  }

  async createCategory(name: string): Promise<Category> {
    return request(API_ENDPOINTS.CATEGORIES, "POST", { name });
  }

  async deleteCategory(id: string): Promise<void> {
    const category = { name: id }; // اگر API id می‌خواد، اینو تغییر بده
    await request(API_ENDPOINTS.CATEGORY_BY_ID(id), "DELETE", category);
  }
}

export const categoryService = new CategoryService();
