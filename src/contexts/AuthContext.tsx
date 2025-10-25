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

  // Verify token on mount
  useEffect(() => {
    const verifyAuth = async () => {
      const token = authService.getToken();
      if (token) {
        const result = await authService.verifyToken(token);
        if (result.valid && result.user) {
          setUser(result.user);
        } else {
          // Invalid token, clear it
          await authService.logout();
        }
      }
      setLoading(false);
    };

    verifyAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const result = await authService.login(username, password);
      
      if (result.success && result.user) {
        setUser(result.user);
        return { success: true };
      }

      return {
        success: false,
        error: result.error || "خطا در ورود به سیستم",
      };
    } catch (error) {
      return {
        success: false,
        error: "خطا در برقراری ارتباط با سرور",
      };
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    try {
      const result = await authService.signup(email, password, name);
      
      if (result.success && result.user) {
        setUser(result.user);
        return { success: true };
      }

      return {
        success: false,
        error: result.error || "خطا در ثبت‌نام",
      };
    } catch (error) {
      return {
        success: false,
        error: "خطا در برقراری ارتباط با سرور",
      };
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
