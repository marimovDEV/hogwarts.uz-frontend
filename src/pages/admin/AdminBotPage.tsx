import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Smartphone, Shield, RefreshCw, Send, Users, Bell, AlertCircle, Settings as SettingsIcon, CreditCard } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { API_URL, getAuthHeader } from "@/services/api";

const AdminBotPage = () => {
    const { toast } = useToast();
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    const [isBroadcasting, setIsBroadcasting] = useState(false);

    // Settings State
    const [botConfig, setBotConfig] = useState({
        botToken: "",
        adminChatId: "",
        humoBotUrl: "",
        clickMerchantId: "",
        cardNumber: "",
        cardHolder: "",
        botActive: true,
        botUsersCount: 0,
        totalUsersCount: 0,
    });

    // Broadcast State
    const [broadcastMessage, setBroadcastMessage] = useState("");

    useEffect(() => {
        fetchBotConfig();
    }, []);

    const fetchBotConfig = async () => {
        try {
            const res = await axios.get(`${API_URL}/bot/config/`, { headers: getAuthHeader() });
            // API returns paginated list or detailed object? 
            // ViewSet `list` returns {success: true, config: {...}} according to our viewView
            if (res.data.success && res.data.config) {
                setBotConfig({
                    botToken: res.data.config.bot_token || "",
                    adminChatId: res.data.config.admin_chat_id || "",
                    humoBotUrl: res.data.config.humo_bot_url || "",
                    clickMerchantId: res.data.config.click_merchant_id || "",
                    cardNumber: res.data.config.card_number || "",
                    cardHolder: res.data.config.card_holder || "",
                    botActive: res.data.config.is_active,
                    botUsersCount: res.data.stats?.bot_users_count || 0,
                    totalUsersCount: res.data.stats?.total_users_count || 0,
                });
            } else if (Array.isArray(res.data) && res.data.length > 0) {
                // Fallback if standard ModelViewSet list behavior
                const config = res.data[0];
                setBotConfig({
                    botToken: config.bot_token || "",
                    adminChatId: config.admin_chat_id || "",
                    humoBotUrl: config.humo_bot_url || "",
                    clickMerchantId: config.click_merchant_id || "",
                    botActive: config.is_active
                });
            }
        } catch (err) {
            console.error("Error fetching bot config", err);
        }
    };

    const handleSaveConfig = async () => {
        setIsLoading(true);
        try {
            const res = await axios.post(`${API_URL}/bot/config/save_config/`, {
                bot_token: botConfig.botToken,
                admin_chat_id: botConfig.adminChatId,
                humo_bot_url: botConfig.humoBotUrl,
                click_merchant_id: botConfig.clickMerchantId,
                card_number: botConfig.cardNumber,
                card_holder: botConfig.cardHolder,
                is_active: botConfig.botActive
            }, { headers: getAuthHeader() });

            if (res.data.success) {
                toast({
                    title: t('admin.saved'),
                    description: t('admin.botConfigUpdated')
                });
            } else {
                throw new Error("Failed to save");
            }
        } catch (err) {
            toast({
                title: t('admin.error'),
                description: t('admin.saveError'),
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleBroadcast = async () => {
        if (!broadcastMessage.trim()) return;

        setIsBroadcasting(true);
        try {
            const res = await axios.post(`${API_URL}/bot/config/broadcast_message/`, {
                message: broadcastMessage
            }, { headers: getAuthHeader() });

            if (res.data.success) {
                toast({
                    title: t('admin.messageSent'),
                    description: res.data.message || t('admin.broadcastSuccess')
                });
                setBroadcastMessage("");
            } else {
                throw new Error("Broadcast failed");
            }
        } catch (err) {
            toast({
                title: t('admin.error'),
                description: t('admin.broadcastError'),
                variant: "destructive"
            });
        } finally {
            setIsBroadcasting(false);
        }
    };

    return (
        <div className="space-y-6 pb-20">
            <div>
                <h1 className="text-2xl font-black text-gray-900 dark:text-white">{t('admin.bot')}</h1>
                <p className="text-gray-500 dark:text-gray-400">{t('admin.botDesc')}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* CONFIGURATION */}
                <Card className="lg:col-span-2 dark:bg-[#111114] dark:border-white/10">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <SettingsIcon className="w-5 h-5 text-blue-600" />
                            {t('admin.mainSettings')}
                        </CardTitle>
                        <CardDescription>{t('admin.botFather')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold flex items-center gap-2">
                                    <Smartphone className="w-4 h-4 text-gray-500" /> {t('admin.botToken')}
                                </label>
                                <Input
                                    type="password"
                                    placeholder="8024120169:AAE1..."
                                    value={botConfig.botToken}
                                    onChange={(e) => setBotConfig({ ...botConfig, botToken: e.target.value })}
                                    className="font-mono bg-gray-50 dark:bg-[#0a0a0b] dark:border-white/10"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-gray-500" /> {t('admin.adminChatId')}
                                </label>
                                <Input
                                    placeholder="1212795522"
                                    value={botConfig.adminChatId}
                                    onChange={(e) => setBotConfig({ ...botConfig, adminChatId: e.target.value })}
                                    className="font-mono dark:bg-[#0a0a0b] dark:border-white/10"
                                />
                            </div>

                            <div className="flex items-center justify-between p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/20">
                                <div className="space-y-0.5">
                                    <div className="text-sm font-bold text-blue-900 dark:text-blue-400">{t('admin.botStatus')}</div>
                                    <div className="text-xs text-blue-700 dark:text-blue-500">{t('admin.botActiveDesc')}</div>
                                </div>
                                <Switch
                                    checked={botConfig.botActive}
                                    onCheckedChange={(c) => setBotConfig({ ...botConfig, botActive: c })}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t dark:border-white/10">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold flex items-center gap-2">
                                        <Smartphone className="w-4 h-4 text-gray-500" /> {t('admin.humoBotUrl')}
                                    </label>
                                    <Input
                                        placeholder="https://t.me/..."
                                        value={botConfig.humoBotUrl}
                                        onChange={(e) => setBotConfig({ ...botConfig, humoBotUrl: e.target.value })}
                                        className="font-mono dark:bg-[#0a0a0b] dark:border-white/10"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold flex items-center gap-2">
                                        <Shield className="w-4 h-4 text-gray-500" /> {t('admin.clickMerchantId')}
                                    </label>
                                    <Input
                                        placeholder="Merchant ID"
                                        value={botConfig.clickMerchantId}
                                        onChange={(e) => setBotConfig({ ...botConfig, clickMerchantId: e.target.value })}
                                        className="font-mono dark:bg-[#0a0a0b] dark:border-white/10"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t dark:border-white/10 space-y-4">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-blue-600" /> {t('admin.cardSettings')}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-gray-500">{t('admin.cardNumber')}</label>
                                    <Input
                                        placeholder="8600 0000 0000 0000"
                                        value={botConfig.cardNumber}
                                        onChange={(e) => setBotConfig({ ...botConfig, cardNumber: e.target.value })}
                                        className="font-mono dark:bg-[#0a0a0b] dark:border-white/10"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-gray-500">{t('admin.cardHolder')}</label>
                                    <Input
                                        placeholder={t('admin.cardHolderPlaceholder')}
                                        value={botConfig.cardHolder}
                                        onChange={(e) => setBotConfig({ ...botConfig, cardHolder: e.target.value })}
                                        className="font-mono dark:bg-[#0a0a0b] dark:border-white/10"
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="border-t dark:border-white/5 p-4 px-6 bg-gray-50/50 dark:bg-white/5 flex justify-end gap-3">
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-xs dark:bg-[#111114] dark:border-white/10"
                            onClick={() => fetchBotConfig()}
                        >
                            <RefreshCw className="w-3 h-3 mr-2" /> {t('admin.reload')}
                        </Button>
                        <Button
                            onClick={handleSaveConfig}
                            disabled={isLoading}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 h-9 px-6"
                        >
                            {isLoading && <RefreshCw className="w-3 h-3 mr-2 animate-spin" />}
                            {t('admin.save')}
                        </Button>
                    </CardFooter>
                </Card>

                {/* STATS & QUICK INFO */}
                <div className="space-y-6">
                    <Card className="dark:bg-[#111114] dark:border-white/10">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <Users className="w-4 h-4 text-green-600" />
                                {t('admin.botUsers')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black">
                                {botConfig.botUsersCount.toLocaleString()}
                            </div>
                            <p className="text-[10px] text-gray-400 mt-1">
                                {t('admin.botUsersStatsDesc')}
                                ({botConfig.totalUsersCount > 0 ? Math.round((botConfig.botUsersCount / botConfig.totalUsersCount) * 100) : 0}%)
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-orange-50 dark:bg-orange-950/20 border-orange-100 dark:border-orange-900/20">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-bold text-orange-900 dark:text-orange-400 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-orange-600" />
                                {t('admin.guide')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-[11px] space-y-2 text-orange-800 dark:text-orange-500 leading-relaxed">
                            <p>{t('admin.guideStep1')}</p>
                            <p>{t('admin.guideStep2')}</p>
                            <p>{t('admin.guideStep3')}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* BROADCAST SECTION */}
                <Card className="lg:col-span-3 dark:bg-[#111114] dark:border-white/10">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="w-5 h-5 text-purple-600" />
                            {t('admin.broadcast')}
                        </CardTitle>
                        <CardDescription>{t('admin.broadcastDesc')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">{t('admin.broadcastDesc')}</label>
                            <textarea
                                className="w-full min-h-[120px] p-3 rounded-xl border border-input dark:border-white/10 bg-background dark:bg-[#0a0a0b] focus:ring-2 focus:ring-primary outline-none transition-all"
                                placeholder={t('admin.broadcastPlaceholder')}
                                value={broadcastMessage}
                                onChange={(e) => setBroadcastMessage(e.target.value)}
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="border-t dark:border-white/5 p-4 px-6 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
                        <div className="text-[11px] text-gray-500 max-w-lg italic">
                            {t('admin.broadcastDisclaimer')}
                        </div>
                        <Button
                            onClick={handleBroadcast}
                            disabled={isBroadcasting || !broadcastMessage}
                            className="bg-purple-600 hover:bg-purple-700 h-10 px-8"
                        >
                            {isBroadcasting ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                            {t('admin.send')}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div >
    );
};

export default AdminBotPage;
