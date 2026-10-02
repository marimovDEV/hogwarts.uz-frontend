import { motion } from "framer-motion";
import Autoplay from "embla-carousel-autoplay";
import { Button } from "@/components/ui/button";
import { Trophy, Calendar, Users, ArrowRight, Star, Loader2, Sparkles, Medal } from "lucide-react";
import { useState, useEffect, memo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { API_URL, getImageUrl } from "@/services/api";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";

const CountdownTimer = () => {
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState({ days: 12, hours: 14, minutes: 45, seconds: 30 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="grid grid-cols-4 gap-3 mt-8 max-w-md mx-auto lg:mx-0">
      {['days', 'hours', 'minutes', 'seconds'].map((unit) => (
        <div key={unit} className="flex flex-col items-center p-4 bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <span className="text-3xl md:text-4xl font-black text-white font-cinzel relative z-10 text-shadow-glow">
            {timeLeft[unit as keyof typeof timeLeft].toString().padStart(2, '0')}
          </span>
          <span className="text-[10px] md:text-xs font-bold tracking-wider text-primary/80 uppercase mt-2 relative z-10">
            {t(`olympiadsSection.${unit}`, unit)}
          </span>
        </div>
      ))}
    </div>
  );
};

const OlympiadCard = memo(({ olympiad, t }: { olympiad: any; t: any }) => {
  return (
    <div className="group relative h-full bg-[#111827]/80 backdrop-blur-md rounded-[2.5rem] border border-white/5 overflow-hidden transition-all duration-500 hover:border-primary/40 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(250,204,21,0.2)] flex flex-col perspective-1000">
      {/* 3D Tilt Wrapper */}
      <div className="flex-1 flex flex-col transition-transform duration-500 group-hover:rotate-x-2 group-hover:rotate-y-[-2deg]">
        {/* Featured Badge */}
        <div className="absolute top-6 right-6 z-20">
          <Badge className="bg-gradient-to-r from-primary to-yellow-600 text-background font-black px-4 py-1.5 rounded-full shadow-lg border-none">
            <Sparkles className="w-3 h-3 mr-1 inline-block" />
            {olympiad.featured ? "Premium" : "Hot"}
          </Badge>
        </div>

        {/* Media Area */}
        <div className="relative h-64 overflow-hidden rounded-t-[2.5rem]">
          <img
            src={getImageUrl(olympiad.thumbnail)}
            alt={olympiad.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-[#111827]/60 to-transparent" />

          {/* Shimmer Overlay */}
          <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:animate-shimmer-line transform skew-x-12" />
        </div>

        {/* Details */}
        <div className="p-8 flex-1 flex flex-col relative z-10 border-t border-white/5 bg-gradient-to-b from-transparent to-[#0B0F1A]/50">
          <div className="flex items-center justify-between mb-4">
            <Badge variant="outline" className="border-primary/30 text-primary bg-primary/10 font-bold tracking-widest px-3 py-1 text-[10px] uppercase">
              {olympiad.subject}
            </Badge>
            <span className="flex items-center gap-1 text-[10px] font-black text-secondary/70 tracking-widest uppercase bg-white/5 px-3 py-1 rounded-full border border-white/5">
              <Medal className="w-3 h-3 text-secondary" />
              {olympiad.level}
            </span>
          </div>

          <h3 className="text-xl md:text-2xl font-black text-white leading-tight font-cinzel mb-6 line-clamp-2 min-h-[3.5rem] group-hover:text-primary transition-colors">
            {olympiad.title}
          </h3>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="flex items-center gap-3 text-sm font-semibold text-secondary/90 bg-white/5 p-3 rounded-2xl border border-white/5">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-primary" />
              </div>
              <span className="truncate">{olympiad.date}</span>
            </div>
            <div className="flex items-center gap-3 text-sm font-semibold text-secondary/90 bg-white/5 p-3 rounded-2xl border border-white/5">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="w-4 h-4 text-primary" />
              </div>
              <span>{olympiad.participants}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-auto flex items-center justify-between gap-4 pt-6 border-t border-white/5">
            <div className="text-2xl font-black text-white flex items-baseline gap-1">
              {olympiad.price} <span className="text-[10px] text-primary tracking-widest uppercase">{t('olympiadsSection.currency')}</span>
            </div>

            <Link to={olympiad.is_registered ? `/olympiad/${olympiad.id}` : "/auth"} className="flex-1 max-w-[160px]">
              <Button className="w-full h-14 rounded-2xl bg-white text-[#111827] font-black group-hover:bg-primary transition-colors shadow-lg shadow-white/5 group-hover:shadow-primary/20">
                Qatnashish
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
});

const OlympiadSection = () => {
  const { t, i18n } = useTranslation();
  const [upcomingOlympiads, setUpcomingOlympiads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOlympiads = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${API_URL}/olympiads/upcoming/`);
        if (response.data.success) {
          const langCode = i18n.language === 'uz' ? 'uz' : 'ru';
          const mapped = response.data.olympiads.map((item: any) => {
            const startDate = new Date(item.start_date);
            return {
              id: item.id,
              title: item.title,
              subject: item.subject,
              date: startDate.toLocaleDateString(langCode, { month: 'short', day: 'numeric' }),
              time: startDate.toLocaleTimeString(langCode, { hour: '2-digit', minute: '2-digit' }),
              duration: `${item.duration} min`,
              participants: item.participants_count || 0,
              maxParticipants: item.max_participants || 1000,
              price: item.price === "0.00" || item.price === 0 ? t('common.free') : parseFloat(item.price).toLocaleString(),
              level: item.status_display,
              is_registered: item.is_registered,
              is_completed: item.is_completed,
              featured: item.participants_count > 500,
              thumbnail: item.thumbnail
            };
          });
          setUpcomingOlympiads(mapped);
        }
      } catch (err) {
        console.error("Failed to fetch upcoming olympiads:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOlympiads();
  }, [i18n.language]);

  if (!isLoading && upcomingOlympiads.length === 0) return null;

  return (
    <section id="olympiad" className="py-24 md:py-32 relative bg-[#0B0F1A] overflow-hidden">
      {/* Background Magic Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-primary/5 blur-[120px] rounded-full animate-pulse-soft" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-[#4338CA]/10 blur-[100px] rounded-full animate-blob animation-delay-4000" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 items-center">

          {/* Left Content Area - Title & Timer */}
          <div className="lg:w-1/3 flex flex-col space-y-8 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black tracking-widest uppercase mx-auto lg:mx-0">
                <Trophy className="w-4 h-4" />
                Respublika Bosqichi
              </div>

              <h2 className="text-4xl md:text-6xl font-black text-white font-cinzel leading-[1.1]">
                Nufuzli <br />
                <span className="text-primary italic gold-glow px-1">Olimpiadalar</span>
              </h2>

              <p className="text-secondary/70 font-medium text-lg leading-relaxed max-w-md mx-auto lg:mx-0">
                O'zbekistonning eng iqtidorli o'quvchilari bilan raqobatlashing va qimmatbaho sovrinlarni yutib oling.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="pt-6 border-t border-white/5"
            >
              <div className="text-xs font-bold text-white/50 tracking-widest uppercase mb-4">
                Keyingi olimpiadaga qoldi:
              </div>
              <CountdownTimer />
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="pt-4 hidden lg:block"
            >
              <Button variant="link" className="text-primary p-0 h-auto font-black flex items-center gap-2 hover:gap-4 transition-all" asChild>
                <Link to="/all-olympiads">
                  Barcha olimpiadalarni ko'rish <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </motion.div>
          </div>

          {/* Right Carousel Area */}
          <div className="lg:w-2/3 w-full">
            {isLoading ? (
              <div className="flex items-center justify-center py-32 rounded-[3rem] border border-white/5 bg-white/[0.02]">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                <Carousel
                  opts={{ align: "start", loop: true }}
                  plugins={[Autoplay({ delay: 6000, stopOnInteraction: true })]}
                  className="w-full"
                >
                  <CarouselContent className="-ml-6 py-8">
                    {upcomingOlympiads.map((olympiad) => (
                      <CarouselItem key={olympiad.id} className="pl-6 md:basis-1/2 lg:basis-1/2 xl:basis-1/2 cursor-grab active:cursor-grabbing">
                        <OlympiadCard olympiad={olympiad} t={t} />
                      </CarouselItem>
                    ))}
                  </CarouselContent>

                  {/* Custom Carousel Navigation */}
                  <div className="flex items-center justify-end gap-3 mt-6 lg:absolute lg:-top-20 lg:right-0 lg:mt-0 px-4 lg:px-0">
                    <CarouselPrevious className="static translate-y-0 h-14 w-14 rounded-2xl bg-[#111827] border-white/10 text-white hover:bg-primary hover:text-[#111827] hover:border-primary transition-all shadow-xl" />
                    <CarouselNext className="static translate-y-0 h-14 w-14 rounded-2xl bg-[#111827] border-white/10 text-white hover:bg-primary hover:text-[#111827] hover:border-primary transition-all shadow-xl" />
                  </div>
                </Carousel>
              </motion.div>
            )}

            {/* Mobile View All Link */}
            <div className="mt-10 text-center lg:hidden flex justify-center">
              <Button variant="outline" className="border-primary/20 text-primary bg-primary/5 hover:bg-primary/20 font-bold rounded-xl h-14 px-8 w-full sm:w-auto" asChild>
                <Link to="/all-olympiads">
                  Barcha olimpiadalarni ko'rish
                </Link>
              </Button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default OlympiadSection;

