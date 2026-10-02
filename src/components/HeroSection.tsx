import { Button } from "@/components/ui/button";
import { Trophy, ArrowRight, Star, ChevronRight, ChevronLeft, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useRef } from "react";
import { homepageService, HeroConfig, Banner } from "@/services/homepageService";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

const HeroSection = () => {
  const { t } = useTranslation();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user from local storage");
      }
    }
  }, []);

  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-[#0B0F1A] min-h-screen flex items-center">
      {/* Subtle Magic Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0 opacity-40 md:opacity-100"
          style={{
            background: `radial-gradient(circle at 50% 30%, rgba(250,204,21,0.12), transparent 60%)`
          }}
        />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02]" />
      </div>

      <div className="container relative z-10 px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Content */}
          <div className="space-y-12">
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold tracking-wider"
              >
                <Trophy className="w-4 h-4" />
                {t('hero.badge')}
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl md:text-7xl lg:text-8xl font-black font-cinzel leading-[1.2] tracking-tight text-white/95"
              >
                {t('hero.title').split(' ').slice(0, -1).join(' ')} <br />
                <span className="text-primary italic gold-glow px-1">{t('hero.title').split(' ').slice(-1)}</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-sm md:text-xl lg:text-2xl font-medium text-secondary/70 leading-relaxed font-cinzel max-w-xl"
              >
                {t('hero.subtitle')}
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 pt-4"
            >
              <Button size="lg" className="h-14 md:h-16 px-10 text-base md:text-lg rounded-xl bg-primary text-background font-bold shadow-lg hover:-translate-y-1 transition-all active:scale-95 w-full sm:w-auto" asChild>
                <Link to="/all-olympiads">
                  {t('hero.cta_olympiad')}
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-14 md:h-16 px-10 text-base md:text-lg rounded-xl border-white/10 text-primary font-bold hover:bg-white/5 transition-all active:scale-95 w-full sm:w-auto" asChild>
                <Link to="/all-courses">
                  {t('hero.cta_courses')}
                </Link>
              </Button>
            </motion.div>

            {/* Prestige Access Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="group relative max-w-md"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 via-primary/20 to-primary/50 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative overflow-hidden bg-white/[0.03] backdrop-blur-2xl border border-white/5 rounded-3xl p-8 hover:border-primary/30 transition-all duration-500">
                {/* Shimmer Line */}
                <div className="absolute top-0 -left-[100%] w-full h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent group-hover:animate-shimmer-line" />

                <div className="flex justify-between items-start mb-8">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[10px] font-black tracking-widest text-primary/80 uppercase">
                      <Star className="w-3 h-3 fill-primary" />
                      {t('hero.prestige.title')}
                    </div>
                    <div className="text-xl font-black text-white font-cinzel">
                      {t('hero.prestige.subtitle')}
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
                    <Trophy className="w-6 h-6 text-primary" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6 mb-8 border-y border-white/5 py-6">
                  <div className="space-y-1">
                    <div className="text-xl font-bold text-white tracking-tighter">
                      {user ? user.certificates_count || 0 : "12"}
                    </div>
                    <div className="text-[9px] font-bold text-secondary/60 uppercase tracking-wider">
                      Sertifikat
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xl font-bold text-white tracking-tighter">
                      {user ? user.olympiads_count || 0 : "4"}
                    </div>
                    <div className="text-[9px] font-bold text-secondary/60 uppercase tracking-wider">
                      {t('hero.prestige.wins')}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xl font-bold text-white tracking-tighter">
                      {user ? user.xp || 0 : "4500"}
                    </div>
                    <div className="text-[9px] font-bold text-secondary/60 uppercase tracking-wider">
                      {t('hero.prestige.xp')}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-3 text-xs font-medium text-secondary/80">
                    <CheckCircle className="w-4 h-4 text-green-500/80" />
                    {t('hero.prestige.feature_certs')}
                  </div>
                  <div className="flex items-center gap-3 text-xs font-medium text-secondary/80">
                    <CheckCircle className="w-4 h-4 text-green-500/80" />
                    {t('hero.prestige.feature_olympiads')}
                  </div>
                  <div className="flex items-center gap-3 text-xs font-medium text-secondary/80">
                    <CheckCircle className="w-4 h-4 text-green-500/80" />
                    {t('hero.prestige.feature_rewards')}
                  </div>
                </div>

                <Link
                  to="/prestige"
                  className="flex items-center justify-between group/link text-xs font-black text-primary uppercase tracking-widest pt-2 border-t border-white/5"
                >
                  {t('hero.prestige.cta')}
                  <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Right: 3D Wizard Element */}
          <div className="relative hidden lg:block">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: 50 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="relative"
            >
              {/* Magic Glow Effects */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/20 blur-[120px] rounded-full animate-pulse opacity-40" />
              <div className="absolute top-1/4 left-3/4 w-32 h-32 bg-blue-500/20 blur-[60px] rounded-full animate-float-slow" />

              <img
                src="/assets/images/hero/wizard.png"
                alt="Magic Wizard"
                className="relative w-full h-auto drop-shadow-[0_0_50px_rgba(250,204,21,0.2)] animate-float"
              />

              {/* Small Floating Particles (Optional CSS needed for better effect) */}
              <div className="absolute top-0 right-0 w-4 h-4 bg-primary/40 rounded-full blur-sm animate-ping" />
              <div className="absolute bottom-1/4 left-1/4 w-2 h-2 bg-blue-400/40 rounded-full blur-sm animate-ping [animation-delay:1s]" />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
