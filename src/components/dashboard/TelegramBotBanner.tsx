import { useState, useEffect } from 'react';
import { Send, X, ExternalLink, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { API_URL, getAuthHeader } from '@/services/api';

const TelegramBotBanner = () => {
    const { t } = useTranslation();
    const [isVisible, setIsVisible] = useState(false);
    const [botUrl, setBotUrl] = useState('https://t.me/ardentsoft_olimpiada_bot');
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const userData = JSON.parse(storedUser);
            setUser(userData);

            // Initial check with stored data
            const shouldShow = userData.role === 'STUDENT' && !userData.telegram_id;
            if (shouldShow) {
                setIsVisible(true);
                fetchBotConfig();

                // Fetch fresh user data to verify status
                verifyUserStatus();
            }
        }
    }, []);

    const verifyUserStatus = async () => {
        try {
            const res = await axios.get(`${API_URL}/auth/me/`, { headers: getAuthHeader() });
            if (res.data.success && res.data.user) {
                const freshUser = res.data.user;
                setUser(freshUser);
                localStorage.setItem('user', JSON.stringify(freshUser));

                // Hide if now connected
                if (freshUser.telegram_id) {
                    setIsVisible(false);
                }
            }
        } catch (err) {
            console.error("Error verifying user status", err);
        }
    };

    const fetchBotConfig = async () => {
        try {
            const res = await axios.get(`${API_URL}/bot/config/`, { headers: getAuthHeader() });
            if (res.data.success && res.data.config && res.data.config.humo_bot_url) {
                setBotUrl(res.data.config.humo_bot_url);
            }
        } catch (err) {
            console.error("Error fetching bot config", err);
        }
    };

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-red-600 text-white relative overflow-hidden"
            >
                <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex-1 flex items-center min-w-0">
                            <span className="flex p-2 rounded-lg bg-red-700">
                                <Send className="h-6 w-6 text-white" aria-hidden="true" />
                            </span>
                            <p className="ml-3 font-bold text-white truncate">
                                <span className="md:hidden text-sm">
                                    {t('dashboard.tgBanner.mobile', 'Botga ulaning va xabarlarni oling!')}
                                </span>
                                <span className="hidden md:inline">
                                    {t('dashboard.tgBanner.desktop', 'Platforma botiga ulaning! Kurslar va natijalar haqida xabarlarni Telegram orqali oling.')}
                                </span>
                            </p>
                        </div>
                        <div className="order-3 mt-0 flex-shrink-0 w-full sm:order-2 sm:mt-0 sm:w-auto">
                            <a
                                href={botUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center px-4 py-2 border border-transparent rounded-xl shadow-sm text-sm font-black text-red-600 bg-white hover:bg-red-50 transition-colors"
                            >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                {t('dashboard.tgBanner.cta', 'Ulanish')}
                            </a>
                        </div>
                        <div className="order-2 flex-shrink-0 sm:order-3 sm:ml-3">
                            <button
                                type="button"
                                onClick={() => setIsVisible(false)}
                                className="-mr-1 flex p-2 rounded-md hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-white sm:-mr-2 transition-colors"
                            >
                                <span className="sr-only">Dismiss</span>
                                <X className="h-5 w-5 text-white" aria-hidden="true" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Subtle background decoration */}
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-red-500 rounded-full opacity-20 blur-2xl" />
                <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-32 h-32 bg-red-400 rounded-full opacity-10 blur-3xl" />
            </motion.div>
        </AnimatePresence>
    );
};

export default TelegramBotBanner;
