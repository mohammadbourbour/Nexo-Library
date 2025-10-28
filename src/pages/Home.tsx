import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BookCard } from "@/components/BookCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

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

  // ------------------ Filtered books ------------------
  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || book.category_id === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // ------------------ Update counts for categories ------------------
  const categoriesWithCount = categories.map((cat) => ({
    ...cat,
    count: cat.id === "all" ? books.length : books.filter((b) => b.category_id === cat.id).length,
  }));

  return (
    <div className="min-h-screen flex flex-col">
      <Header onSearch={setSearchQuery} />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground py-16">
        <div className="container text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            کتابخانه الکترونیک دانشگاه صدرالمتألهین
          </h1>
          <p className="text-lg md:text-xl mb-8 opacity-90">
            دسترسی آنلاین به هزاران کتاب علمی و تخصصی
          </p>
          {/* Search Section */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                {/* آیکون سرچ */}
                <Search className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                
                {/* Input کنترل‌شده */}
                <input
                  type="search"
                  placeholder="جستجوی کتاب، نویسنده، موضوع..."
                  value={searchQuery} // متن سرچ رو نمایش میده
                  onChange={(e) => setSearchQuery(e.target.value)} // آپدیت state
                  className="w-full pr-12 h-12 text-lg rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>


        </div>
      </section>

        {/* Categories */}
        <section className="py-8 border-b bg-muted/30">
          <div className="container">
            <div className="flex flex-wrap gap-2 justify-center">
              {categoriesWithCount.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.id)}
                  className="gap-2"
                >
                  {category.name}
                  <span className="text-xs opacity-70">({category.count})</span>
                </Button>
              ))}
            </div>
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


      <Footer />
    </div>
  );
};

export default Home;
