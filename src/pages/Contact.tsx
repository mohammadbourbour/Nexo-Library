import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Send } from "lucide-react";

const Contact = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="container py-12">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-sm text-primary font-medium mb-2">Nexo-Library</p>
          <h1 className="text-4xl font-bold mb-4 tracking-tight">تماس با ما</h1>
          <p className="text-lg text-muted-foreground">
            برای ارتباط با تیم Nexo-Library از راه‌های زیر استفاده کنید
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-6">ارسال پیام</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">نام و نام خانوادگی</Label>
                  <Input id="name" placeholder="نام خود را وارد کنید" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">ایمیل</Label>
                  <Input id="email" type="email" placeholder="you@example.com" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="subject">موضوع</Label>
                  <Input id="subject" placeholder="موضوع پیام" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="message">پیام</Label>
                  <Textarea id="message" placeholder="متن پیام خود را بنویسید..." rows={5} />
                </div>
                <Button type="submit" className="w-full">
                  <Send className="h-4 w-4 ml-2" />
                  ارسال پیام
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">ایمیل</h3>
                    <p className="text-muted-foreground">hello@nexo-library.app</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-3">ساعات پاسخگویی</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">شنبه تا چهارشنبه</span>
                    <span className="font-medium">۸:۰۰ – ۱۶:۰۰</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">پنج‌شنبه</span>
                    <span className="font-medium">۸:۰۰ – ۱۳:۰۰</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">جمعه</span>
                    <span className="font-medium">تعطیل</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
