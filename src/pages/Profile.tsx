import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookCard } from "@/components/BookCard";
import { useAuth } from "@/contexts/AuthContext";
import { savedBooksService } from "@/services/savedBooksService";
import { useNavigate } from "react-router-dom";
import { User, BookMarked, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { resolveMediaUrl } from "@/config/api";

interface SavedBook {
  id: string;
  title: string;
  author: string;
  description: string;
  category_id: string | null;
  cover_url: string | null;
  pdf_url: string | null;
  language: string;
  year: number | null;
  pages: number | null;
  createdAt: string;
}

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [savedBooks, setSavedBooks] = useState<SavedBook[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    loadSavedBooks();
  }, [user, navigate]);

  const loadSavedBooks = async () => {
    try {
      setLoading(true);
      const books = await savedBooksService.getSavedBooks();
      setSavedBooks(books);
    } catch (error) {
      console.error("Failed to load saved books:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsaveBook = async (bookId: string) => {
    try {
      await savedBooksService.unsaveBook(bookId);
      toast({
        title: "موفق",
        description: "کتاب از لیست ذخیره شده حذف شد",
      });
      loadSavedBooks();
    } catch (error: any) {
      toast({
        title: "خطا",
        description: error.message || "خطا در حذف کتاب",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="container py-8">
      <Card className="mb-8">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-hero text-primary-foreground flex items-center justify-center shadow-soft">
              <User className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl mb-1">{user.name}</CardTitle>
              <p className="text-muted-foreground">{user.email}</p>
              <span className="inline-flex mt-3 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm">
                {user.role === "admin" ? "مدیر" : "کاربر"}
              </span>
            </div>
            <Button variant="outline" onClick={logout}>
              خروج از حساب
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="library" className="space-y-6">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 h-11">
          <TabsTrigger value="library" className="gap-2">
            <BookMarked className="w-4 h-4" />
            کتابخانه شخصی
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="w-4 h-4" />
            تنظیمات
          </TabsTrigger>
        </TabsList>

        <TabsContent value="library">
          <div className="mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <BookMarked className="w-5 h-5 text-primary" />
              کتاب‌های ذخیره شده
              <span className="text-sm font-normal text-muted-foreground">({savedBooks.length})</span>
            </h2>
          </div>
          {loading ? (
            <div className="text-center py-12">
              <div className="w-10 h-10 border-2 border-muted border-t-primary rounded-full animate-spin mx-auto" />
              <p className="text-muted-foreground mt-4">در حال بارگذاری...</p>
            </div>
          ) : savedBooks.length === 0 ? (
            <div className="rounded-2xl border border-dashed bg-card/60 py-16 text-center">
              <BookMarked className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-60" />
              <p className="text-lg mb-2">هنوز کتابی ذخیره نکرده‌اید</p>
              <p className="text-sm text-muted-foreground mb-6">از کاتالوگ کتاب‌های مورد علاقه را اضافه کنید</p>
              <Button onClick={() => navigate("/")}>مشاهده کتاب‌ها</Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {savedBooks.map((book) => (
                <div key={book.id} className="relative group">
                  <BookCard
                    book={{
                      ...book,
                      coverUrl: resolveMediaUrl(book.cover_url, "/placeholder.svg"),
                      pdfUrl: resolveMediaUrl(book.pdf_url, "/sample.pdf"),
                      category: "ذخیره شده",
                      tags: [],
                    }}
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleUnsaveBook(book.id)}
                    className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    حذف
                  </Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>تنظیمات حساب کاربری</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-muted/60 rounded-xl text-sm text-muted-foreground">
                تنظیمات بیشتر به زودی اضافه خواهد شد
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;
