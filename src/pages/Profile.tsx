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
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="container py-8">
        {/* Header */}
        <Card className="mb-8 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="w-10 h-10 text-primary" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-3xl mb-2">{user.name}</CardTitle>
                <p className="text-muted-foreground">{user.email}</p>
                <div className="flex gap-2 mt-4">
                  <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                    {user.role === 'admin' ? 'مدیر' : 'کاربر'}
                  </span>
                </div>
              </div>
              <Button variant="outline" onClick={logout}>
                خروج از حساب
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="library" className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="library" className="gap-2">
              <BookMarked className="w-4 h-4" />
              کتابخانه شخصی
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              تنظیمات
            </TabsTrigger>
          </TabsList>

          {/* کتابخانه شخصی */}
          <TabsContent value="library">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookMarked className="w-5 h-5" />
                  کتاب‌های ذخیره شده
                  <span className="text-sm text-muted-foreground">
                    ({savedBooks.length} کتاب)
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 border-4 border-t-primary border-gray-200 rounded-full animate-spin mx-auto"></div>
                    <p className="text-muted-foreground mt-4">در حال بارگذاری...</p>
                  </div>
                ) : savedBooks.length === 0 ? (
                  <div className="text-center py-12">
                    <BookMarked className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-lg text-muted-foreground mb-2">
                      هنوز کتابی ذخیره نکرده‌اید
                    </p>
                    <p className="text-sm text-muted-foreground mb-6">
                      برای ذخیره کتاب‌های مورد علاقه، به صفحه اصلی بروید
                    </p>
                    <Button onClick={() => navigate("/")}>
                      مشاهده کتاب‌ها
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {savedBooks.map((book) => (
                      <div key={book.id} className="relative group">
                        <BookCard
                          book={{
                            ...book,
                            coverUrl: book.cover_url || "/placeholder.svg",
                            pdfUrl: book.pdf_url || "/sample.pdf",
                            category: "نامشخص",
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
              </CardContent>
            </Card>
          </TabsContent>

          {/* تنظیمات */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>تنظیمات حساب کاربری</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      تنظیمات بیشتر به زودی اضافه خواهد شد
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
