import { Link } from "react-router-dom";
import { BookOpen, Mail } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="border-t border-border/70 bg-card/70 mt-auto">
      <div className="container py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-hero text-primary-foreground">
                <BookOpen className="h-4 w-4" />
              </span>
              <span className="text-lg font-bold">Nexo-Library</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              کتابخانه الکترونیک برای دسترسی آنلاین به منابع علمی و کتاب‌های تخصصی.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">دسترسی سریع</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
                  صفحه اصلی
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">
                  درباره کتابخانه
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                  تماس با ما
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">ارتباط</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <span>hello@nexo-library.app</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-6 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Nexo-Library — تمامی حقوق محفوظ است</p>
        </div>
      </div>
    </footer>
  );
};
