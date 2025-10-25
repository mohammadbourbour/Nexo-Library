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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface DecodedToken {
  exp: number;
  [key: string]: any;
}

const Admin = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const { toast } = useToast();

  const [categories, setCategories] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [newCategoryName, setNewCategoryName] = useState("");

  // ---------------- Helper: get valid token ----------------
  const getValidToken = async (): Promise<string | null> => {
    let token = localStorage.getItem("token");
    if (!token) return null;

    const decoded: DecodedToken = jwtDecode(token);
    const now = Date.now() / 1000;

    if (decoded.exp < now) {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: "POST",
          credentials: "include",
        });
        if (!res.ok) throw new Error("Refresh failed");
        const data = await res.json();
        localStorage.setItem("token", data.access_token);
        token = data.access_token;
      } catch {
        logout();
        navigate("/login");
        toast({
          variant: "destructive",
          title: "جلسه شما پایان یافت",
          description: "لطفاً دوباره وارد شوید",
        });
        return null;
      }
    }
    return token;
  };

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

  // ---------------- Upload Book ----------------
  const handleUpload = async (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const token = await getValidToken();
    if (!token) return;

    try {
      await bookService.addBook(formData, token);
      toast({ title: "موفق", description: "کتاب اضافه شد" });
      loadData();
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "خطا در آپلود کتاب" });
    }
  };

  // ---------------- Add Category ----------------
  const handleAddCategory = async () => {
    console.log("🔹 handleAddCategory triggered", newCategoryName);
    if (!newCategoryName.trim()) return;
    const token = await getValidToken();
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

  // ---------------- Delete Book ----------------
  const handleDeleteBook = async (id: string) => {
    const token = await getValidToken();
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

  // ---------------- Delete Category ----------------
  const handleDeleteCategory = async (id: string) => {
    console.log("🗑 handleDeleteCategory called with ID:", id);
    const token = await getValidToken();
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

  // ---------------- Render ----------------
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

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
                      <Textarea name="description" placeholder="توضیحات" required />
                      <Select value={selectedCategory} onValueChange={setSelectedCategory} name="category" required>
                        <SelectTrigger><SelectValue placeholder="انتخاب دسته‌بندی" /></SelectTrigger>
                        <SelectContent>
                          {categories.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Input name="cover" type="file" accept="image/*" required />
                      <Input name="pdf" type="file" accept="application/pdf" required />
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
