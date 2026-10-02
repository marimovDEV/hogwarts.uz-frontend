import { Button } from "@/components/ui/button";
import { ArrowRight, Trophy } from "lucide-react";
import { useTranslation, Trans } from "react-i18next";
import { Link } from "react-router-dom";

const MissionHero = () => {
    const { t } = useTranslation();

    return (
        <section className="py-20 bg-gray-900 text-white relative overflow-hidden dark:bg-[#111114]">
            {/* Background Gradients */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/30 rounded-full blur-[120px] -mr-32 -mt-32 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-[100px] -ml-20 -mb-20 pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur border border-white/20 mb-8 animate-fade-in">
                    <Trophy className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm font-medium text-blue-100">{t('aboutPage.mission.badge')}</span>
                </div>

                <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight animate-slide-up">
                    {t('aboutPage.mission.title_prefix')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">{t('aboutPage.mission.title_accent')}</span> {t('aboutPage.mission.title_suffix')}
                </h1>

                <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed animate-slide-up delay-100">
                    <Trans i18nKey="aboutPage.mission.description" components={{ 1: <span className="text-white font-bold" /> }} />
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up delay-200">
                    <Link to="/auth">
                        <Button className="h-12 px-8 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg shadow-lg shadow-blue-900/50">
                            {t('aboutPage.mission.cta')}
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default MissionHero;
