import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="text-center animate-scale-in">
        <h1 className="mb-4 text-8xl font-black gradient-text">404</h1>
        <h2 className="mb-6 text-2xl font-bold">Sahifa topilmadi</h2>
        <p className="mb-8 text-muted-foreground max-w-md mx-auto">
          Uzr, siz qidirayotgan sahifa mavjud emas yoki ko'chirilgan bo'lishi mumkin.
        </p>
        <a href="/" className="inline-flex items-center justify-center h-12 px-8 font-medium bg-primary text-white rounded-xl shadow-button hover:bg-primary/90 transition-colors">
          Bosh sahifaga qaytish
        </a>
      </div>
    </div>
  );
};

export default NotFound;
