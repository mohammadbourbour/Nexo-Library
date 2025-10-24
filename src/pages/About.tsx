import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Users, Globe, Award } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="container py-12 flex-1">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">درباره کتابخانه صدرا</h1>
            <p className="text-lg text-muted-foreground">
              کتابخانه الکترونیک دانشگاه صدرالمتألهین
            </p>
          </div>

          <Card className="mb-8">
            <CardContent className="p-8">
              <p className="text-lg leading-relaxed text-justify mb-6">
                کتابخانه الکترونیک صدرا با هدف فراهم آوردن دسترسی آسان و سریع
                دانشجویان، اساتید و پژوهشگران به منابع علمی و کتاب‌های تخصصی راه‌اندازی
                شده است. این کتابخانه بخشی از زیرساخت‌های دیجیتال دانشگاه صدرالمتألهین
                محسوب می‌شود.
              </p>
              <p className="text-lg leading-relaxed text-justify">
                ماموریت ما ایجاد یک پلتفرم جامع و کاربرپسند برای مطالعه آنلاین،
                جستجوی پیشرفته و دسترسی به هزاران عنوان کتاب در حوزه‌های مختلف علوم
                انسانی، فلسفه، الهیات و سایر رشته‌های تخصصی است.
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">منابع گسترده</h3>
                    <p className="text-sm text-muted-foreground">
                      دسترسی به هزاران کتاب و منبع علمی در حوزه‌های مختلف
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">در خدمت جامعه علمی</h3>
                    <p className="text-sm text-muted-foreground">
                      پشتیبانی از دانشجویان، اساتید و پژوهشگران
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Globe className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">دسترسی آنلاین</h3>
                    <p className="text-sm text-muted-foreground">
                      امکان مطالعه و دانلود کتاب‌ها از هر کجا و هر زمان
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">کیفیت و اعتبار</h3>
                    <p className="text-sm text-muted-foreground">
                      منابع معتبر و بررسی شده توسط اساتید متخصص
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default About;
