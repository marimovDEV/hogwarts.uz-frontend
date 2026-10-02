import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import { getBaseUrl } from "@/services/api";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { homepageService, HomePageConfig } from "@/services/homepageService";

const TeaserBlock = () => {
    const { t, i18n } = useTranslation();
    const [config, setConfig] = useState<HomePageConfig | null>(null);

    useEffect(() => {
        homepageService.getConfig().then(res => setConfig(res.config)).catch(console.error);
    }, []);

    if (!config) return null;

    const isRu = i18n.language === 'ru';
    const title = isRu ? config.teaser_title_ru : config.teaser_title_uz;
    const subtitle = isRu ? config.teaser_subtitle_ru : config.teaser_subtitle_uz;
    const buttonText = isRu ? config.teaser_button_text_ru : config.teaser_button_text_uz;
    const buttonLink = config.teaser_button_link || "/auth/register";
    const imageUrl = config.teaser_image ? (config.teaser_image.startsWith('http') ? config.teaser_image : `${import.meta.env.VITE_API_BASE_URL || getBaseUrl()}${config.teaser_image}`) : null;

    return (
        <section className="py-12 bg-primary/5 border-y border-primary/10">
            <div className="container">
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="relative overflow-hidden rounded-2xl md:rounded-3xl p-6 md:p-12 text-center md:text-left shadow-xl min-h-[300px] flex items-center group"
                >
                    {/* Background Layer */}
                    {imageUrl ? (
                        <>
                            <img
                                src={imageUrl}
                                alt={title}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
                        </>
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600" />
                    )}

                    {/* Animated Glows (Visible only when no image) */}
                    {!imageUrl && (
                        <>
                            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                        </>
                    )}

                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 w-full">
                        <div className="max-w-2xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-medium mb-4 backdrop-blur-sm animate-pulse">
                                <Sparkles className="w-3 h-3" />
                                {t('teaser.badge', "Tez kunda")}
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                                {title}
                            </h2>
                            <p className="text-white/90 text-lg mb-0 font-medium">
                                {subtitle}
                            </p>
                        </div>
                        <div className="flex-shrink-0">
                            <Button size="lg" asChild className="bg-white text-indigo-600 hover:bg-white/90 font-bold border-0 shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95">
                                <Link to={buttonLink}>
                                    {buttonText}
                                </Link>
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default TeaserBlock;
