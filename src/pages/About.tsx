import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Users, Globe, Award } from "lucide-react";

const About = () => {
  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-sm text-primary font-medium mb-2">Nexo-Library</p>
          <h1 className="text-4xl font-bold mb-4 tracking-tight">درباره ما</h1>
          <p className="text-lg text-muted-foreground">سامانه مدیریت کتابخانه الکترونیک</p>
        </div>

        <Card className="mb-8">
          <CardContent className="p-8">
            <p className="text-lg leading-relaxed text-justify mb-6">
              Nexo-Library با هدف فراهم آوردن دسترسی آسان و سریع دانشجویان، اساتید و پژوهشگران
              به منابع علمی و کتاب‌های تخصصی راه‌اندازی شده است و به‌عنوان زیرساخت دیجیتال یک
              کتابخانه الکترونیک طراحی می‌شود.
            </p>
            <p className="text-lg leading-relaxed text-justify">
              ماموریت ما ایجاد یک پلتفرم جامع و کاربرپسند برای مطالعه آنلاین، جستجوی پیشرفته و
              دسترسی به هزاران عنوان کتاب در حوزه‌های مختلف علوم است.
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { icon: BookOpen, title: "منابع گسترده", body: "دسترسی به هزاران کتاب و منبع علمی در حوزه‌های مختلف" },
            { icon: Users, title: "در خدمت جامعه علمی", body: "پشتیبانی از دانشجویان، اساتید و پژوهشگران" },
            { icon: Globe, title: "دسترسی آنلاین", body: "امکان مطالعه و دانلود کتاب‌ها از هر کجا و هر زمان" },
            { icon: Award, title: "کیفیت و اعتبار", body: "منابع معتبر و بررسی‌شده برای مطالعه تخصصی" },
          ].map((item) => (
            <Card key={item.title}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.body}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default About;
