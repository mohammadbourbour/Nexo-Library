import { Link, useNavigate } from "react-router-dom";
import { BookOpen, Search, User, LogOut, Shield, Menu, X, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

interface HeaderProps {
  onSearch?: (query: string) => void;
  categories?: { id: string; name: string; path: string }[];
}

export const Header = ({ onSearch, categories = [] }: HeaderProps) => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const navigate = useNavigate();
  const isHome = window.location.pathname === "/"; // فقط صفحه اصلی

  const handleNavigate = (path: string) => {
    document.body.classList.add("fade-out");
    setTimeout(() => navigate(path), 500);
  };

  const handleLogout = async () => {
    await logout();
    document.body.classList.add("fade-out");
    setTimeout(() => navigate("/login"), 500);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-0">
        <Link to="/" className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          <div className="flex flex-col">
            <span className="text-base md:text-lg font-bold text-primary">
              Nexo-Library
            </span>
            <span className="text-xs md:text-sm text-muted-foreground">
              کتابخانه الکترونیک
            </span>
          </div>
        </Link>

        {/* نوار جستجوی دسکتاپ فقط صفحه اصلی */}
        {isHome && (
          <div className="hidden md:flex flex-1 max-w-md mx-8 relative">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="جستجوی کتاب، نویسنده، موضوع..."
              className="pr-10 text-black"
              onChange={(e) => onSearch?.(e.target.value)}
            />
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* موبایل: آیکون جستجو فقط صفحه اصلی */}
          {isHome && (
            <div className="flex md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowMobileSearch(!showMobileSearch)}
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* موبایل: همبرگر منو */}
          <div className="flex md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>

          {/* دسکتاپ: لینک‌ها */}
          <nav className="hidden md:flex items-center gap-4">
            <Button variant="ghost" onClick={() => handleNavigate("/")}>
              صفحه اصلی
            </Button>
            <Button variant="ghost" onClick={() => handleNavigate("/about")}>
              درباره ما
            </Button>

            {categories.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost">
                    <Layers className="ml-2 h-4 w-4" />
                    دسته‌بندی‌ها
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {categories.map((cat) => (
                    <DropdownMenuItem asChild key={cat.id}>
                      <Button variant="ghost" onClick={() => handleNavigate(cat.path)}>
                        {cat.name}
                      </Button>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="text-right">
                    <div className="flex flex-col">
                      <span className="font-medium">{user?.name}</span>
                      <span className="text-xs text-muted-foreground">{user?.email}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Button variant="ghost" className="w-full justify-start" onClick={() => handleNavigate("/admin")}>
                        <Shield className="ml-2 h-4 w-4" />
                        پنل مدیریت
                      </Button>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem>
                    <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
                      <LogOut className="ml-2 h-4 w-4" />
                      خروج
                    </Button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="outline" size="icon" onClick={() => handleNavigate("/login")}>
                <User className="h-4 w-4" />
              </Button>
            )}
          </nav>
        </div>
      </div>

      {/* موبایل: منوی کشویی */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-background border-t">
          <nav className="flex flex-col gap-1 p-4">
            <Button variant="ghost" className="w-full justify-start" onClick={() => handleNavigate("/")}>
              صفحه اصلی
            </Button>
            <Button variant="ghost" className="w-full justify-start" onClick={() => handleNavigate("/about")}>
              درباره ما
            </Button>

            {categories.length > 0 && (
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium px-2 py-1 text-muted-foreground">
                  دسته‌بندی‌ها
                </span>
                {categories.map((cat) => (
                  <Button
                    key={cat.id}
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => handleNavigate(cat.path)}
                  >
                    {cat.name}
                  </Button>
                ))}
              </div>
            )}

            {isAuthenticated && isAdmin && (
              <Button variant="ghost" className="w-full justify-start" onClick={() => handleNavigate("/admin")}>
                پنل مدیریت
              </Button>
            )}

            {isAuthenticated ? (
              <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
                خروج
              </Button>
            ) : (
              <Button variant="ghost" className="w-full justify-start" onClick={() => handleNavigate("/login")}>
                ورود
              </Button>
            )}
          </nav>
        </div>
      )}

      {/* موبایل: جستجو باز شده فقط صفحه اصلی */}
      {isHome && showMobileSearch && (
        <div className="md:hidden p-4 border-t bg-background">
          <Input
            type="search"
            placeholder="جستجوی کتاب، نویسنده، موضوع..."
            className="text-black"
            onChange={(e) => onSearch?.(e.target.value)}
          />
        </div>
      )}
    </header>
  );
};
