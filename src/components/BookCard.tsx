import { Link } from "react-router-dom";
import { Book } from "@/types/book";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";

interface BookCardProps {
  book: Book;
}

export const BookCard = ({ book }: BookCardProps) => {
  const coverSrc = book.coverUrl || book.cover_url || "/placeholder.svg";

  return (
    <Link to={`/book/${book.id}`} className="block h-full">
      <Card className="overflow-hidden h-full border-border/70 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-soft group">
        <div className="relative aspect-[3/4] overflow-hidden bg-muted">
          <img
            src={coverSrc}
            alt={book.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-transparent opacity-80" />
          <div className="absolute inset-x-0 bottom-0 p-3 text-primary-foreground">
            {book.category && (
              <Badge variant="secondary" className="mb-2 text-[10px] bg-card/90 text-foreground">
                {book.category}
              </Badge>
            )}
            <h3 className="font-bold text-sm line-clamp-2 drop-shadow-sm">{book.title}</h3>
          </div>
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="inline-flex items-center gap-1 rounded-full bg-background/90 px-3 py-1.5 text-xs font-medium text-foreground shadow-soft">
              <BookOpen className="h-3.5 w-3.5" />
              مشاهده
            </span>
          </div>
        </div>
        <div className="p-3">
          <p className="text-sm text-muted-foreground truncate">{book.author}</p>
        </div>
      </Card>
    </Link>
  );
};
