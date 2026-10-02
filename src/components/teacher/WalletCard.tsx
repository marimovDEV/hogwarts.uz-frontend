import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, TrendingUp, Clock, Download } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL, getAuthHeader } from "@/services/api";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

interface WalletData {
    balance: number;
    pending_balance: number;
    total_earned: number;
    total_withdrawn: number;
}

export const WalletCard = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [wallet, setWallet] = useState<WalletData>({
        balance: 0,
        pending_balance: 0,
        total_earned: 0,
        total_withdrawn: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWallet = async () => {
            try {
                const res = await axios.get(`${API_URL}/wallet/balance/`, { headers: getAuthHeader() });
                setWallet(res.data);
            } catch (error) {
                console.error("Failed to fetch wallet:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchWallet();
    }, []);

    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('uz-UZ').format(amount) + " " + t('wallet.currency', "so'm");
    };

    return (
        <Card className="border-2 border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-green-600 dark:text-green-400" />
                    {t('wallet.title', 'Hamyon')}
                </CardTitle>
                <CardDescription>{t('wallet.subtitle', 'Moliyaviy hisobot')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                {/* Available Balance */}
                <div className="flex justify-between items-center pb-3 border-b border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="text-sm text-gray-600 dark:text-gray-300">{t('wallet.available_balance', 'Mavjud balans')}</span>
                    </div>
                    <span className="text-lg font-bold text-green-600 dark:text-green-400">
                        {formatMoney(wallet.balance)}
                    </span>
                </div>

                {/* Pending Balance */}
                <div className="flex justify-between items-center pb-3 border-b border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-orange-500 dark:text-orange-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">{t('wallet.pending_balance', 'Kutilayotgan')} (7 {t('wallet.days', 'kun')})</span>
                    </div>
                    <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                        {formatMoney(wallet.pending_balance)}
                    </span>
                </div>

                {/* Total Earned */}
                <div className="flex justify-between items-center pb-3 border-b border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">{t('wallet.total_earned', 'Jami topilgan')}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {formatMoney(wallet.total_earned)}
                    </span>
                </div>

                {/* Total Withdrawn */}
                <div className="flex justify-between items-center pb-3">
                    <div className="flex items-center gap-2">
                        <Download className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">{t('wallet.total_withdrawn', 'Yechib olingan')}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {formatMoney(wallet.total_withdrawn)}
                    </span>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-2">
                    <Button
                        variant="outline"
                        className="w-full border-green-600 text-green-700 hover:bg-green-50 dark:border-green-400 dark:text-green-400 dark:hover:bg-green-950"
                        onClick={() => navigate('/teacher/wallet')}
                    >
                        {t('wallet.view_history', "Tarix ko'rish")}
                    </Button>
                    <Button
                        className="w-full bg-green-600 hover:bg-green-700 text-white dark:bg-green-700 dark:hover:bg-green-600"
                        disabled={wallet.balance < 100000}
                        onClick={() => navigate('/teacher/wallet')}
                    >
                        {t('wallet.withdraw', 'Pul yechish')} {wallet.balance < 100000 && `(${t('wallet.min_amount', 'min.')} 100,000)`}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};
