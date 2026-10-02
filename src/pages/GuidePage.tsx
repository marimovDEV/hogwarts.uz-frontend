import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    BookOpen, Trophy, Award, Gift, Zap, HelpCircle, ChevronRight, Menu, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import PlatformOverview from "@/components/guide/PlatformOverview";
import GettingStartedSteps from "@/components/guide/GettingStartedSteps";
import CoursesGuide from "@/components/guide/CoursesGuide";
import OlympiadsGuide from "@/components/guide/OlympiadsGuide";
import RewardsSystem from "@/components/guide/RewardsSystem";
import FAQSection from "@/components/guide/FAQSection";

const GuidePage = () => {
    const { t } = useTranslation();
    const [activeSection, setActiveSection] = useState("platform-overview");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navItems = [
        { id: "platform-overview", label: t('guide.nav.overview', 'Hogwords nima?'), icon: BookOpen },
        { id: "getting-started", label: t('guide.nav.gettingStarted', 'Boshlash'), icon: Zap },
        { id: "courses-guide", label: t('guide.nav.courses', 'Kurslar'), icon: BookOpen },
        { id: "olympiads-guide", label: t('guide.nav.olympiads', 'Olimpiadalar'), icon: Trophy },
        { id: "rewards-system", label: t('guide.nav.rewards', 'Mukofotlar'), icon: Award },
        { id: "faq", label: t('guide.nav.faq', 'Savollar'), icon: HelpCircle },
    ];

    useEffect(() => {
        const handleScroll = () => {
            const sections = navItems.map(item => document.getElementById(item.id));
            const scrollPosition = window.scrollY + 100;

            sections.forEach(section => {
                if (section) {
                    const top = section.offsetTop;
                    const height = section.offsetHeight;
                    if (scrollPosition >= top && scrollPosition < top + height) {
                        setActiveSection(section.id);
                    }
                }
            });
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            const yOffset = -80;
            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
        setIsMobileMenuOpen(false);
    };

    return (
        <>
            {/* Hero Section */}
            <section className="relative pt-12 pb-20 overflow-hidden bg-primary/5">
                <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(white,transparent_70%)] pointer-events-none" />
                <div className="container relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-3xl mx-auto"
                    >
                        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-bold mb-6">
                            <BookOpen className="w-4 h-4" />
                            {t('guide.hero.badge', 'Platforma Qo\'llanmasi')}
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
                            {t('guide.hero.title', 'Hogwords platformasidan qanday foydalaniladi?')}
                        </h1>
                        <p className="text-xl text-muted-foreground leading-relaxed">
                            {t('guide.hero.subtitle', '2–3 daqiqada platformani to‘liq tushunib oling va o‘qishni boshlang 🎓')}
                        </p>
                    </motion.div>
                </div>
            </section>

            <div className="container py-12">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sticky Sidebar Nav (Desktop) */}
                    <aside className="hidden lg:block w-72 shrink-0">
                        <div className="sticky top-24 space-y-2 bg-card p-4 rounded-2xl border">
                            <h3 className="text-sm font-bold text-muted-foreground px-4 mb-4 uppercase tracking-wider">
                                {t('guide.nav.sidebarTitle', 'Mundarija')}
                            </h3>
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => scrollToSection(item.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeSection === item.id
                                            ? "bg-primary text-primary-foreground shadow-md"
                                            : "hover:bg-muted text-muted-foreground"
                                            }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {item.label}
                                        {activeSection === item.id && (
                                            <ChevronRight className="w-4 h-4 ml-auto" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </aside>

                    {/* Mobile Nav Button */}
                    <div className="lg:hidden sticky top-20 z-30 flex justify-center mb-4">
                        <Button
                            variant="secondary"
                            className="rounded-full shadow-lg border pr-2 pl-4 h-11"
                            onClick={() => setIsMobileMenuOpen(true)}
                        >
                            <span className="mr-2 font-bold">{navItems.find(i => i.id === activeSection)?.label}</span>
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                <Menu className="w-4 h-4 text-primary" />
                            </div>
                        </Button>
                    </div>

                    {/* Mobile Nav Menu Overlay */}
                    <AnimatePresence>
                        {isMobileMenuOpen && (
                            <>
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[60]"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                />
                                <motion.div
                                    initial={{ y: "100%" }}
                                    animate={{ y: 0 }}
                                    exit={{ y: "100%" }}
                                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                    className="fixed bottom-0 left-0 right-0 bg-card rounded-t-[2.5rem] p-6 pt-10 z-[70] border-t shadow-2xl"
                                >
                                    <button
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="absolute top-4 right-6 w-10 h-10 rounded-full bg-muted flex items-center justify-center"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                    <div className="space-y-2">
                                        {navItems.map((item) => {
                                            const Icon = item.icon;
                                            return (
                                                <button
                                                    key={item.id}
                                                    onClick={() => scrollToSection(item.id)}
                                                    className={`w-full flex items-center gap-4 p-4 rounded-2xl text-lg font-bold transition-all ${activeSection === item.id
                                                        ? "bg-primary text-primary-foreground"
                                                        : "bg-muted/50 text-muted-foreground"
                                                        }`}
                                                >
                                                    <Icon className="w-6 h-6" />
                                                    {item.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>

                    {/* Main Content */}
                    <div className="flex-1 space-y-16 lg:space-y-24">
                        <PlatformOverview />
                        <GettingStartedSteps />
                        <CoursesGuide />
                        <OlympiadsGuide />
                        <RewardsSystem />
                        <FAQSection />
                    </div>
                </div>
            </div>

            {/* Bottom CTA */}
            <section className="py-20 bg-primary text-primary-foreground relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                <div className="container text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="max-w-2xl mx-auto"
                    >
                        <h2 className="text-3xl md:text-5xl font-black mb-6">
                            {t('guide.cta.title', 'Tayyormisiz? Hoziroq boshlang! 🚀')}
                        </h2>
                        <p className="text-xl opacity-80 mb-10">
                            {t('guide.cta.subtitle', 'Keling, birgalikda katta natijalarga erishamiz')}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button size="lg" variant="secondary" className="h-14 px-8 rounded-2xl font-bold text-lg" asChild>
                                <Link to="/register">{t('guide.cta.start', 'Ro\'yxatdan o\'tish')}</Link>
                            </Button>
                            <Button size="lg" variant="outline" className="h-14 px-8 rounded-2xl font-bold text-lg border-white/40 text-white hover:bg-white/10" asChild>
                                <Link to="/courses">{t('guide.cta.courses', 'Kurslarni ko\'rish')}</Link>
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </section>
        </>
    );
};

export default GuidePage;
