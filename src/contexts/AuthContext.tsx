import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authService } from "@/services/authService";

interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user";
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false); // برای انیمیشن

  // ✅ فقط یک بار اجرا، برای بررسی اعتبار کوکی
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const result = await authService.verifyToken();
        if (result.valid && result.user) {
          setUser(result.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Auth verify error:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    verifyAuth();
  }, []);

  const login = async (username: string, password: string) => {
    const result = await authService.login(username, password);
    if (result.success && result.user) {
      setUser(result.user);
      return { success: true };
    }
    return { success: false, error: result.error || "خطا در ورود به سیستم" };
  };

  const signup = async (email: string, password: string, name: string) => {
    const result = await authService.signup(email, password, name);
    if (result.success && result.user) {
      setUser(result.user);
      return { success: true };
    }
    return { success: false, error: result.error || "خطا در ثبت‌نام" };
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setLoggingOut(true); // trigger انیمیشن
      setTimeout(() => {
        setUser(null);
        window.location.href = "/login";
      }, 600); // زمان انیمیشن
    }
  };

  useEffect(() => {
    if (loggingOut) {
      document.body.classList.add("fade-out");
    } else {
      document.body.classList.remove("fade-out");
    }
  }, [loggingOut]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
        loading,
        login,
        logout,
        signup,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;

};
