export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  category: string;
  tags: string[];
  language: string;
  year: number | null;
  pages: number | null;
  coverUrl?: string | null;
  cover_url?: string | null;
  pdfUrl?: string | null;
  pdf_url?: string | null;
  createdAt: string;
}

export interface BookCategory {
  id: string;
  name: string;
  count: number;
}
