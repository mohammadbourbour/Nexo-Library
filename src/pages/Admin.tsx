import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Upload, BookOpen, Trash2, Tags, Shield } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { bookService } from "@/services/bookService";
import { categoryService } from "@/services/categoryService";


const Admin = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const { toast } = useToast();

  const [categories, setCategories] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [language, setLanguage] = useState<string>("");

 // ---------------- Load Data ----------------
const loadData = async () => {
  try {
    const cats = await categoryService.getAllCategories();
    const bks = await bookService.getAllBooks();
    setCategories(cats);
    setBooks(bks);
  } catch (err) {
    console.error("❌ Error loading data:", err);
  }
};

useEffect(() => {
  loadData();
}, []);

  // ---------------- Handle Upload ----------------
  const handleUpload = async (e: any) => {
    e.preventDefault();

    if (!isAuthenticated || !isAdmin) {
      toast({ variant: "destructive", title: "دسترسی غیرمجاز", description: "فقط ادمین می‌تواند این عملیات را انجام دهد" });
      return;
    }

    const formData = new FormData(e.currentTarget);
    const file = formData.get("file") as File;
    const cover = formData.get("cover") as File;
    const title = formData.get("title") as string;
    const author = formData.get("author") as string;
    const description = formData.get("description") as string;
    const year = formData.get("year") as string;
    const pages = formData.get("pages") as string;
    const language = formData.get("language") as string;
    const category_id = formData.get("category") as string;

    if (!file || !cover) {
      toast({ variant: "destructive", title: "لطفاً PDF و کاور را انتخاب کنید!" });
      return;
    }

    try {
      await bookService.addBookWithCover(
        file,
        cover,
        title,
        author,
        description,
        category_id,
        language ? language : null,
        year ? parseInt(year) : null,
        pages ? parseInt(pages) : null
      );

      toast({ title: "موفق", description: "کتاب با کاور اضافه شد" });
      loadData();
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "خطا در آپلود کتاب" });
    }
  };

  // ---------------- Add/Delete Category ----------------
  const handleAddCategory = async () => {
    if (!isAuthenticated || !isAdmin) {
      toast({ variant: "destructive", title: "دسترسی غیرمجاز", description: "فقط ادمین می‌تواند این عملیات را انجام دهد" });
      return;
    }
    if (!newCategoryName.trim()) return;
    try {
      await categoryService.createCategory(newCategoryName);
      toast({ title: "موفق", description: "دسته‌بندی اضافه شد" });
      setNewCategoryName("");
      loadData();
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "خطا در اضافه کردن دسته‌بندی" });
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!isAuthenticated || !isAdmin) {
      toast({ variant: "destructive", title: "دسترسی غیرمجاز", description: "فقط ادمین می‌تواند این عملیات را انجام دهد" });
      return;
    }
    try {
      await categoryService.deleteCategory(String(id));
      toast({ title: "دسته‌بندی حذف شد" });
      loadData();
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "خطا در حذف دسته‌بندی" });
    }
  };

  const handleDeleteBook = async (id: string | number) => {
    if (!isAuthenticated || !isAdmin) {
      toast({ variant: "destructive", title: "دسترسی غیرمجاز", description: "فقط ادمین می‌تواند این عملیات را انجام دهد" });
      return;
    }
    try {
      await bookService.deleteBook(String(id));

      toast({ title: "کتاب حذف شد" });
      loadData();
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "خطا در حذف کتاب" });
    }
  };


  // ---------------- Stats ----------------
  const totalBooks = books.length;
  const totalCategories = categories.length;
  const persianBooks = books.filter(b => b.language === "فارسی").length;
  const englishBooks = books.filter(b => b.language === "انگلیسی").length;

  // ---------------- Render ----------------
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary via-primary/90 to-primary/80 py-12 shadow-xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20" />
        <div className="container relative flex items-center gap-4">
          <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 shadow-2xl">
            <Shield className="h-10 w-10 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white mb-1">پنل مدیریت</h1>
            <p className="text-white/80 text-lg">مدیریت هوشمند کتابخانه دیجیتال</p>
          </div>
          {!isAuthenticated && (
            <div className="mr-auto bg-yellow-400/20 backdrop-blur-sm border border-yellow-400/30 rounded-lg px-4 py-2">
              <p className="text-white text-sm">🔒 حالت مشاهده - برای ویرایش وارد شوید</p>
            </div>
          )}
        </div>
      </div>

      <div className="container py-8 flex-1 space-y-8">
        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Card className="border-none shadow-lg bg-gradient-to-br from-blue-500/10 to-blue-600/5 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">مجموع کتاب‌ها</p>
                  <p className="text-4xl font-bold text-primary">{totalBooks}</p>
                </div>
                <div className="p-4 bg-primary/10 rounded-2xl">
                  <BookOpen className="h-8 w-8 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-gradient-to-br from-purple-500/10 to-purple-600/5 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">دسته‌بندی‌ها</p>
                  <p className="text-4xl font-bold text-purple-600">{totalCategories}</p>
                </div>
                <div className="p-4 bg-purple-500/10 rounded-2xl">
                  <Tags className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-gradient-to-br from-green-500/10 to-green-600/5 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">کتاب‌های فارسی</p>
                  <p className="text-4xl font-bold text-green-600">{persianBooks}</p>
                </div>
                <div className="p-4 bg-green-500/10 rounded-2xl">
                  <BookOpen className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-gradient-to-br from-orange-500/10 to-orange-600/5 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">کتاب‌های انگلیسی</p>
                  <p className="text-4xl font-bold text-orange-600">{englishBooks}</p>
                </div>
                <div className="p-4 bg-orange-500/10 rounded-2xl">
                  <BookOpen className="h-8 w-8 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="books" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-8 h-12 bg-muted/50">
            <TabsTrigger value="books" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <BookOpen className="h-4 w-4 ml-2" />
              کتاب‌ها
            </TabsTrigger>
            <TabsTrigger value="categories" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Tags className="h-4 w-4 ml-2" />
              دسته‌بندی‌ها
            </TabsTrigger>
          </TabsList>

          {/* BOOKS TAB */}
          <TabsContent value="books" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Card className="border-none shadow-xl bg-gradient-to-br from-card to-card/50">
                  <CardHeader className="border-b bg-muted/30">
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="h-5 w-5 text-primary" />
                      آپلود کتاب جدید
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <form onSubmit={handleUpload} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input name="title" placeholder="عنوان کتاب" required className="h-11" />
                      <Input name="author" placeholder="نویسنده" required className="h-11" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input name="year" type="number" placeholder="سال انتشار" className="h-11" />
                      <Input name="pages" type="number" placeholder="تعداد صفحات" className="h-11" />
                    </div>
                    <Textarea name="description" placeholder="توضیحات و خلاصه کتاب..." required className="min-h-24 resize-none" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* انتخاب دسته‌بندی */}
                      <Select 
                        value={selectedCategory} 
                        onValueChange={setSelectedCategory} 
                        name="category"
                        required
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="انتخاب دسته‌بندی" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(c => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {/* انتخاب زبان */}
                      <Select 
                        value={language} 
                        onValueChange={setLanguage} 
                        name="language"
                        required
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="زبان کتاب" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="فارسی">🇮🇷 فارسی</SelectItem>
                          <SelectItem value="انگلیسی">🇬🇧 انگلیسی</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-medium">تصویر جلد کتاب</label>
                      <Input name="cover" type="file" accept="image/*" required className="h-11 cursor-pointer" />
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-medium">فایل PDF کتاب</label>
                      <Input name="file" type="file" accept="application/pdf" required className="h-11 cursor-pointer" />
                    </div>

                    <Button 
                      className="w-full h-12 text-base shadow-lg hover:shadow-xl transition-all" 
                      type="submit"
                      disabled={!isAuthenticated || !isAdmin}
                    >
                      <Upload className="h-5 w-5 ml-2" />
                      آپلود کتاب
                    </Button>
                  </form>

                  </CardContent>
                </Card>
              </div>

              <Card className="border-none shadow-xl bg-gradient-to-br from-card to-card/50">
                <CardHeader className="border-b bg-muted/30">
                  <CardTitle className="flex items-center justify-between">
                    <span>کتاب‌ها</span>
                    <span className="text-2xl font-bold text-primary">{books.length}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 max-h-[600px] overflow-y-auto p-4">
                  {books.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>هنوز کتابی اضافه نشده است</p>
                    </div>
                  ) : (
                    books.map(book => (
                      <div 
                        key={book.id} 
                        className="flex items-center justify-between p-4 border rounded-xl bg-background/50 hover:bg-muted/50 transition-all duration-200 hover:shadow-md group"
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-sm mb-1">{book.title}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-2">
                            <span>{book.author}</span>
                            {book.language && (
                              <>
                                <span className="text-border">•</span>
                                <span>{book.language}</span>
                              </>
                            )}
                          </p>
                        </div>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeleteBook(book.id)}
                          disabled={!isAuthenticated || !isAdmin}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* CATEGORIES TAB */}
          <TabsContent value="categories" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="border-none shadow-xl bg-gradient-to-br from-card to-card/50">
                <CardHeader className="border-b bg-muted/30">
                  <CardTitle className="flex items-center gap-2">
                    <Tags className="h-5 w-5 text-primary" />
                    افزودن دسته‌بندی
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <Input 
                    placeholder="نام دسته‌بندی جدید" 
                    value={newCategoryName} 
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="h-11"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newCategoryName.trim()) {
                        handleAddCategory();
                      }
                    }}
                  />
                  <Button 
                    type="button" 
                    className="w-full h-11 shadow-lg hover:shadow-xl transition-all" 
                    onClick={handleAddCategory}
                    disabled={!isAuthenticated || !isAdmin || !newCategoryName.trim()}
                  >
                    <Tags className="h-4 w-4 ml-2" />
                    افزودن دسته‌بندی
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-none shadow-xl bg-gradient-to-br from-card to-card/50">
                <CardHeader className="border-b bg-muted/30">
                  <CardTitle className="flex items-center justify-between">
                    <span>لیست دسته‌بندی‌ها</span>
                    <span className="text-2xl font-bold text-primary">{categories.length}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 max-h-[600px] overflow-y-auto p-4">
                  {categories.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Tags className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>هنوز دسته‌بندی اضافه نشده است</p>
                    </div>
                  ) : (
                    categories.map(category => (
                      <div 
                        key={category.id} 
                        className="flex items-center justify-between p-4 border rounded-xl bg-background/50 hover:bg-muted/50 transition-all duration-200 hover:shadow-md group"
                      >
                        <p className="font-medium">{category.name}</p>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeleteCategory(category.id)}
                          disabled={!isAuthenticated || !isAdmin}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
