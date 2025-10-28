import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Download, ZoomIn, ZoomOut, ChevronRight, ChevronLeft } from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { API_BASE_URL, API_ENDPOINTS } from "@/config/api";

// تنظیم worker برای react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  language: string;
  year?: number;
  pages?: number;
  cover_url?: string;
  pdf_url?: string;
  category_id?: string;
  tags?: string[];
}

const getFullUrl = (url?: string) => {
  if (!url) return "";

  // اگر مسیر با static/uploads شروع می‌شه و دوباره static/uploads اضافه شده، حذفش کن
  const cleanedUrl = url.replace(/^\/?static\/uploads\//, "").replace(/^static\/uploads\//, "");

  // مسیر نهایی: /{subfolder}/static/uploads/file.pdf
  return `/${cleanedUrl}`;
};



const ReadBook = () => {
  const { id } = useParams();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}${API_ENDPOINTS.BOOKS}/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch book");
        return res.json();
      })
      .then(data => {
        setBook(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">در حال بارگذاری کتاب...</p>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">کتاب یافت نشد</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Link to="/">
            <Button>بازگشت به صفحه اصلی</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Reader Header */}
      <header className="sticky top-0 z-50 border-b bg-background shadow-sm">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to={`/book/${book.id}`}>
              <Button variant="ghost" size="sm">
                <ArrowRight className="h-4 w-4 ml-1" />
                بازگشت
              </Button>
            </Link>
            <div>
              <h1 className="font-semibold text-sm">{book.title}</h1>
              <p className="text-xs text-muted-foreground">{book.author}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
              disabled={pageNumber <= 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <span className="text-sm min-w-[100px] text-center">
              صفحه {pageNumber} از {numPages || "..."}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
              disabled={pageNumber >= numPages}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="border-r pr-2 mr-2 flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setScale(Math.max(0.5, scale - 0.1))}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm min-w-[60px] text-center">{Math.round(scale * 100)}%</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setScale(Math.min(2, scale + 0.1))}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
            {book.pdf_url && (
              <Button variant="outline" size="sm" asChild>
                <a href={getFullUrl(book.pdf_url)} download>
                  <Download className="h-4 w-4 ml-1" />
                  دانلود
                </a>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* PDF Viewer Area */}
      <div className="container py-8">
        <div className="bg-background rounded-lg shadow-lg overflow-hidden max-w-5xl mx-auto">
          <div className="flex items-center justify-center p-4 bg-muted/30">
            {book.pdf_url ? (
              <Document
                file={getFullUrl(book.pdf_url)}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={
                  <div className="flex items-center justify-center p-12">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-muted-foreground">در حال بارگذاری PDF...</p>
                    </div>
                  </div>
                }
                error={
                  <div className="flex items-center justify-center p-12">
                    <div className="text-center">
                      <p className="text-destructive mb-4">خطا در بارگذاری PDF</p>
                      <p className="text-sm text-muted-foreground">
                        لطفاً مطمئن شوید که فایل PDF معتبر است و به درستی آپلود شده است.
                      </p>
                    </div>
                  </div>
                }
              >
                <Page
                  pageNumber={pageNumber}
                  scale={scale}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                  className="mx-auto"
                />
              </Document>
            ) : (
              <div className="text-center p-12">
                <p className="text-muted-foreground mb-4">
                  فایل PDF برای این کتاب موجود نیست
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReadBook;
