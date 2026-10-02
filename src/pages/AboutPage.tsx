import MissionHero from "@/components/about/MissionHero";
import SecurityBlock from "@/components/about/SecurityBlock";
import TrustSection from "@/components/landing/TrustSection"; // Reusing TrustSection as it fits perfectly
import { Check, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

const AboutPage = () => {
    const { t } = useTranslation();
    return (
        <main>
            <MissionHero />

            {/* Problem / Solution Section */}
            <section className="py-20 bg-muted/30">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4 text-foreground">{t('aboutPage.whyUs')}</h2>
                        <p className="text-muted-foreground text-lg">{t('aboutPage.subtitle')}</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        <div className="bg-card p-8 rounded-3xl shadow-sm border border-red-200 dark:border-red-900/30 relative overflow-hidden">
                            <div className="absolute top-0 right-0 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-4 py-1 rounded-bl-2xl font-bold text-xs uppercase">{t('aboutPage.problem.badge')}</div>
                            <ul className="space-y-4 pt-4">
                                <li className="flex gap-3 text-muted-foreground">
                                    <XCircle className="w-6 h-6 text-red-500 shrink-0" />
                                    <span>{t('aboutPage.problem.p1')}</span>
                                </li>
                                <li className="flex gap-3 text-muted-foreground">
                                    <XCircle className="w-6 h-6 text-red-500 shrink-0" />
                                    <span>{t('aboutPage.problem.p2')}</span>
                                </li>
                                <li className="flex gap-3 text-muted-foreground">
                                    <XCircle className="w-6 h-6 text-red-500 shrink-0" />
                                    <span>{t('aboutPage.problem.p3')}</span>
                                </li>
                            </ul>
                        </div>

                        <div className="bg-card p-8 rounded-3xl shadow-xl border border-green-200 dark:border-green-900/30 relative overflow-hidden transform md:-translate-y-4 md:border-t-4 md:border-t-green-500">
                            <div className="absolute top-0 right-0 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-4 py-1 rounded-bl-2xl font-bold text-xs uppercase">{t('aboutPage.solution.badge')}</div>
                            <ul className="space-y-4 pt-4">
                                <li className="flex gap-3 text-foreground font-medium">
                                    <div className="bg-green-100 dark:bg-green-900/20 rounded-full p-1"><Check className="w-4 h-4 text-green-600 dark:text-green-400" /></div>
                                    <span>{t('aboutPage.solution.s1')}</span>
                                </li>
                                <li className="flex gap-3 text-foreground font-medium">
                                    <div className="bg-green-100 dark:bg-green-900/20 rounded-full p-1"><Check className="w-4 h-4 text-green-600 dark:text-green-400" /></div>
                                    <span>{t('aboutPage.solution.s2')}</span>
                                </li>
                                <li className="flex gap-3 text-foreground font-medium">
                                    <div className="bg-green-100 dark:bg-green-900/20 rounded-full p-1"><Check className="w-4 h-4 text-green-600 dark:text-green-400" /></div>
                                    <span>{t('aboutPage.solution.s3')}</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            <TrustSection />
            <SecurityBlock />

            {/* Final CTA */}
            <section className="py-24 bg-blue-900 text-white text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="container mx-auto px-4 relative z-10">
                    <h2 className="text-4xl md:text-5xl font-black mb-6">{t('aboutPage.cta_final.title')}</h2>
                    <p className="text-xl text-blue-200 mb-10 max-w-2xl mx-auto">
                        {t('aboutPage.cta_final.text')}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/auth">
                            <Button size="lg" className="h-14 px-10 rounded-2xl bg-white text-blue-900 hover:bg-blue-50 font-black text-lg">
                                {t('aboutPage.cta_final.register')}
                            </Button>
                        </Link>
                        <Link to="/all-olympiads">
                            <Button size="lg" variant="outline" className="h-14 px-10 rounded-2xl border-blue-400 text-blue-100 hover:bg-blue-800 hover:text-white font-bold text-lg">
                                {t('aboutPage.cta_final.view_olympiads')}
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

        </main>
    );
};

export default AboutPage;
