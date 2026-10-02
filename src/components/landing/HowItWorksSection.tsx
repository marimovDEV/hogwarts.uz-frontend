import { UserPlus, PlayCircle, Trophy, ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { homepageService, HomeStep } from "@/services/homepageService";
import * as Icons from "lucide-react";

// Helper to render dynamic icon
const DynamicIcon = ({ name, className }: { name: string; className?: string }) => {
    const Icon = (Icons as any)[name] || Star;
    return <Icon className={className} />;
};

const HowItWorksSection = () => {
    const { t } = useTranslation();
    const [steps, setSteps] = useState<HomeStep[]>([]);

    // Default steps if none provided
    const defaultSteps = [
        {
            icon: "UserPlus",
            title: t('howItWorks.step1.title'),
            description: t('howItWorks.step1.desc'),
        },
        {
            icon: "PlayCircle",
            title: t('howItWorks.step2.title'),
            description: t('howItWorks.step2.desc'),
        },
        {
            icon: "Trophy",
            title: t('howItWorks.step3.title'),
            description: t('howItWorks.step3.desc'),
        }
    ];

    useEffect(() => {
        const fetchSteps = async () => {
            try {
                const data = await homepageService.getSteps();
                if (data && data.length > 0) {
                    setSteps(data.filter((s: HomeStep) => s.is_active));
                }
            } catch (err) {
                console.error("Failed to load steps", err);
            }
        };
        fetchSteps();
    }, []);

    // For Strict i18n: We ignore CMS steps for text to ensure language consistency
    const displaySteps = defaultSteps; // steps.length > 0 ? steps : defaultSteps;

    // Helper for colors based on index
    const getStepColor = (index: number) => {
        const colors = [
            "bg-blue-100 dark:bg-blue-900/30",
            "bg-indigo-100 dark:bg-indigo-900/30",
            "bg-yellow-100 dark:bg-yellow-900/30",
            "bg-green-100 dark:bg-green-900/30"
        ];
        return colors[index % colors.length];
    };

    return (
        <section className="py-20 bg-background transition-colors duration-300">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                        {t('howItWorks.title').split(t('howItWorks.titleAccent'))[0]}
                        <span className="text-blue-600 dark:text-blue-400">{t('howItWorks.titleAccent')}</span>
                        {t('howItWorks.title').split(t('howItWorks.titleAccent'))[1]}
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        {t('howItWorks.subtitle')}
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-border -z-10" />

                    {displaySteps.map((step, idx) => (
                        <div key={idx} className="relative flex flex-col items-center text-center group">
                            <div className={`w-24 h-24 rounded-3xl ${getStepColor(idx)} flex items-center justify-center mb-6 shadow-lg shadow-gray-100 dark:shadow-none group-hover:scale-110 transition-transform duration-300 relative z-10`}>
                                <DynamicIcon name={(step as any).icon} className={`w-8 h-8 ${idx === 0 ? 'text-blue-600' : idx === 1 ? 'text-indigo-600' : 'text-yellow-600'}`} />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-foreground">{step.title}</h3>
                            <p className="text-muted-foreground leading-relaxed max-w-xs">{(step as any).description || (step as any).desc}</p>

                            {/* Mobile Arrow */}
                            {step.arrow && (
                                <ArrowRight className="w-6 h-6 text-muted mt-6 md:hidden rotate-90" />
                            )}
                        </div>
                    ))}
                </div>

                <div className="text-center mt-12">
                    <Button size="lg" className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-bold h-12 px-8 rounded-xl shadow-lg shadow-blue-200 dark:shadow-none hover:shadow-blue-300 transition-all">
                        {t('howItWorks.cta')}
                    </Button>
                </div>
            </div>
        </section>
    );
};

export default HowItWorksSection;
