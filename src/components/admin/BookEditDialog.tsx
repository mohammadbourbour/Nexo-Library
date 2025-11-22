import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  category_id: string | null;
  language: string;
  year: number | null;
  pages: number | null;
}

interface Category {
  id: string;
  name: string;
}

interface BookEditDialogProps {
  book: Book | null;
  categories: Category[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const BookEditDialog = ({ book, categories, open, onOpenChange, onSuccess }: BookEditDialogProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    description: "",
    category_id: "",
    language: "fa",
    year: new Date().getFullYear(),
    pages: 0,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (book) {
      setFormData({
        title: book.title || "",
        author: book.author || "",
        description: book.description || "",
        category_id: book.category_id || "",
        language: book.language || "fa",
        year: book.year || new Date().getFullYear(),
        pages: book.pages || 0,
      });
    }
  }, [book]);

  const handleSave = async () => {
    if (!book) return;

    if (!formData.title || !formData.author) {
      toast({
        title: "خطا",
        description: "لطفاً عنوان و نویسنده را وارد کنید",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const bookService = (await import("@/services/bookService")).bookService;
      await bookService.updateBook(book.id, {
        title: formData.title,
        author: formData.author,
        description: formData.description,
        category_id: formData.category_id || undefined,
        language: formData.language,
        year: formData.year || null,
        pages: formData.pages || null,
      });

      toast({
        title: "موفق",
        description: "کتاب با موفقیت ویرایش شد",
      });

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "خطا",
        description: error.message || "خطا در ویرایش کتاب",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>ویرایش کتاب</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>عنوان کتاب *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="عنوان کتاب را وارد کنید"
              />
            </div>
            <div>
              <Label>نویسنده *</Label>
              <Input
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                placeholder="نام نویسنده را وارد کنید"
              />
            </div>
            <div>
              <Label>دسته‌بندی</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => setFormData({ ...formData, category_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="انتخاب دسته‌بندی" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>زبان</Label>
              <Select
                value={formData.language}
                onValueChange={(value) => setFormData({ ...formData, language: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fa">فارسی</SelectItem>
                  <SelectItem value="en">انگلیسی</SelectItem>
                  <SelectItem value="ar">عربی</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>سال انتشار</Label>
              <Input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <Label>تعداد صفحات</Label>
              <Input
                type="number"
                value={formData.pages}
                onChange={(e) => setFormData({ ...formData, pages: parseInt(e.target.value) })}
              />
            </div>
          </div>
          <div>
            <Label>توضیحات</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="توضیحات کتاب را وارد کنید"
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            انصراف
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "در حال ذخیره..." : "ذخیره تغییرات"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
