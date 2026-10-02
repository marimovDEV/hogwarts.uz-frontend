// Force update

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, Receipt, Settings, Smartphone, Download } from "lucide-react";
import FinanceDashboard from "./finance/FinanceDashboard";
import FinanceTransactions from "./finance/FinanceTransactions";
import FinanceSettings from "./finance/FinanceSettings";
import AdminBotPayments from "./settings/AdminBotPayments"; // Reuse existing
import { getAuthHeader } from "@/services/api";
import { API_URL } from "@/services/api";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

export default function AdminFinancePage() {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState("dashboard");
    const [stats, setStats] = useState({ total: 0, today_count: 0, refunded: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await axios.get(`${API_URL}/admin/stats/`, { headers: getAuthHeader() });
            if (res.data.success) {
                setStats({
                    total: res.data.stats.finance?.total_revenue || 0,
                    today_count: res.data.stats.finance?.today_count || 0,
                    refunded: res.data.stats.finance?.refunded_amount || 0
                });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black tracking-tight">{t('admin.finance')}</h1>
                    <p className="text-muted-foreground">{t('admin.financeDesc')}</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="rounded-xl border-blue-100 hover:bg-blue-50 text-blue-600 transition-colors">
                        <Download className="w-4 h-4 mr-2" />
                        {t('common.download')}
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="dashboard" className="space-y-6">
                <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md pt-1 border-b border-border/50">
                    <TabsList className="h-auto p-0 bg-transparent flex justify-start gap-0 overflow-x-auto no-scrollbar">
                        <TabsTrigger
                            value="dashboard"
                            className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3 bg-transparent border-b-2 border-transparent transition-all"
                        >
                            <LayoutDashboard className="w-4 h-4 mr-2" />
                            {t('admin.tabs.stats')}
                        </TabsTrigger>
                        <TabsTrigger
                            value="transactions"
                            className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3 bg-transparent border-b-2 border-transparent transition-all"
                        >
                            <Receipt className="w-4 h-4 mr-2" />
                            {t('admin.tabs.transactions')}
                        </TabsTrigger>
                        <TabsTrigger
                            value="verification"
                            className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3 bg-transparent border-b-2 border-transparent transition-all"
                        >
                            <Smartphone className="w-4 h-4 mr-2" />
                            {t('admin.tabs.botPayments')}
                        </TabsTrigger>
                        <TabsTrigger
                            value="settings"
                            className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3 bg-transparent border-b-2 border-transparent transition-all"
                        >
                            <Settings className="w-4 h-4 mr-2" />
                            {t('admin.tabs.settings')}
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="dashboard" className="outline-none">
                    <FinanceDashboard stats={stats} loading={loading} />
                </TabsContent>

                <TabsContent value="transactions" className="outline-none">
                    <FinanceTransactions />
                </TabsContent>

                <TabsContent value="bot_verification" className="outline-none">
                    <AdminBotPayments />
                </TabsContent>

                <TabsContent value="settings" className="outline-none">
                    <FinanceSettings />
                </TabsContent>
            </Tabs>
        </div>
    );
}
