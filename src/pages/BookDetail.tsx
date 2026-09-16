import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { bookService } from "@/services/bookService";
import { resolveMediaUrl } from "@/config/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Download, Calendar, FileText, Tag, Globe, ArrowRight } from "lucide-react";

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const books = await bookService.getAllBooks();
        const found = books.find((b: any) => b.id === id);
        if (!found) {
          setError("کتاب یافت نشد");
        } else {
          setBook(found);
        }
      } catch (err) {
        setError("خطا در دریافت اطلاعات کتاب");
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [id]);

  if (loading) {
    return (
      <div className="container py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <Skeleton className="aspect-[3/4] w-full rounded-xl" />
        <div className="md:col-span-2 space-y-4">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center py-24">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">{error}</h2>
          <Link to="/">
            <Button>بازگشت به صفحه اصلی</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <Link to="/">
        <Button variant="ghost" className="mb-6">
          <ArrowRight className="h-4 w-4 ml-2" />
          بازگشت
        </Button>
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <Card className="overflow-hidden sticky top-24">
            <div className="aspect-[3/4] bg-muted">
              <img
                src={resolveMediaUrl(book.cover_url || book.coverUrl, "/placeholder.svg")}
                alt={book.title}
                className="w-full h-full object-cover"
              />
            </div>
            <CardContent className="p-4 space-y-2">
              {(book.pdf_url || book.pdfUrl) && (
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => navigate(`/read/${book.id}`)}
                >
                  <BookOpen className="h-4 w-4 ml-2" />
                  خواندن آنلاین
                </Button>
              )}
              {(book.pdf_url || book.pdfUrl) && (
                <a href={resolveMediaUrl(book.pdf_url || book.pdfUrl)} download>
                  <Button variant="outline" className="w-full" size="lg">
                    <Download className="h-4 w-4 ml-2" />
                    دانلود PDF
                  </Button>
                </a>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div>
            {(book.category_name || book.category) && (
              <Badge variant="secondary" className="mb-4">
                {book.category_name || book.category}
              </Badge>
            )}
            <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">{book.title}</h1>
            <p className="text-lg text-muted-foreground">{book.author}</p>
          </div>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-3">درباره کتاب</h2>
              <p className="text-muted-foreground leading-relaxed">{book.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">مشخصات کتاب</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">سال انتشار</p>
                    <p className="font-medium">{book.year || "نامشخص"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">تعداد صفحات</p>
                    <p className="font-medium">{book.pages || "نامشخص"} صفحه</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Globe className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">زبان</p>
                    <p className="font-medium">{book.language || "نامشخص"}</p>
                  </div>
                </div>
                {book.tags?.length > 0 && (
                  <div className="flex items-start gap-3">
                    <Tag className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">برچسب‌ها</p>
                      <div className="flex flex-wrap gap-1">
                        {book.tags.map((tag: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BookDetail;
