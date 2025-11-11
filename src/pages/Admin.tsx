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
      const cats = await categoryService.getAllCategories(localStorage.getItem("auth_token") || "");
      const bks = await bookService.getAllBooks();
      setCategories(cats);
      setBooks(bks);
    } catch (err) {
      console.error("❌ Error loading data:", err);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      toast({ variant: "destructive", title: "دسترسی غیرمجاز", description: "لطفاً وارد حساب شوید" });
      navigate("/login");
      return;
    }
    if (!isAdmin) {
      toast({ variant: "destructive", title: "دسترسی غیرمجاز", description: "شما ادمین نیستید" });
      navigate("/");
      return;
    }
    loadData();
  }, []);

// ---------------- Handle Upload ----------------
const handleUpload = async (e: any) => {
  e.preventDefault();

  const token = localStorage.getItem("auth_token");
  if (!token) return;

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
      token,
      category_id,
      language,
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


  // ---------------- Add Category ----------------
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    const token = localStorage.getItem("auth_token");
    if (!token) return;

    try {
      await categoryService.createCategory(newCategoryName, token);
      toast({ title: "موفق", description: "دسته‌بندی اضافه شد" });
      setNewCategoryName("");
      loadData();
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "خطا در اضافه کردن دسته‌بندی" });
    }
  };

  // ---------------- Delete Category ----------------
  const handleDeleteCategory = async (id: string) => {
    const token = localStorage.getItem("auth_token");
    if (!token) return;

    try {
      await categoryService.deleteCategory(id, token);
      toast({ title: "دسته‌بندی حذف شد" });
      loadData();
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "خطا در حذف دسته‌بندی" });
    }
  };

  // ---------------- Delete Book ----------------
  const handleDeleteBook = async (id: string) => {
    const token = localStorage.getItem("auth_token");
    if (!token) return;

    try {
      await bookService.deleteBook(id, token);
      toast({ title: "کتاب حذف شد" });
      loadData();
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "خطا در حذف کتاب" });
    }
  };

  // ---------------- Render ----------------
  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 py-8">
        <div className="container flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">پنل مدیریت</h1>
            <p className="text-muted-foreground">مدیریت کتاب‌ها و دسته‌بندی‌ها</p>
          </div>
        </div>
      </div>

      <div className="container py-8 flex-1">
        <Tabs defaultValue="books" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
            <TabsTrigger value="books"><BookOpen className="h-4 w-4" />کتاب‌ها</TabsTrigger>
            <TabsTrigger value="categories"><Tags className="h-4 w-4" />دسته‌بندی‌ها</TabsTrigger>
          </TabsList>

          {/* BOOKS TAB */}
          <TabsContent value="books">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader><CardTitle>آپلود کتاب جدید</CardTitle></CardHeader>
                  <CardContent>
                    <form onSubmit={handleUpload} className="space-y-4">
                    <Input name="title" placeholder="عنوان" required />
                    <Input name="author" placeholder="نویسنده" required />
                    <Input name="year" type="number" placeholder="سال انتشار" />
                    <Input name="pages" type="number" placeholder="تعداد صفحات" />
                    <Textarea name="description" placeholder="توضیحات" required />

                    {/* انتخاب دسته‌بندی */}
                    <Select 
                      value={selectedCategory} 
                      onValueChange={setSelectedCategory} 
                      name="category"
                      required
                    >
                      <SelectTrigger>
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
                      <SelectTrigger>
                        <SelectValue placeholder="زبان کتاب" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="فارسی">فارسی</SelectItem>
                        <SelectItem value="انگلیسی">انگلیسی</SelectItem>
                      </SelectContent>
                    </Select>

                    <Input name="cover" type="file" accept="image/*" required />
                    <Input name="file" type="file" accept="application/pdf" required />
                    <Button className="w-full" type="submit">آپلود</Button>
                  </form>

                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader><CardTitle>کتاب‌ها ({books.length})</CardTitle></CardHeader>
                <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
                  {books.map(book => (
                    <div key={book.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium text-sm">{book.title}</p>
                        <p className="text-xs text-muted-foreground">{book.author}</p>
                      </div>
                      <Button type="button" variant="ghost" size="icon" onClick={() => handleDeleteBook(book.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* CATEGORIES TAB */}
          <TabsContent value="categories">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader><CardTitle>افزودن دسته‌بندی</CardTitle></CardHeader>
                <CardContent>
                  <Input placeholder="نام دسته‌بندی" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} />
                  <Button type="button" className="w-full mt-4" onClick={handleAddCategory}>افزودن</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>لیست دسته‌بندی‌ها ({categories.length})</CardTitle></CardHeader>
                <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
                  {categories.map(category => (
                    <div key={category.id} className="flex items-center justify-between p-3 border rounded">
                      <p>{category.name}</p>
                      <Button type="button" variant="ghost" size="icon" onClick={() => handleDeleteCategory(category.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
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
