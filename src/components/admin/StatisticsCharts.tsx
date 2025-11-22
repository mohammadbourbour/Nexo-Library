import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

interface Book {
  id: string;
  title: string;
  language: string;
  year: number | null;
  category_id: string | null;
}

interface Category {
  id: string;
  name: string;
}

interface StatisticsChartsProps {
  books: Book[];
  categories: Category[];
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))', '#8884d8', '#82ca9d', '#ffc658', '#ff8042'];

export const StatisticsCharts = ({ books, categories }: StatisticsChartsProps) => {
  // آماری زبان‌ها
  const languageData = [
    { name: 'فارسی', value: books.filter(b => b.language === 'fa').length },
    { name: 'انگلیسی', value: books.filter(b => b.language === 'en').length },
    { name: 'عربی', value: books.filter(b => b.language === 'ar').length },
  ].filter(item => item.value > 0);

  // آماری دسته‌بندی‌ها
  const categoryData = categories.map(cat => ({
    name: cat.name,
    count: books.filter(b => b.category_id === cat.id).length,
  })).filter(item => item.count > 0).slice(0, 8);

  // آماری سال انتشار
  const currentYear = new Date().getFullYear();
  const yearData = Array.from({ length: 5 }, (_, i) => {
    const year = currentYear - i;
    return {
      year: year.toString(),
      count: books.filter(b => b.year === year).length,
    };
  }).reverse();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* نمودار زبان‌ها */}
      <Card className="bg-gradient-to-br from-background to-muted/20">
        <CardHeader>
          <CardTitle className="text-lg">توزیع زبان کتاب‌ها</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={languageData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {languageData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* نمودار دسته‌بندی‌ها */}
      <Card className="bg-gradient-to-br from-background to-muted/20">
        <CardHeader>
          <CardTitle className="text-lg">تعداد کتاب به تفکیک دسته‌بندی</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* نمودار روند انتشار */}
      <Card className="bg-gradient-to-br from-background to-muted/20 lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg">روند انتشار کتاب‌ها (۵ سال اخیر)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={yearData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="hsl(var(--primary))" 
                strokeWidth={3}
                name="تعداد کتاب"
                dot={{ fill: 'hsl(var(--primary))', r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
