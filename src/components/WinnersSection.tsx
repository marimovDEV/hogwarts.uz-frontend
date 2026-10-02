import { Button } from "@/components/ui/button";
import { Award, Gift, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

// Use imported images or direct paths
// Note: In a real app, I'd import these, but for now I'll use the relative paths since they're in the brain dir
// However, the browser can't access local files outside public/src. 
// I will assume for now I should copy them to public or src/assets. 
// Since I can't easily move files with `cp` without knowing exact paths sometimes, I'll use placeholders for now or let the user know.
// Wait, I can't use local brain paths in the img src directly in a browser environment.
// I should use placeholders or valid URLs. 
// Actually, I can use the `run_command` tool to copy the generated images to `frontend/public/images` so they are accessible.

const WinnersSection = () => {
    const { t } = useTranslation();
    return (
        <section className="py-16 md:py-24 bg-muted/30">
            <div className="container mx-auto px-4">
                <div className="grid lg:grid-cols-2 gap-12 items-center mb-24">
                    {/* Winners Text */}
                    <div className="order-2 lg:order-1">
                        <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                            {t('winners.badge', 'Bizning iftixorimiz')}
                        </span>
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">
                            {t('winners.title', "O'tgan olimpiada")} <span className="text-primary">{t('winners.titleAccent', "g'oliblari")}</span>
                        </h2>
                        <p className="text-lg text-muted-foreground mb-8">
                            {t('winners.description', "Respublika bo'ylab minglab o'quvchilar orasida...")}
                        </p>

                        <div className="space-y-4 mb-8">
                            <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-border">
                                <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center text-warning">
                                    <Award className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="font-bold">Azizbek Toxirov</div>
                                    <div className="text-sm text-muted-foreground">Matematika - 1 o'rin</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-border">
                                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                                    <Award className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="font-bold">Malika Karimova</div>
                                    <div className="text-sm text-muted-foreground">Fizika - 2 o'rin</div>
                                </div>
                            </div>
                        </div>

                        <Link to="/winners">
                            <Button variant="outline">
                                {t('winners.list_button', "G'oliblar ro'yxatini ko'rish")}
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </Link>
                    </div>

                    {/* Winners Image */}
                    <div className="order-1 lg:order-2">
                        <div className="relative rounded-3xl overflow-hidden shadow-strong aspect-[4/3] group">
                            <img
                                src="/images/winners_group.png"
                                alt="Winners"
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                                <div className="text-white">
                                    <div className="text-2xl font-bold">{t('winners.image_title', 'Respublika Bosqichi 2024')}</div>
                                    <div className="text-white/80">{t('winners.image_subtitle', 'Toshkent shahri')}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Prizes Section */}
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Prizes Image */}
                    <div>
                        <div className="relative rounded-3xl overflow-hidden shadow-strong aspect-[4/3] group bg-black">
                            <img
                                src="/images/prizes_tech.png"
                                alt="Prizes"
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-90"
                            />
                            <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-full text-sm font-bold">
                                Premium Sovg'alar
                            </div>
                        </div>
                    </div>

                    {/* Prizes Text */}
                    <div>
                        <span className="inline-block px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
                            {t('winners.prizes_badge', "Sovg'alar jamg'armasi")}
                        </span>
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">
                            {t('winners.prizes_title', 'Bilimga yarasha')} <span className="text-accent">{t('winners.prizes_accent', 'mukofotlar')}</span>
                        </h2>
                        <p className="text-lg text-muted-foreground mb-8">
                            {t('winners.prizes_desc', 'Biz bilmni qadrlaymiz...')}
                        </p>

                        <ul className="space-y-4 mb-8">
                            <li className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                                    <Gift className="w-5 h-5" />
                                </div>
                                <span className="font-medium">{t('winners.prizes_1', 'MacBook Air M2')}</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                                    <Gift className="w-5 h-5" />
                                </div>
                                <span className="font-medium">{t('winners.prizes_2', 'iPhone 15')}</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                                    <Gift className="w-5 h-5" />
                                </div>
                                <span className="font-medium">{t('winners.prizes_3', 'iPad Air')}</span>
                            </li>
                        </ul>

                        <Link to="/auth">
                            <Button variant="hero" size="lg">
                                {t('winners.join_button', 'Ishtirok etish')}
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default WinnersSection;
