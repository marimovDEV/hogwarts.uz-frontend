import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

const FinalCTA = () => {
    const { t } = useTranslation();

    return (
        <section className="py-32 relative overflow-hidden bg-[#0B0F1A]">
            {/* Subtle Magic Background Close */}
            <div className="absolute inset-0 pointer-events-none">
                <div
                    className="absolute inset-x-0 bottom-0 h-[500px] opacity-30"
                    style={{
                        background: `radial-gradient(circle at 50% 100%, rgba(250,204,21,0.15), transparent 70%)`
                    }}
                />
            </div>

            <div className="container mx-auto px-4 relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="max-w-4xl mx-auto space-y-12"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
                        <Sparkles className="w-4 h-4" />
                        {t('finalCTA.badge')}
                    </div>

                    <h2 className="text-5xl md:text-8xl font-black text-white font-cinzel leading-[1.05] tracking-tighter">
                        {t('finalCTA.title')} <br />
                        <span className="text-primary italic">{t('finalCTA.titleAccent')}</span>
                    </h2>

                    <p className="text-xl md:text-2xl text-secondary max-w-2xl mx-auto font-medium italic font-cinzel">
                        {t('finalCTA.description')}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center pt-8">
                        <Link to="/auth/register" className="w-full sm:w-auto">
                            <Button size="lg" className="h-16 md:h-20 px-12 rounded-2xl bg-primary text-background font-black text-xl shadow-gold hover:-translate-y-1 transition-all active:scale-95 group w-full">
                                {t('finalCTA.register')}
                                <ArrowRight className="w-6 h-6 ml-3 transition-transform group-hover:translate-x-1" />
                            </Button>
                        </Link>
                        <Link to="/all-olympiads" className="w-full sm:w-auto">
                            <Button size="lg" variant="outline" className="h-16 md:h-20 px-12 rounded-2xl border-white/10 text-white font-black hover:bg-white/5 transition-all active:scale-95 w-full">
                                {t('finalCTA.view_olympiads')}
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default FinalCTA;
