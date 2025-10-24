import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Upload, BookOpen, Trash2, FolderPlus, Tags, Shield } from "lucide-react";
import { mockBooks, categories } from "@/data/mockBooks";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";

const Admin = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useAuth();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [newCategoryName, setNewCategoryName] = useState("");

  // اگر کاربر لاگین نیست یا ادمین نیست، هدایت کن
  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        variant: "destructive",
        title: "دسترسی غیرمجاز",
        description: "لطفاً وارد حساب کاربری خود شوید",
      });
      navigate("/login");
    } else if (!isAdmin) {
      toast({
        variant: "destructive",
        title: "دسترسی غیرمجاز", 
        description: "شما دسترسی به پنل مدیریت ندارید",
      });
      navigate("/");
    }
  }, [isAuthenticated, isAdmin, navigate, toast]);

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory) {
      toast({
        title: "خطا",
        description: "لطفا دسته‌بندی را انتخاب کنید",
        variant: "destructive",
      });
      return;
    }
    
    // اینجا باید به API پایتون متصل بشی
    // const formData = new FormData(e.currentTarget as HTMLFormElement);
    // fetch('YOUR_PYTHON_API/books', {
    //   method: 'POST',
    //   body: formData,
    //   headers: { 'Authorization': `Bearer ${token}` }
    // });
    
    toast({
      title: "موفق",
      description: "کتاب با موفقیت اضافه شد (نمایشی)",
    });
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      toast({
        title: "خطا",
        description: "نام دسته‌بندی نمی‌تواند خالی باشد",
        variant: "destructive",
      });
      return;
    }
    
    // اینجا باید به API پایتون متصل بشی
    // fetch('YOUR_PYTHON_API/categories', {
    //   method: 'POST',
    //   body: JSON.stringify({ name: newCategoryName }),
    //   headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
    // });
    
    toast({
      title: "موفقیت",
      description: `دسته‌بندی "${newCategoryName}" اضافه شد (نمایشی)`,
    });
    setNewCategoryName("");
  };

  // اگر ادمین نیست، چیزی نشون نده
  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="bg-gradient-to-r from-primary/10 to-primary/5 py-8">
        <div className="container">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">پنل مدیریت</h1>
              <p className="text-muted-foreground">مدیریت کتاب‌ها و دسته‌بندی‌ها</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8 flex-1">

        <Tabs defaultValue="books" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
            <TabsTrigger value="books" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              مدیریت کتاب‌ها
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <Tags className="h-4 w-4" />
              مدیریت دسته‌بندی‌ها
            </TabsTrigger>
          </TabsList>

          <TabsContent value="books">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Upload Form */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="h-5 w-5" />
                      آپلود کتاب جدید
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleUpload} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="title">عنوان کتاب</Label>
                          <Input id="title" placeholder="عنوان کتاب" required />
                        </div>
                        <div>
                          <Label htmlFor="author">نویسنده</Label>
                          <Input id="author" placeholder="نام نویسنده" required />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="description">توضیحات</Label>
                        <Textarea
                          id="description"
                          placeholder="توضیحات کتاب..."
                          rows={4}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="category">دسته‌بندی</Label>
                          <Select value={selectedCategory} onValueChange={setSelectedCategory} required>
                            <SelectTrigger>
                              <SelectValue placeholder="انتخاب دسته‌بندی" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.filter(cat => cat.id !== 'all').map((category) => (
                                <SelectItem key={category.id} value={category.name}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="year">سال انتشار</Label>
                          <Input id="year" type="number" placeholder="1400" required />
                        </div>
                        <div>
                          <Label htmlFor="pages">تعداد صفحات</Label>
                          <Input id="pages" type="number" placeholder="300" required />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="tags">برچسب‌ها (با کاما جدا کنید)</Label>
                        <Input id="tags" placeholder="فلسفه اسلامی, حکمت, ..." />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="cover">تصویر جلد</Label>
                          <Input id="cover" type="file" accept="image/*" />
                        </div>
                        <div>
                          <Label htmlFor="pdf">فایل PDF</Label>
                          <Input id="pdf" type="file" accept=".pdf" />
                        </div>
                      </div>

                      <Button type="submit" className="w-full">
                        <Upload className="h-4 w-4 ml-2" />
                        آپلود کتاب
                      </Button>

                      <div className="bg-muted p-4 rounded-lg text-sm">
                        <p className="font-bold mb-2">💡 راهنمای اتصال به API پایتون:</p>
                        <code className="text-xs block">
                          POST /api/books<br/>
                          Content-Type: multipart/form-data<br/>
                          Authorization: Bearer YOUR_TOKEN
                        </code>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Books List */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      کتاب‌های موجود ({mockBooks.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-[600px] overflow-y-auto">
                      {mockBooks.map((book) => (
                        <div
                          key={book.id}
                          className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent transition-colors"
                        >
                          <img
                            src={book.coverUrl}
                            alt={book.title}
                            className="w-12 h-16 object-cover rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">
                              {book.title}
                            </h4>
                            <p className="text-xs text-muted-foreground truncate">
                              {book.author}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {book.category}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="categories">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Add Category Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FolderPlus className="h-5 w-5" />
                    اضافه کردن دسته‌بندی جدید
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="newCategory">نام دسته‌بندی</Label>
                      <Input
                        id="newCategory"
                        placeholder="مثال: هوش مصنوعی"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                      />
                    </div>
                    <Button onClick={handleAddCategory} className="w-full">
                      <FolderPlus className="h-4 w-4 ml-2" />
                      افزودن دسته‌بندی
                    </Button>
                    <div className="bg-muted p-4 rounded-lg text-sm">
                      <p className="font-bold mb-2">💡 راهنمای اتصال به API پایتون:</p>
                      <code className="text-xs block">
                        POST /api/categories<br/>
                        Content-Type: application/json<br/>
                        Authorization: Bearer YOUR_TOKEN
                      </code>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Categories List */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tags className="h-5 w-5" />
                    دسته‌بندی‌های موجود ({categories.filter(c => c.id !== 'all').length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {categories.filter(cat => cat.id !== 'all').map((category) => (
                      <div
                        key={category.id}
                        className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium">{category.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {category.count} کتاب
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
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
