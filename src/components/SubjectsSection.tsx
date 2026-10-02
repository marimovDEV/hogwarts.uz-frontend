import { Calculator, Atom, Code, Brain, BookOpen, Globe, Trophy, Users, Zap, Award, Star, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { homepageService } from "@/services/homepageService";
import * as Icons from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import React from "react";

// Helper for dynamic icons
const DynamicIcon = ({ name, className }: { name: string; className?: string }) => {
  const Icon = (Icons as any)[name] || BookOpen;
  return <Icon className={className} />;
};

const SubjectsSection = () => {
  const { t } = useTranslation();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const data = await homepageService.getFeaturedSubjects();
        if (data && Array.isArray(data)) {
          setSubjects(data);
        }
      } catch (error) {
        console.error("Failed to fetch subjects", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSubjects();
  }, []);

  return (
    <section id="subjects" className="py-16 md:py-24 relative bg-[#0B0F1A] overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-20 space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <Badge variant="outline" className="px-6 py-1.5 text-sm border-primary/30 text-primary bg-primary/5 backdrop-blur-sm font-black uppercase tracking-widest">
              <Zap className="w-4 h-4 mr-2" />
              {t('subjectsSection.badge')}
            </Badge>
          </motion.div>
          <h2 className="text-4xl md:text-6xl font-black text-white font-cinzel tracking-tight leading-tight">
            {t('subjectsSection.title').split(' ').slice(0, -1).join(' ')} <span className="text-primary italic">{t('subjectsSection.title').split(' ').slice(-1)}</span>
          </h2>
          <p className="text-xl text-secondary max-w-2xl mx-auto font-medium">
            {t('subjectsSection.subtitle')}
          </p>
        </div>

        {/* Subjects Grid & Carousel */}
        <div className="relative">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {Array(4).fill(0).map((_, i) => (
                <div key={i} className="h-80 rounded-[1rem] bg-white/5 animate-pulse border border-white/5" />
              ))}
            </div>
          ) : (
            <>
              {/* Desktop View (Grid) */}
              <div className="hidden lg:grid grid-cols-3 xl:grid-cols-4 gap-6">
                {subjects.map((subject, index) => (
                  <SubjectCard key={subject.id || index} subject={subject} index={index} t={t} />
                ))}
              </div>

              {/* Mobile/Tablet View (Carousel) */}
              <div className="lg:hidden mx-auto max-w-[90vw]">
                <Carousel
                  opts={{
                    align: "start",
                    loop: true,
                  }}
                  plugins={[
                    Autoplay({
                      delay: 4000,
                    }),
                  ]}
                  className="w-full"
                >
                  <CarouselContent className="-ml-4">
                    {subjects.map((subject, index) => (
                      <CarouselItem key={subject.id || index} className="pl-4 basis-[85%] sm:basis-1/2">
                        <SubjectCard subject={subject} index={index} t={t} />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                </Carousel>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

// Extracted SubjectCard for reuse
const SubjectCard = ({ subject, index, t }: { subject: any, index: number, t: any }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    viewport={{ once: true }}
    className="group h-full"
  >
    <div className="h-full bg-[#111827] rounded-[1rem] border border-white/5 p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-2xl relative overflow-hidden flex flex-col items-start shadow-sm">

      {/* Icon & XP (Simplified) */}
      <div className="flex justify-between items-start w-full mb-6">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
          <DynamicIcon name={subject.icon} className="w-6 h-6" />
        </div>
        {subject.xp_reward && (
          <span className="text-[10px] font-bold text-primary/60 bg-primary/5 px-2 py-1 rounded-lg border border-primary/10 hidden md:block">
            +{subject.xp_reward} XP
          </span>
        )}
      </div>

      {/* Content */}
      <h3 className="text-lg md:text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors font-cinzel">{subject.name}</h3>
      <p className="text-secondary/80 text-sm font-medium leading-relaxed mb-6 line-clamp-1">
        {subject.description || t('professions.coming_soon_desc')}
      </p>

      {/* Stats (Compact) */}
      <div className="w-full flex items-center gap-4 mb-6 py-3 border-y border-white/5 text-[11px] font-medium text-secondary/60">
        <div className="flex items-center gap-1.5">
          <span className="text-white font-bold">{subject.stats?.students || "1k+"}</span>
          <span>{t('subjectsSection.card.students')}</span>
        </div>
        <div className="w-1 h-1 rounded-full bg-white/10" />
        <div className="flex items-center gap-1.5">
          <span className="text-white font-bold">{subject.stats?.olympiads || "5+"}</span>
          <span>{t('subjectsSection.card.olympiads')}</span>
        </div>
      </div>

      {/* Primary CTA (Full width & simplified) */}
      <Link to={`/all-courses?subject=${subject.id}`} className="w-full mt-auto">
        <Button className="w-full h-12 rounded-xl bg-primary text-background font-bold hover:bg-yellow-500 transition-all active:scale-95 flex items-center justify-center gap-2">
          {t('subjectsSection.card.start_course')}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </Link>

      {/* Secondary Link */}
      <Link
        to={`/all-olympiads?subject=${subject.id}`}
        className="w-full text-center mt-3 text-[10px] font-bold uppercase tracking-widest text-[#64748B] hover:text-primary transition-colors"
      >
        {t('subjectsSection.card.view_olympiads')}
      </Link>
    </div>
  </motion.div>
);
export default SubjectsSection;
