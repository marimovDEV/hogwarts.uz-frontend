import { ShieldCheck, Lock, Eye, QrCode } from "lucide-react";
import { useTranslation } from "react-i18next";

const SecurityBlock = () => {
    const { t } = useTranslation();

    return (
        <section className="py-20 bg-background transition-colors duration-300">
            <div className="container mx-auto px-4">
                <div className="grid lg:grid-cols-2 gap-16 items-center">

                    <div className="order-2 lg:order-1">
                        <div className="inline-block px-4 py-1.5 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-bold text-sm mb-4 uppercase tracking-wider">
                            {t('aboutPage.security.badge')}
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                            {t('aboutPage.security.title')}
                        </h2>
                        <p className="text-lg text-muted-foreground mb-8">
                            {t('aboutPage.security.description')}
                        </p>

                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                                    <Lock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-foreground mb-1">{t('aboutPage.security.logs_title')}</h4>
                                    <p className="text-muted-foreground text-sm">{t('aboutPage.security.logs_desc')}</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center shrink-0">
                                    <Eye className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-foreground mb-1">{t('aboutPage.security.anti_cheat_title')}</h4>
                                    <p className="text-muted-foreground text-sm">{t('aboutPage.security.anti_cheat_desc')}</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center shrink-0">
                                    <QrCode className="w-6 h-6 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-foreground mb-1">{t('aboutPage.security.qr_title')}</h4>
                                    <p className="text-muted-foreground text-sm">{t('aboutPage.security.qr_desc')}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="order-1 lg:order-2 relative">
                        <div className="bg-gray-900 dark:bg-black rounded-[2.5rem] p-8 shadow-2xl relative z-10 overflow-hidden transform rotate-2 hover:rotate-0 transition-transform duration-500 border border-white/10">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/20 rounded-full blur-[80px] -mr-16 -mt-16 pointer-events-none" />

                            <div className="flex items-center justify-center mb-8">
                                <ShieldCheck className="w-32 h-32 text-green-500" />
                            </div>

                            <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20 mb-4">
                                <div className="flex justify-between text-white text-sm font-mono mb-2">
                                    <span>{t('aboutPage.security.card_status')}</span>
                                    <span className="text-green-400">{t('aboutPage.security.card_secure')}</span>
                                </div>
                                <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                                    <div className="h-full bg-green-500 w-full animate-pulse" />
                                </div>
                            </div>

                            <div className="text-center text-white/60 text-xs font-mono">
                                System ID: 8X-9942 • Encryption: AES-256
                            </div>
                        </div>

                        {/* Decorative BG */}
                        <div className="absolute inset-0 bg-gray-100 dark:bg-white/5 rounded-[2.5rem] transform -rotate-3 -z-10 scale-95" />
                    </div>

                </div>
            </div>
        </section>
    );
};

export default SecurityBlock;
