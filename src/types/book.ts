export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  category: string;
  tags: string[];
  language: string;
  year: number;
  pages: number;
  coverUrl: string;
  pdfUrl: string;
  createdAt: string;
}

export interface BookCategory {
  id: string;
  name: string;
  count: number;
}
