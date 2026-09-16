import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileText, Image as ImageIcon, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Category {
  id: string;
  name: string;
}

interface DragDropUploadProps {
  categories: Category[];
  onUploadSuccess: () => void;
}

export const DragDropUpload = ({ categories, onUploadSuccess }: DragDropUploadProps) => {
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    description: "",
    category_id: "",
    language: "fa",
    year: new Date().getFullYear(),
    pages: 0,
  });
  const [uploading, setUploading] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const pdf = files.find(f => f.type === 'application/pdf');
    const image = files.find(f => f.type.startsWith('image/'));

    if (pdf) setPdfFile(pdf);
    if (image) setCoverFile(image);
  }, []);

  const handleUpload = async () => {
    if (!pdfFile || !coverFile) {
      toast({
        title: "خطا",
        description: "لطفاً فایل PDF و تصویر کاور را انتخاب کنید",
        variant: "destructive",
      });
      return;
    }

    if (!formData.title || !formData.author) {
      toast({
        title: "خطا",
        description: "لطفاً عنوان و نویسنده را وارد کنید",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const bookService = (await import("@/services/bookService")).bookService;
      await bookService.addBookWithCover(
        pdfFile,
        coverFile,
        formData.title,
        formData.author,
        formData.description,
        formData.category_id || undefined,
        formData.language,
        formData.year || null,
        formData.pages || null
      );

      toast({
        title: "موفق",
        description: "کتاب با موفقیت آپلود شد",
      });

      // Reset form
      setPdfFile(null);
      setCoverFile(null);
      setFormData({
        title: "",
        author: "",
        description: "",
        category_id: "",
        language: "fa",
        year: new Date().getFullYear(),
        pages: 0,
      });
      onUploadSuccess();
    } catch (error: any) {
      toast({
        title: "خطا",
        description: error.message || "خطا در آپلود کتاب",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Drag & Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all ${
            isDragging
              ? "border-primary bg-primary/10 shadow-soft"
              : "border-border bg-muted/30 hover:border-primary/50 hover:bg-muted/50"
          }`}
        >
          <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-medium mb-2">
            فایل‌ها را اینجا بکشید و رها کنید
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            یا کلیک کنید تا فایل‌ها را انتخاب کنید
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              variant="outline"
              onClick={() => document.getElementById("pdf-input")?.click()}
              type="button"
            >
              <FileText className="w-4 h-4 ml-2" />
              انتخاب PDF
            </Button>
            <Button
              variant="outline"
              onClick={() => document.getElementById("cover-input")?.click()}
              type="button"
            >
              <ImageIcon className="w-4 h-4 ml-2" />
              انتخاب کاور
            </Button>
          </div>
          <input
            id="pdf-input"
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && setPdfFile(e.target.files[0])}
          />
          <input
            id="cover-input"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && setCoverFile(e.target.files[0])}
          />
        </div>

        {/* Selected Files */}
        {(pdfFile || coverFile) && (
          <div className="space-y-2">
            {pdfFile && (
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <span className="text-sm">{pdfFile.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPdfFile(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
            {coverFile && (
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-primary" />
                  <span className="text-sm">{coverFile.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCoverFile(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Form Fields */}
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

        <Button
          onClick={handleUpload}
          disabled={uploading || !pdfFile || !coverFile}
          className="w-full"
          size="lg"
        >
          {uploading ? "در حال آپلود..." : "آپلود کتاب"}
        </Button>
      </div>
    </Card>
  );
};
