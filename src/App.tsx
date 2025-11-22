import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Home from "./pages/Home";
import BookDetail from "./pages/BookDetail";
import ReadBook from "./pages/ReadBook";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useState } from "react";

const queryClient = new QueryClient();

// ------------------ Layout داخلی ------------------
const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleNavigate = (path: string) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate(path);
    }, 300);
  };

  const handleLogout = async () => {
    setLoading(true);
    await logout();
    setTimeout(() => {
      setLoading(false);
      navigate("/login");
    }, 300);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="w-12 h-12 border-4 border-t-primary border-gray-200 rounded-full animate-spin"></div>
        </div>
      )}

      {/* Header واقعی */}
      <Header />

      <main className="flex-1">{children}</main>

      {/* Footer واقعی */}
      <Footer />
    </div>
  );
};

// ------------------ App اصلی ------------------
const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={
                <AppLayout>
                  <Home />
                </AppLayout>
              }
            />
            <Route
              path="/book/:id"
              element={
                <AppLayout>
                  <BookDetail />
                </AppLayout>
              }
            />
            <Route
              path="/read/:id"
              element={
                <AppLayout>
                  <ReadBook />
                </AppLayout>
              }
            />
            <Route
              path="/about"
              element={
                <AppLayout>
                  <About />
                </AppLayout>
              }
            />
            <Route
              path="/contact"
              element={
                <AppLayout>
                  <Contact />
                </AppLayout>
              }
            />
            <Route
              path="/admin"
              element={
                <AppLayout>
                  <Admin />
                </AppLayout>
              }
            />
            <Route
              path="/login"
              element={
                <AppLayout>
                  <Login />
                </AppLayout>
              }
            />
            <Route
              path="/profile"
              element={
                <AppLayout>
                  <Profile />
                </AppLayout>
              }
            />
            <Route
              path="*"
              element={
                <AppLayout>
                  <NotFound />
                </AppLayout>
              }
            />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
