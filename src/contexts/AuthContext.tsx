import { createContext, useContext, useState, useEffect, ReactNode } from "react";

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
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  signup: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  // بارگذاری کاربر از localStorage در شروع
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string) => {
    // این قسمت رو باید به API پایتون وصل کنی
    // برای تست، یک ادمین پیش‌فرض داریم
    try {
      // اینجا باید درخواست به بک‌اند پایتون بفرستی
      // const response = await fetch('YOUR_PYTHON_API/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password })
      // });
      // const data = await response.json();

      // برای تست:
      if (email === "admin@library.com" && password === "admin123") {
        const userData: User = {
          id: "1",
          email,
          name: "مدیر سیستم",
          role: "admin",
        };
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        return { success: true };
      }

      return { success: false, error: "ایمیل یا رمز عبور اشتباه است" };
    } catch (error) {
      return { success: false, error: "خطا در برقراری ارتباط با سرور" };
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    // این قسمت رو باید به API پایتون وصل کنی
    try {
      // const response = await fetch('YOUR_PYTHON_API/signup', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password, name })
      // });
      // const data = await response.json();

      // برای تست:
      const userData: User = {
        id: Date.now().toString(),
        email,
        name,
        role: "user",
      };
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      return { success: true };
    } catch (error) {
      return { success: false, error: "خطا در ثبت‌نام" };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
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
