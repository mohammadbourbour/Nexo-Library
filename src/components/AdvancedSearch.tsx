import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, X, Filter } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface Category {
  id: string;
  name: string;
}

interface SearchFilters {
  query: string;
  category: string;
  language: string;
  yearFrom: string;
  yearTo: string;
  author: string;
}

interface AdvancedSearchProps {
  categories: Category[];
  onSearch: (filters: SearchFilters) => void;
}

export const AdvancedSearch = ({ categories, onSearch }: AdvancedSearchProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    category: "all",
    language: "all",
    yearFrom: "",
    yearTo: "",
    author: "",
  });

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleReset = () => {
    const resetFilters = {
      query: "",
      category: "all",
      language: "all",
      yearFrom: "",
      yearTo: "",
      author: "",
    };
    setFilters(resetFilters);
    onSearch(resetFilters);
  };

  const hasActiveFilters =
    filters.query !== "" ||
    filters.category !== "all" ||
    filters.language !== "all" ||
    filters.yearFrom !== "" ||
    filters.yearTo !== "" ||
    filters.author !== "";

  return (
    <Card className="p-3 md:p-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={filters.query}
              onChange={(e) => {
                const next = { ...filters, query: e.target.value };
                setFilters(next);
                onSearch(next);
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="جستجوی کتاب، نویسنده، موضوع..."
              className="pr-10 h-11 bg-muted/40 border-transparent focus-visible:border-input"
            />
          </div>
          <CollapsibleTrigger asChild>
            <Button variant={isOpen ? "secondary" : "outline"} size="icon" className="h-11 w-11 shrink-0">
              <Filter className="w-4 h-4" />
            </Button>
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent>
          <div className="space-y-4 pt-4 mt-3 border-t">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">دسته‌بندی</Label>
                <Select
                  value={filters.category}
                  onValueChange={(value) => setFilters({ ...filters, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">همه دسته‌ها</SelectItem>
                    {categories.filter((cat) => cat.id !== "all").map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">زبان</Label>
                <Select
                  value={filters.language}
                  onValueChange={(value) => setFilters({ ...filters, language: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">همه زبان‌ها</SelectItem>
                    <SelectItem value="fa">فارسی</SelectItem>
                    <SelectItem value="en">انگلیسی</SelectItem>
                    <SelectItem value="ar">عربی</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">نویسنده</Label>
                <Input
                  value={filters.author}
                  onChange={(e) => setFilters({ ...filters, author: e.target.value })}
                  placeholder="نام نویسنده"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">از سال</Label>
                <Input
                  type="number"
                  value={filters.yearFrom}
                  onChange={(e) => setFilters({ ...filters, yearFrom: e.target.value })}
                  placeholder="1400"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">تا سال</Label>
                <Input
                  type="number"
                  value={filters.yearTo}
                  onChange={(e) => setFilters({ ...filters, yearTo: e.target.value })}
                  placeholder="1403"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSearch} className="flex-1">
                اعمال فیلتر
              </Button>
              {hasActiveFilters && (
                <Button variant="outline" onClick={handleReset}>
                  <X className="w-4 h-4 ml-2" />
                  پاک کردن
                </Button>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
