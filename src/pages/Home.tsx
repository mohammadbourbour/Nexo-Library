import { useState, useEffect } from "react";
import { BookCard } from "@/components/BookCard";
import { AdvancedSearch } from "@/components/AdvancedSearch";
import { bookService } from "@/services/bookService";
import { categoryService, Category } from "@/services/categoryService";
import { resolveMediaUrl } from "@/config/api";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen } from "lucide-react";

interface Book {
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

const Home = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchFilters, setSearchFilters] = useState({
    query: "",
    category: "all",
    language: "all",
    yearFrom: "",
    yearTo: "",
    author: "",
  });

  const loadBooks = async () => {
    try {
      const data: Book[] = await bookService.getAllBooks();
      setBooks(data);
    } catch (err) {
      console.error("Failed to load books:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data: Category[] = await categoryService.getAllCategories();
      setCategories([{ id: "all", name: "همه دسته‌ها", count: data.length }, ...data]);
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  };

  useEffect(() => {
    loadBooks();
    loadCategories();
  }, []);

  useEffect(() => {
    let result = books;

    if (searchFilters.query) {
      result = result.filter(
        (book) =>
          book.title.toLowerCase().includes(searchFilters.query.toLowerCase()) ||
          book.author.toLowerCase().includes(searchFilters.query.toLowerCase()) ||
          book.description.toLowerCase().includes(searchFilters.query.toLowerCase())
      );
    }

    if (searchFilters.category !== "all") {
      result = result.filter((book) => book.category_id === searchFilters.category);
    }

    if (searchFilters.language !== "all") {
      result = result.filter((book) => book.language === searchFilters.language);
    }

    if (searchFilters.author) {
      result = result.filter((book) =>
        book.author.toLowerCase().includes(searchFilters.author.toLowerCase())
      );
    }

    if (searchFilters.yearFrom) {
      result = result.filter((book) => book.year && book.year >= parseInt(searchFilters.yearFrom));
    }
    if (searchFilters.yearTo) {
      result = result.filter((book) => book.year && book.year <= parseInt(searchFilters.yearTo));
    }

    setFilteredBooks(result);
  }, [books, searchFilters]);

  return (
    <div className="flex flex-col">
      <section className="bg-hero text-primary-foreground py-10 md:py-12">
        <div className="container text-center">
          <p className="text-sm mb-2 opacity-80">کتابخانه دیجیتال</p>
          <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">Nexo-Library</h1>
          <p className="text-sm md:text-base opacity-90 max-w-xl mx-auto">
            جستجو، مطالعه و مدیریت منابع علمی در یک فضای یکپارچه
          </p>
        </div>
      </section>

      <section className="py-6">
        <div className="container">
          <AdvancedSearch categories={categories} onSearch={setSearchFilters} />
        </div>
      </section>

      <section className="pb-12 flex-1">
        <div className="container">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl md:text-2xl font-bold mb-1">کتاب‌های موجود</h2>
              <p className="text-sm text-muted-foreground">
                {loading ? "در حال بارگذاری..." : `${filteredBooks.length} کتاب یافت شد`}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-[3/4] w-full rounded-xl" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ))}
            </div>
          ) : filteredBooks.length === 0 ? (
            <div className="rounded-2xl border border-dashed bg-card/60 py-16 text-center">
              <BookOpen className="mx-auto mb-3 h-10 w-10 text-muted-foreground/70" />
              <p className="text-lg font-medium mb-1">کتابی با این مشخصات یافت نشد</p>
              <p className="text-sm text-muted-foreground">فیلترها را تغییر دهید یا عبارت دیگری جستجو کنید</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {filteredBooks.map((book) => {
                const categoryName =
                  categories.find((cat) => cat.id === book.category_id)?.name || "نامشخص";

                return (
                  <BookCard
                    key={book.id}
                    book={{
                      ...book,
                      coverUrl: resolveMediaUrl(book.cover_url, "/placeholder.svg"),
                      pdfUrl: resolveMediaUrl(book.pdf_url, "/sample.pdf"),
                      category: categoryName,
                      tags: (book as { tags?: string[] }).tags || [],
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
