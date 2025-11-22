import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BookCard } from "@/components/BookCard";
import { Button } from "@/components/ui/button";
import { AdvancedSearch } from "@/components/AdvancedSearch";
import { bookService } from "@/services/bookService";
import { categoryService, Category } from "@/services/categoryService";

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
  const [searchFilters, setSearchFilters] = useState({
    query: "",
    category: "all",
    language: "all",
    yearFrom: "",
    yearTo: "",
    author: "",
  });

  // ------------------ Load books ------------------
  const loadBooks = async () => {
    try {
      const data: Book[] = await bookService.getAllBooks();
      setBooks(data);
    } catch (err) {
      console.error("Failed to load books:", err);
    }
  };

  // ------------------ Load categories ------------------
  const loadCategories = async () => {
    try {
      const data: Category[] = await categoryService.getAllCategories();
      // اضافه کردن دسته "همه"
      setCategories([{ id: "all", name: "همه دسته‌ها", count: data.length }, ...data]);
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  };

  useEffect(() => {
    loadBooks();
    loadCategories();
  }, []);

  // ------------------ Apply filters ------------------
  useEffect(() => {
    let result = books;

    // Search query
    if (searchFilters.query) {
      result = result.filter(
        (book) =>
          book.title.toLowerCase().includes(searchFilters.query.toLowerCase()) ||
          book.author.toLowerCase().includes(searchFilters.query.toLowerCase()) ||
          book.description.toLowerCase().includes(searchFilters.query.toLowerCase())
      );
    }

    // Category filter
    if (searchFilters.category !== "all") {
      result = result.filter((book) => book.category_id === searchFilters.category);
    }

    // Language filter
    if (searchFilters.language !== "all") {
      result = result.filter((book) => book.language === searchFilters.language);
    }

    // Author filter
    if (searchFilters.author) {
      result = result.filter((book) =>
        book.author.toLowerCase().includes(searchFilters.author.toLowerCase())
      );
    }

    // Year range filter
    if (searchFilters.yearFrom) {
      result = result.filter((book) => book.year && book.year >= parseInt(searchFilters.yearFrom));
    }
    if (searchFilters.yearTo) {
      result = result.filter((book) => book.year && book.year <= parseInt(searchFilters.yearTo));
    }

    setFilteredBooks(result);
  }, [books, searchFilters]);


  return (
    <div className="min-h-screen flex flex-col">
      

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground py-16">
        <div className="container text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            کتابخانه الکترونیک دانشگاه صدرالمتألهین
          </h1>
          <p className="text-lg md:text-xl mb-8 opacity-90">
            دسترسی آنلاین به هزاران کتاب علمی و تخصصی
          </p>
        </div>
      </section>

        {/* Advanced Search */}
        <section className="py-8 bg-muted/30">
          <div className="container">
            <AdvancedSearch 
              categories={categories}
              onSearch={setSearchFilters}
            />
          </div>
        </section>

        {/* Books Grid */}
        <section className="py-12 flex-1">
          <div className="container">
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">کتاب‌های موجود</h2>
              <p className="text-muted-foreground">
                {filteredBooks.length} کتاب یافت شد
              </p>
            </div>

            {filteredBooks.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground">
                  کتابی با این مشخصات یافت نشد
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredBooks.map((book) => {
                  const categoryName =
                    categories.find((cat) => cat.id === book.category_id)?.name || "نامشخص";

                  return (
                    <BookCard
                      key={book.id}
                      book={{
                        ...book,
                        coverUrl: book.cover_url || "/placeholder.svg",
                        pdfUrl: book.pdf_url || "/sample.pdf",
                        category: categoryName,
                        tags: (book as any).tags || [],
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
