import { Button } from "@/components/ui/button";
import { Trophy, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { homepageService, HomePageConfig } from "@/services/homepageService";

const CTASection = () => {
  const { t } = useTranslation();
  const [config, setConfig] = useState<HomePageConfig | null>(null);

  useEffect(() => {
    homepageService.getConfig().then(res => setConfig(res.config)).catch(console.error);
  }, []);

  const title = t('cta.title');
  const subtitle = t('cta.description');
  const btnText = t('cta.startAction');
  const btnLink = config?.cta_button_link || "/auth";

  return (
    <section className="py-16 md:py-24 relative overflow-hidden bg-background">
      <div className="container mx-auto px-4">
        <div className="relative rounded-3xl overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 gradient-hero" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzMiAyIDIgNC0yIDQtMiA0LTItMi0yLTR6bTAgMGMwIDItMiA0LTIgNHMtMi0yLTItNC0yLTQgMi00IDIgMiAyIDR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />

          {/* Floating decorations */}
          <div className="absolute top-10 left-10 w-20 h-20 rounded-full bg-white/10 blur-xl animate-float" />
          <div className="absolute bottom-10 right-10 w-32 h-32 rounded-full bg-white/10 blur-xl animate-float" style={{ animationDelay: '2s' }} />

          {/* Content */}
          <div className="relative z-10 py-12 md:py-20 px-6 md:px-12 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 text-white text-sm font-medium mb-6 animate-pulse-soft">
              <Sparkles className="w-4 h-4" />
              {t('cta.badge')}
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-4 max-w-3xl mx-auto leading-tight">
              {title}
            </h2>

            <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              {subtitle}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={btnLink}>
                <Button variant="glass" size="xl" className="bg-white text-primary hover:bg-white/90 w-full sm:w-auto">
                  <Trophy className="w-6 h-6" />
                  {btnText}
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="glass" size="xl" className="border-2 border-white/30 text-white hover:bg-white/10 w-full sm:w-auto">
                  {t('cta.moreAction')}
                </Button>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-10 text-white/70 text-sm">
              <div className="flex items-center gap-2 text-left">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                {t('cta.trust1')}
              </div>
              <div className="flex items-center gap-2 text-left">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                {t('cta.trust2')}
              </div>
              <div className="flex items-center gap-2 text-left">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                {t('cta.trust3')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
