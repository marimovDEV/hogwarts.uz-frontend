import { homepageService, HomeStat } from "@/services/homepageService";
import { useEffect, useState } from "react";
import * as Icons from "lucide-react";
import { Star } from "lucide-react";
import { useTranslation } from "react-i18next";

// Helper to render dynamic icon
const DynamicIcon = ({ name, className }: { name: string; className?: string }) => {
  const Icon = (Icons as any)[name] || Icons.Star;
  return <Icon className={className} />;
};

const StatsSection = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState<HomeStat[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await homepageService.getStats();
        setStats(data.filter((s: HomeStat) => s.is_active));
      } catch (e) {
        console.error(e);
      }
    };
    fetchStats();
  }, []);

  // Fallback if empty
  const displayStats = stats.length > 0 ? stats : [
    { id: 1, label: t('stats.students', 'Faol o\'quvchilar'), value: "10K+", icon: "Users", order: 1, is_active: true },
    { id: 2, label: t('stats.lessons', 'Video darslar'), value: "500+", icon: "BookOpen", order: 2, is_active: true },
    { id: 3, label: t('stats.olympiads', 'Olimpiadalar'), value: "150+", icon: "Trophy", order: 3, is_active: true },
    { id: 4, label: t('stats.certificates', 'Sertifikatlar'), value: "5K+", icon: "Award", order: 4, is_active: true },
  ];
  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 gradient-hero opacity-5" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16 animate-slide-up">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 text-success text-sm font-medium mb-4">
            <Icons.TrendingUp className="w-4 h-4" />
            {t('stats.badge', 'Statistika')}
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            {t('stats.title_prefix', 'Bizning')} <span className="gradient-text">{t('stats.title_accent', 'yutuqlarimiz')}</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('stats.description', 'Platformamizning o\'sishi va foydalanuvchilarimizning yutuqlari')}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {displayStats.map((stat, index) => (
            <div
              key={stat.id}
              className="group bg-card rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-card hover:shadow-strong transition-all duration-300 hover:-translate-y-1 text-center animate-scale-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <DynamicIcon name={stat.icon} className={`w-8 h-8 md:w-10 md:h-10 text-primary`} />
              </div>
              <div className="text-3xl md:text-4xl font-extrabold mb-2 gradient-text">
                {stat.value}
              </div>
              <div className="text-lg font-semibold mb-1">{stat.label}</div>
              {/* Description is not in HomeStat model currently, skipping or adding if needed */}
            </div>
          ))}
        </div>

        {/* Trust badge */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 mt-12 md:mt-16">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className="w-5 h-5 text-warning fill-warning" />
            ))}
          </div>
          <span className="text-muted-foreground text-center">
            <span className="font-bold text-foreground">4.9/5</span> {t('stats.rating_text', 'reyting • 2,500+ sharhlar asosida')}
          </span>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
