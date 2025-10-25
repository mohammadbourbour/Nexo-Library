import { API_BASE_URL, API_ENDPOINTS } from "@/config/api";
import { authService } from "./authService";

export interface Category {
  id: string;
  name: string;
  count?: number;
}

class CategoryService {
  private getAuthHeaders(token?: string): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    const finalToken = token || authService.getToken();
    if (finalToken) headers["Authorization"] = `Bearer ${finalToken}`;
    return headers;
  }

  async getAllCategories(token?: string): Promise<Category[]> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.CATEGORIES}`, {
      method: "GET",
      headers: this.getAuthHeaders(token),
    });
    if (!response.ok) throw new Error("Failed to fetch categories");
    return response.json();
  }

  async createCategory(name: string, token?: string): Promise<void> {
    console.log("🔹 Creating category:", name);
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.CATEGORIES}`, {
      method: "POST",
      headers: this.getAuthHeaders(token),
      body: JSON.stringify({ name }),
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || "Failed to create category");
    }
  }

  async deleteCategory(id: string, token?: string): Promise<void> {
    console.log("🗑 Deleting category ID:", id);
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.CATEGORY_BY_ID(id)}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(token),
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || "Failed to delete category");
    }
  }
}

export const categoryService = new CategoryService();
