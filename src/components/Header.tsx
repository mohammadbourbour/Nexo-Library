import { Link, useLocation } from "react-router-dom";
import { BookOpen, Search, User, LogOut, Shield, Menu } from "lucide-react";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";

interface HeaderProps {
  onSearch?: (query: string) => void;
}

export const Header = ({ onSearch }: HeaderProps) => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";

  const navLinkClass = (path: string) =>
    `text-sm font-medium transition-colors hover:text-primary ${
      location.pathname === path ? "text-primary" : "text-foreground/80"
    }`;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/75 backdrop-blur-xl supports-[backdrop-filter]:bg-background/65">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-hero text-primary-foreground shadow-soft">
            <BookOpen className="h-5 w-5" />
          </span>
          <div className="flex flex-col leading-tight">
            <span className="text-base font-bold tracking-tight text-foreground">Nexo-Library</span>
            <span className="text-[11px] text-muted-foreground">کتابخانه دیجیتال</span>
          </div>
        </Link>

        {isHome && (
          <div className="hidden md:flex flex-1 max-w-md mx-4 relative">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="جستجوی کتاب، نویسنده، موضوع..."
              className="pr-10 bg-card/80"
              onChange={(e) => onSearch?.(e.target.value)}
            />
          </div>
        )}

        <nav className="hidden md:flex items-center gap-1">
          <Button variant="ghost" asChild>
            <Link to="/" className={navLinkClass("/")}>صفحه اصلی</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link to="/about" className={navLinkClass("/about")}>درباره ما</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link to="/contact" className={navLinkClass("/contact")}>تماس</Link>
          </Button>

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="ms-2 rounded-full">
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
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex w-full cursor-pointer items-center">
                    <User className="ml-2 h-4 w-4" />
                    پروفایل
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin" className="flex w-full cursor-pointer items-center">
                      <Shield className="ml-2 h-4 w-4" />
                      پنل مدیریت
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onSelect={() => logout()}>
                  <LogOut className="ml-2 h-4 w-4" />
                  خروج
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild className="ms-2">
              <Link to="/login">ورود</Link>
            </Button>
          )}
        </nav>

        <div className="flex md:hidden items-center gap-1">
          {isHome && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileSearchOpen((open) => !open)}
              aria-label="جستجو"
            >
              <Search className="h-4 w-4" />
            </Button>
          )}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="منو">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px]">
              <SheetHeader>
                <SheetTitle className="text-right">Nexo-Library</SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-1">
                <Button variant="ghost" className="justify-start" asChild>
                  <Link to="/" onClick={() => setSheetOpen(false)}>صفحه اصلی</Link>
                </Button>
                <Button variant="ghost" className="justify-start" asChild>
                  <Link to="/about" onClick={() => setSheetOpen(false)}>درباره ما</Link>
                </Button>
                <Button variant="ghost" className="justify-start" asChild>
                  <Link to="/contact" onClick={() => setSheetOpen(false)}>تماس با ما</Link>
                </Button>
                {isAuthenticated && (
                  <Button variant="ghost" className="justify-start" asChild>
                    <Link to="/profile" onClick={() => setSheetOpen(false)}>پروفایل</Link>
                  </Button>
                )}
                {isAuthenticated && isAdmin && (
                  <Button variant="ghost" className="justify-start" asChild>
                    <Link to="/admin" onClick={() => setSheetOpen(false)}>پنل مدیریت</Link>
                  </Button>
                )}
                {isAuthenticated ? (
                  <Button
                    variant="ghost"
                    className="justify-start text-destructive"
                    onClick={() => {
                      setSheetOpen(false);
                      logout();
                    }}
                  >
                    خروج
                  </Button>
                ) : (
                  <Button asChild className="mt-2">
                    <Link to="/login" onClick={() => setSheetOpen(false)}>ورود</Link>
                  </Button>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {isHome && mobileSearchOpen && (
        <div className="md:hidden p-3 border-t bg-background/90">
          <Input
            type="search"
            placeholder="جستجوی کتاب، نویسنده، موضوع..."
            onChange={(e) => onSearch?.(e.target.value)}
          />
        </div>
      )}
    </header>
  );
};
