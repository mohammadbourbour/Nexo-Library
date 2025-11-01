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
      'Content-Type': 'application/json',
    };
  }

  async login(username: string, password: string): Promise<LoginResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.LOGIN}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ username, password }).toString(),
        credentials: 'include', // ← ارسال/دریافت کوکی‌ها
      });

      const data = await response.json();

      if (response.ok && data.user) {
        return {
          success: true,
          user: data.user,
        };
      }

      return {
        success: false,
        error: data.message || 'خطا در ورود به سیستم',
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: 'خطا در برقراری ارتباط با سرور',
      };
    }
  }

  async signup(email: string, password: string, name: string): Promise<SignupResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.SIGNUP}`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ email, password, name }),
        credentials: 'include', // ← دریافت کوکی از سرور بعد از signup
      });

      const data = await response.json();

      if (response.ok && data.user) {
        return {
          success: true,
          user: data.user,
        };
      }

      return {
        success: false,
        error: data.message || 'خطا در ثبت‌نام',
      };
    } catch (error) {
      console.error('Signup error:', error);
      return {
        success: false,
        error: 'خطا در برقراری ارتباط با سرور',
      };
    }
  }

  async verifyToken(): Promise<VerifyTokenResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.VERIFY_TOKEN}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        credentials: 'include', // ← ارسال کوکی JWT به سرور برای اعتبارسنجی
      });

      const data = await response.json();

      if (response.ok && data.valid) {
        return {
          valid: true,
          user: data.user,
        };
      }

      return { valid: false };
    } catch (error) {
      console.error('Token verification error:', error);
      return { valid: false };
    }
  }

  async logout(): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}${API_ENDPOINTS.LOGOUT}`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        credentials: 'include', // ← ارسال کوکی برای حذفش در سرور
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
}

export const authService = new AuthService(); 
