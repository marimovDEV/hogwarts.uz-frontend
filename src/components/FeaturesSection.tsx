import { Video, FileCheck, Trophy, Award, BarChart3, Shield, Clock, Smartphone } from "lucide-react";
import { useTranslation } from "react-i18next";

const FeaturesSection = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: Video,
      title: t('features.f1_title'),
      description: t('features.f1_desc'),
      color: "primary",
    },
    {
      icon: FileCheck,
      title: t('features.f2_title'),
      description: t('features.f2_desc'),
      color: "secondary",
    },
    {
      icon: Trophy,
      title: t('features.f3_title'),
      description: t('features.f3_desc'),
      color: "warning",
    },
    {
      icon: Award,
      title: t('features.f4_title'),
      description: t('features.f4_desc'),
      color: "accent",
    },
    {
      icon: BarChart3,
      title: t('features.f5_title'),
      description: t('features.f5_desc'),
      color: "success",
    },
    {
      icon: Shield,
      title: t('features.f6_title'),
      description: t('features.f6_desc'),
      color: "primary",
    },
    {
      icon: Clock,
      title: t('features.f7_title'),
      description: t('features.f7_desc'),
      color: "secondary",
    },
    {
      icon: Smartphone,
      title: t('features.f8_title'),
      description: t('features.f8_desc'),
      color: "accent",
    },
  ];

  return (
    <section id="about" className="py-16 md:py-24 bg-muted/30 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-10 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-20 left-10 w-64 h-64 rounded-full bg-secondary/5 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16 animate-slide-up">
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            {t('features.badge')}
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-foreground">
            {t('features.title')} <span className="text-secondary">{t('features.titleAccent')}</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('features.subtitle')}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-card rounded-2xl md:rounded-3xl p-6 shadow-card hover:shadow-strong transition-all duration-300 hover:-translate-y-1 animate-scale-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className={`w-14 h-14 rounded-2xl bg-${feature.color}/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className={`w-7 h-7 text-${feature.color}`} />
              </div>
              <h3 className="text-lg font-bold mb-2 text-foreground">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
