import { API_BASE_URL, API_ENDPOINTS } from '@/config/api';

export interface LoginResponse {
  success: boolean;
  token?: string;
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
  token?: string;
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
  private getAuthHeaders(token?: string): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    const authToken = token || this.getStoredToken();
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    return headers;
  }

  private getStoredToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private setStoredToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  private removeStoredToken(): void {
    localStorage.removeItem('auth_token');
  }

 async login(username: string, password: string): Promise<LoginResponse> {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    const authToken = this.getStoredToken();
    if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

    const body = new URLSearchParams({ username, password }).toString();

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.LOGIN}`, {
      method: 'POST',
      headers,
      body,
    });

    const data = await response.json();

    if (response.ok && data.token) {
      this.setStoredToken(data.token);
      return {
        success: true,
        token: data.token,
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
      });

      const data = await response.json();

      if (response.ok && data.token) {
        this.setStoredToken(data.token);
        return {
          success: true,
          token: data.token,
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

  async verifyToken(token?: string): Promise<VerifyTokenResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.VERIFY_TOKEN}`, {
        method: 'GET',
        headers: this.getAuthHeaders(token),
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
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.removeStoredToken();
    }
  }

  getToken(): string | null {
    return this.getStoredToken();
  }
}

export const authService = new AuthService();
