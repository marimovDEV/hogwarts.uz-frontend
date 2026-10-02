import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Menu,
  X,
  BookOpen,
  Trophy,
  User,
  Languages,
  Globe,
  Zap
} from "lucide-react";
import ArdCoin from "./ArdCoin";
import { getImageUrl } from "@/services/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const location = useLocation();

  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const isLoggedIn = !!token && !!user;

  const changeLanguage = async (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('i18nextLng', lng);

    // If user is logged in, sync to profile
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const { default: authService } = await import("@/services/authService");
        await authService.updateProfile({ language: lng });

        // Update local storage user object if exists
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          user.language = lng;
          localStorage.setItem('user', JSON.stringify(user));
        }
      } catch (error) {
        console.error("Failed to sync language to profile:", error);
      }
    }
  };


  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0B0F1A]/80 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <a
            href="/"
            className="flex items-center gap-2 group"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
              if (window.location.pathname !== '/') {
                window.location.href = '/';
              }
            }}
          >
            <div className="relative">
              <img src="/logo.jpg" alt="Logo" className="w-8 h-8 md:w-9 md:h-9 object-contain group-hover:scale-110 transition-transform duration-300" />
              <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="text-xl md:text-2xl font-black font-cinzel tracking-wider text-primary">
              HOGWORDS
            </span>
          </a>

          <nav className="hidden lg:flex items-center gap-6">
            <NavLink to="/" className={({ isActive }) => `nav-link-premium font-cinzel text-xs uppercase tracking-widest ${isActive ? 'text-primary' : 'text-white/60 hover:text-white'}`}>
              {t('nav.home')}
            </NavLink>
            <NavLink
              to={user?.role === 'STUDENT' ? "/olympiads" : "/all-olympiads"}
              className={({ isActive }) => `nav-link-premium font-cinzel text-xs uppercase tracking-widest ${isActive ? 'text-primary' : 'text-white/60 hover:text-white'}`}
            >
              {t('nav.olympiads')}
            </NavLink>
            <NavLink
              to={user?.role === 'STUDENT' ? "/courses" : "/all-courses"}
              className={({ isActive }) => `nav-link-premium font-cinzel text-xs uppercase tracking-widest ${isActive ? 'text-primary' : 'text-white/60 hover:text-white'}`}
            >
              {t('nav.courses')}
            </NavLink>
            <NavLink to="/winners" className={({ isActive }) => `nav-link-premium font-cinzel text-xs uppercase tracking-widest ${isActive ? 'text-primary' : 'text-white/60 hover:text-white'}`}>
              {t('nav.ranking')}
            </NavLink>
            <NavLink to="/teachers" className={({ isActive }) => `nav-link-premium font-cinzel text-xs uppercase tracking-widest ${isActive ? 'text-primary' : 'text-white/60 hover:text-white'}`}>
              {t('nav.mentors')}
            </NavLink>
            <NavLink to="/guide" className={({ isActive }) => `nav-link-premium font-cinzel text-xs uppercase tracking-widest ${isActive ? 'text-primary' : 'text-white/60 hover:text-white'}`}>
              {t('nav.guides')}
            </NavLink>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full text-white/60 hover:text-primary transition-colors">
                  <Globe className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-[#111827] border-white/10 text-white">
                <DropdownMenuItem onClick={() => changeLanguage('uz')} className="hover:bg-primary/10">
                  <span className="mr-2">🇺🇿</span> O'zbekcha
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeLanguage('ru')} className="hover:bg-primary/10">
                  <span className="mr-2">🇷🇺</span> Русский
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>


            {isLoggedIn ? (
              <div className="flex items-center gap-2 md:gap-3">
                <Link to="/dashboard" className="hidden md:block">
                  <Button variant="ghost" size="sm" className="font-bold text-white/60 hover:text-primary">
                    {t('nav.dashboard', 'Dashboard')}
                  </Button>
                </Link>
                <Link to="/profile">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-primary via-yellow-500 to-orange-500 flex items-center justify-center text-background font-bold border-2 border-primary/20 shadow-lg overflow-hidden shrink-0">
                    {user?.avatar ? (
                      <img src={getImageUrl(user.avatar)} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      (user?.first_name?.[0] || user?.username?.[0] || 'U').toUpperCase()
                    )}
                  </div>
                </Link>
              </div>
            ) : (
              <>
                <Link to="/auth/login">
                  <Button variant="ghost" size="sm" className="font-bold text-foreground hover:text-primary">
                    {t('nav.login')}
                  </Button>
                </Link>
                <Link to="/auth/register">
                  <Button variant="default" size="default" className="shadow-gold font-bold">
                    {t('nav.register')}
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Actions - Simplified */}
          <div className="flex md:hidden items-center gap-2">
            {!isLoggedIn && (
              <Link to="/auth/register">
                <Button variant="default" size="sm" className="h-9 px-4 text-xs font-black shadow-gold rounded-xl">
                  {t('nav.register')}
                </Button>
              </Link>
            )}

            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full w-10 h-10 hover:bg-white/5"
                >
                  <Menu className="w-5 h-5 text-primary" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:w-[350px] bg-[#0B0F1A] border-white/5 p-0">
                <div className="flex flex-col h-full">
                  <div className="p-6 border-b border-white/5">
                    <SheetHeader>
                      <SheetTitle className="text-left">
                        <div className="flex items-center gap-2">
                          <img src="/logo.jpg" alt="Logo" className="w-8 h-8 object-contain" />
                          <span className="text-xl font-black font-cinzel tracking-wider text-primary">HOGWORDS</span>
                        </div>
                      </SheetTitle>
                    </SheetHeader>
                  </div>

                  <ScrollArea className="flex-1 px-4 py-6">
                    <nav className="flex flex-col gap-2">
                      <NavLink
                        to="/"
                        className={({ isActive }) => cn(
                          "flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300",
                          isActive ? "bg-primary/10 text-primary" : "text-white/60 hover:bg-white/5 hover:text-white"
                        )}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Globe className="w-5 h-5" />
                        <span className="font-bold tracking-wide">{t('nav.home')}</span>
                      </NavLink>
                      <NavLink
                        to={user?.role === 'STUDENT' ? "/olympiads" : "/all-olympiads"}
                        className={({ isActive }) => cn(
                          "flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300",
                          isActive ? "bg-primary/10 text-primary" : "text-white/60 hover:bg-white/5 hover:text-white"
                        )}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Trophy className="w-5 h-5" />
                        <span className="font-bold tracking-wide">{t('nav.olympiads')}</span>
                      </NavLink>
                      <NavLink
                        to={user?.role === 'STUDENT' ? "/courses" : "/all-courses"}
                        className={({ isActive }) => cn(
                          "flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300",
                          isActive ? "bg-primary/10 text-primary" : "text-white/60 hover:bg-white/5 hover:text-white"
                        )}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <BookOpen className="w-5 h-5" />
                        <span className="font-bold tracking-wide">{t('nav.courses')}</span>
                      </NavLink>
                      <NavLink
                        to="/winners"
                        className={({ isActive }) => cn(
                          "flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300",
                          isActive ? "bg-primary/10 text-primary" : "text-white/60 hover:bg-white/5 hover:text-white"
                        )}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Zap className="w-5 h-5" />
                        <span className="font-bold tracking-wide">{t('nav.ranking')}</span>
                      </NavLink>
                      <NavLink
                        to="/teachers"
                        className={({ isActive }) => cn(
                          "flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300",
                          isActive ? "bg-primary/10 text-primary" : "text-white/60 hover:bg-white/5 hover:text-white"
                        )}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <User className="w-5 h-5" />
                        <span className="font-bold tracking-wide">{t('nav.mentors')}</span>
                      </NavLink>
                      <NavLink
                        to="/guide"
                        className={({ isActive }) => cn(
                          "flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300",
                          isActive ? "bg-primary/10 text-primary" : "text-white/60 hover:bg-white/5 hover:text-white"
                        )}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <BookOpen className="w-5 h-5" />
                        <span className="font-bold tracking-wide">{t('nav.guides')}</span>
                      </NavLink>
                    </nav>
                  </ScrollArea>

                  <div className="p-6 border-t border-white/5 bg-white/[0.02]">
                    <div className="flex flex-col gap-4">
                      {/* Language & Theme Selectors */}
                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          <Button
                            variant={i18n.language === 'uz' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => changeLanguage('uz')}
                            className="h-10 rounded-xl px-4"
                          >
                            🇺🇿 UZ
                          </Button>
                          <Button
                            variant={i18n.language === 'ru' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => changeLanguage('ru')}
                            className="h-10 rounded-xl px-4"
                          >
                            🇷🇺 RU
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* User Actions */}
                    <div className="grid grid-cols-1 gap-3 pt-2">
                      {isLoggedIn ? (
                        <>
                          <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>
                            <Button className="w-full h-12 rounded-2xl bg-primary text-background font-black shadow-gold">
                              <Zap className="w-4 h-4 mr-2" />
                              {t('nav.dashboard')}
                            </Button>
                          </Link>
                          <Link to="/profile" onClick={() => setIsMenuOpen(false)}>
                            <Button variant="outline" className="w-full h-12 rounded-2xl border-white/10 font-bold">
                              {t('nav.profile', 'Profil')}
                            </Button>
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link to="/auth/login" onClick={() => setIsMenuOpen(false)}>
                            <Button variant="outline" className="w-full h-12 rounded-2xl border-white/10 font-bold">
                              {t('nav.login')}
                            </Button>
                          </Link>
                          <Link to="/auth/register" onClick={() => setIsMenuOpen(false)}>
                            <Button className="w-full h-12 rounded-2xl bg-primary text-background font-black shadow-gold">
                              {t('nav.register')}
                            </Button>
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
