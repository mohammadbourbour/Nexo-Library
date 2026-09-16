import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-sm font-medium text-primary mb-2">Nexo-Library</p>
        <h1 className="mb-3 text-6xl font-bold tracking-tight">۴۰۴</h1>
        <p className="mb-6 text-lg text-muted-foreground">این صفحه پیدا نشد</p>
        <Button asChild>
          <Link to="/">بازگشت به خانه</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
