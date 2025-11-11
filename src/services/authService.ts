import { API_BASE_URL, API_ENDPOINTS } from '@/config/api';

export interface LoginResponse {
  success: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'user';
  };
  error?: string;
}

export interface SignupResponse {
  success: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'user';
  };
  error?: string;
}

export interface VerifyTokenResponse {
  valid: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'user';
  };
}

class AuthService {
  private getAuthHeaders(): HeadersInit {
    return {
  private getAuthHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
    };
  }

  clearAuthCookie(): void {
    document.cookie = 'access_token=; Max-Age=0; path=/;';
  }

  async login(username: string, password: string): Promise<LoginResponse> {
    try {
      const body = new URLSearchParams({ username, password }).toString();
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.LOGIN}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
        credentials: 'include',
      });
      const data = await response.json();

      if (response.ok && data.success) {
        return { success: true, user: data.user };
      }

      return { success: false, error: data.message || 'خطا در ورود به سیستم' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'خطا در برقراری ارتباط با سرور' };
    }
  }

  async signup(email: string, password: string, name: string): Promise<SignupResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.SIGNUP}`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ email, password, name }),
        credentials: 'include',
      });
      const data = await response.json();

      if (response.ok && data.success) {
        return { success: true, user: data.user };
      }

      return { success: false, error: data.message || 'خطا در ثبت‌نام' };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'خطا در برقراری ارتباط با سرور' };
    }
  }

  async verifyToken(): Promise<VerifyTokenResponse> {
  async verifyToken(): Promise<VerifyTokenResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.VERIFY_TOKEN}`, {
        method: 'GET',
        credentials: 'include',
      });
      const data = await response.json();

      if (response.ok && data.valid) return { valid: true, user: data.user };

      return { valid: false };
    } catch (error) {
      console.error('Token verification error:', error);
      return { valid: false };
    }
  }

  // ✅ logout فقط وظیفه تماس با API و پاک کردن کوکی رو داره
  async logout(): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}${API_ENDPOINTS.LOGOUT}`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearAuthCookie();
    }
  }
}

export const authService = new AuthService(); 
