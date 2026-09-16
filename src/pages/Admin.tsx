import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { categoryService, Category } from "@/services/categoryService";
import { bookService } from "@/services/bookService";
import { Trash2, Plus, BookOpen, FolderOpen, Edit, TrendingUp, ClipboardList } from "lucide-react";
import { adminService, AuditEvent, ReadingStat } from "@/services/adminService";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatisticsCharts } from "@/components/admin/StatisticsCharts";
import { DragDropUpload } from "@/components/admin/DragDropUpload";
import { BookEditDialog } from "@/components/admin/BookEditDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  category_id: string | null;
  language: string;
  year: number | null;
  pages: number | null;
  cover_url: string | null;
  pdf_url: string | null;
  createdAt: string;
}

const Admin = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDesc, setNewCategoryDesc] = useState("");
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [auditItems, setAuditItems] = useState<AuditEvent[]>([]);
  const [auditTotal, setAuditTotal] = useState(0);
  const [auditPage, setAuditPage] = useState(1);
  const [readingStats, setReadingStats] = useState<ReadingStat[]>([]);

  // ------------------ بارگذاری کتاب‌ها ------------------
  const loadBooks = async () => {
    try {
      const data = await bookService.getAllBooks();
      setBooks(data);
    } catch (err) {
      console.error("Failed to load books:", err);
    }
  };

  // ------------------ بارگذاری دسته‌بندی‌ها ------------------
  const loadCategories = async () => {
    try {
      const data = await categoryService.getAllCategories();
      setCategories(data);
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  };

  const loadReports = async (page = 1) => {
    if (!user || user.role !== "admin") return;
    try {
      const [audit, stats] = await Promise.all([
        adminService.getAudit(page, 20),
        adminService.getReadingStats(),
      ]);
      setAuditItems(audit.items);
      setAuditTotal(audit.total);
      setAuditPage(audit.page);
      setReadingStats(stats);
    } catch (err) {
      console.error("Failed to load admin reports:", err);
    }
  };

  useEffect(() => {
    loadBooks();
    loadCategories();
  }, []);

  useEffect(() => {
    loadReports(1);
  }, [user]);

  // ------------------ ویرایش کتاب ------------------
  const handleEditBook = (book: Book) => {
    setEditingBook(book);
    setEditDialogOpen(true);
  };

  // ------------------ افزودن دسته‌بندی ------------------
  const handleAddCategory = async () => {
    if (!user || user.role !== "admin") {
      toast({
        title: "خطا",
        description: "فقط مدیر می‌تواند دسته‌بندی اضافه کند",
        variant: "destructive",
      });
      return;
    }

    if (!newCategoryName.trim()) {
      toast({
        title: "خطا",
        description: "لطفاً نام دسته‌بندی را وارد کنید",
        variant: "destructive",
      });
      return;
    }

    try {
      await categoryService.createCategory(newCategoryName);
      toast({
        title: "موفق",
        description: "دسته‌بندی با موفقیت اضافه شد",
      });
      setNewCategoryName("");
      setNewCategoryDesc("");
      loadCategories();
    } catch (error: any) {
      toast({
        title: "خطا",
        description: error.message || "خطا در افزودن دسته‌بندی",
        variant: "destructive",
      });
    }
  };

  // ------------------ حذف دسته‌بندی ------------------
  const handleDeleteCategory = async (id: string) => {
    if (!user || user.role !== "admin") {
      toast({
        title: "خطا",
        description: "فقط مدیر می‌تواند دسته‌بندی حذف کند",
        variant: "destructive",
      });
      return;
    }

    try {
      await categoryService.deleteCategory(id);
      toast({
        title: "موفق",
        description: "دسته‌بندی حذف شد",
      });
      loadCategories();
    } catch (error: any) {
      toast({
        title: "خطا",
        description: error.message || "خطا در حذف دسته‌بندی",
        variant: "destructive",
      });
    }
  };

  // ------------------ حذف کتاب ------------------
  const handleDeleteBook = async (id: string) => {
    if (!user || user.role !== "admin") {
      toast({
        title: "خطا",
        description: "فقط مدیر می‌تواند کتاب حذف کند",
        variant: "destructive",
      });
      return;
    }

    try {
      await bookService.deleteBook(id);
      toast({
        title: "موفق",
        description: "کتاب حذف شد",
      });
      loadBooks();
    } catch (error: any) {
      toast({
        title: "خطا",
        description: error.message || "خطا در حذف کتاب",
        variant: "destructive",
      });
    }
  };

  // آمار کتاب‌ها
  const totalBooks = books.length;
  const persianBooks = books.filter(b => b.language === 'fa').length;
  const englishBooks = books.filter(b => b.language === 'en').length;

  return (
    <div className="container py-8 space-y-8">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">Nexo-Library</p>
          <h1 className="text-3xl font-bold mb-1 tracking-tight">پنل مدیریت</h1>
          <p className="text-muted-foreground">مدیریت کتاب‌ها، دسته‌ها و سجل سیستم</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">مجموع کتاب‌ها</CardTitle>
              <BookOpen className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tabular-nums">{totalBooks}</div>
              <p className="text-xs text-muted-foreground mt-1">کتاب در سیستم</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">دسته‌بندی‌ها</CardTitle>
              <FolderOpen className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tabular-nums">{categories.length}</div>
              <p className="text-xs text-muted-foreground mt-1">دسته فعال</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">فارسی</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tabular-nums">{persianBooks}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {totalBooks > 0 ? Math.round((persianBooks / totalBooks) * 100) : 0}% از کل
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">انگلیسی</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tabular-nums">{englishBooks}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {totalBooks > 0 ? Math.round((englishBooks / totalBooks) * 100) : 0}% از کل
              </p>
            </CardContent>
          </Card>
        </div>

        {!user && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="pt-6">
              <p className="text-center text-sm">
                شما در حالت مشاهده هستید. برای مدیریت کتاب‌ها، لطفاً وارد شوید.
              </p>
            </CardContent>
          </Card>
        )}

        {user?.role === "admin" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="w-5 h-5 text-primary" />
                آمار و نمودارها
              </CardTitle>
              <CardDescription>تحلیل آماری کتابخانه</CardDescription>
            </CardHeader>
            <CardContent>
              <StatisticsCharts books={books} categories={categories} />
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="upload" className="space-y-6">
          {user?.role === "admin" && (
            <TabsList className="grid w-full max-w-3xl h-auto grid-cols-2 md:grid-cols-4 p-1">
              <TabsTrigger value="upload" className="py-2">آپلود کتاب</TabsTrigger>
              <TabsTrigger value="books" className="py-2">مدیریت کتاب‌ها</TabsTrigger>
              <TabsTrigger value="categories" className="py-2">دسته‌بندی‌ها</TabsTrigger>
              <TabsTrigger value="reports" className="py-2">سجل و مطالعه</TabsTrigger>
            </TabsList>
          )}

          {/* آپلود کتاب */}
          {user?.role === "admin" && (
            <TabsContent value="upload">
              <DragDropUpload 
                categories={categories} 
                onUploadSuccess={loadBooks}
              />
            </TabsContent>
          )}

          {/* مدیریت کتاب‌ها */}
          <TabsContent value="books">
            <Card>
              <CardHeader>
                <CardTitle>لیست کتاب‌ها</CardTitle>
                <CardDescription>{books.length} کتاب موجود</CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>عنوان</TableHead>
                      <TableHead>نویسنده</TableHead>
                      <TableHead>دسته</TableHead>
                      <TableHead>زبان</TableHead>
                      {user?.role === "admin" && <TableHead className="text-left">عملیات</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {books.map((book) => {
                      const categoryName = categories.find((c) => c.id === book.category_id)?.name || "نامشخص";
                      return (
                        <TableRow key={book.id}>
                          <TableCell className="font-medium">{book.title}</TableCell>
                          <TableCell>{book.author}</TableCell>
                          <TableCell>{categoryName}</TableCell>
                          <TableCell>
                            {book.language === "fa" ? "فارسی" : book.language === "en" ? "انگلیسی" : "عربی"}
                          </TableCell>
                          {user?.role === "admin" && (
                            <TableCell>
                              <div className="flex gap-2 justify-end">
                                <Button variant="outline" size="sm" onClick={() => handleEditBook(book)}>
                                  <Edit className="w-4 h-4 ml-1" />
                                  ویرایش
                                </Button>
                                <Button variant="destructive" size="sm" onClick={() => handleDeleteBook(book.id)}>
                                  <Trash2 className="w-4 h-4 ml-1" />
                                  حذف
                                </Button>
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* مدیریت دسته‌بندی‌ها */}
          {user?.role === "admin" && (
            <TabsContent value="categories">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* افزودن دسته‌بندی */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Plus className="w-5 h-5 text-primary" />
                      افزودن دسته‌بندی جدید
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="cat-name">نام دسته‌بندی</Label>
                      <Input
                        id="cat-name"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cat-desc">توضیحات</Label>
                      <Textarea
                        id="cat-desc"
                        value={newCategoryDesc}
                        onChange={(e) => setNewCategoryDesc(e.target.value)}
                      />
                    </div>
                    <Button
                      onClick={handleAddCategory}
                      disabled={!newCategoryName}
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 ml-2" />
                      افزودن دسته‌بندی
                    </Button>
                  </CardContent>
                </Card>

                {/* لیست دسته‌بندی‌ها */}
                <Card>
                  <CardHeader>
                    <CardTitle>دسته‌بندی‌های موجود</CardTitle>
                    <CardDescription>{categories.length} دسته فعال</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {categories.map((cat) => (
                        <div
                          key={cat.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div>
                            <h3 className="font-medium">{cat.name}</h3>
                            {cat.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {cat.description}
                              </p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCategory(cat.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}

          {user?.role === "admin" && (
            <TabsContent value="reports">
              <div className="grid grid-cols-1 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      آمار مطالعه (بدون هویت دانشجو)
                    </CardTitle>
                    <CardDescription>
                      تعداد خواننده یکتا و آخرین فعالیت هر منبع
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {readingStats.length === 0 ? (
                      <p className="text-sm text-muted-foreground">هنوز پیشرفتی ثبت نشده است.</p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>کتاب</TableHead>
                            <TableHead>خواننده یکتا</TableHead>
                            <TableHead>آخرین فعالیت</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {readingStats.map((row) => (
                            <TableRow key={row.book_id}>
                              <TableCell>{row.title}</TableCell>
                              <TableCell>{row.unique_readers}</TableCell>
                              <TableCell>
                                {row.last_activity
                                  ? new Date(row.last_activity).toLocaleString("fa-IR")
                                  : "—"}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ClipboardList className="w-5 h-5" />
                      سجل اعمال ادمین
                    </CardTitle>
                    <CardDescription>
                      {auditTotal} رویداد ثبت‌شده
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {auditItems.length === 0 ? (
                      <p className="text-sm text-muted-foreground">رویدادی ثبت نشده است.</p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>زمان</TableHead>
                            <TableHead>عمل</TableHead>
                            <TableHead>نوع</TableHead>
                            <TableHead>شناسه</TableHead>
                            <TableHead>IP</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {auditItems.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>
                                {new Date(item.created_at).toLocaleString("fa-IR")}
                              </TableCell>
                              <TableCell>{item.action}</TableCell>
                              <TableCell>{item.entity_type}</TableCell>
                              <TableCell className="font-mono text-xs">{item.entity_id}</TableCell>
                              <TableCell>{item.ip || "—"}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                    <div className="flex justify-between">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={auditPage <= 1}
                        onClick={() => loadReports(auditPage - 1)}
                      >
                        قبلی
                      </Button>
                      <span className="text-sm text-muted-foreground">صفحه {auditPage}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={auditPage * 20 >= auditTotal}
                        onClick={() => loadReports(auditPage + 1)}
                      >
                        بعدی
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}
        </Tabs>

        <BookEditDialog
          book={editingBook}
          categories={categories}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSuccess={loadBooks}
        />
    </div>
  );
};

export default Admin;
