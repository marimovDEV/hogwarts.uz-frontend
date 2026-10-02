import { useState, useEffect } from "react";
import {
    Wallet, TrendingUp, Download, Clock, CheckCircle2,
    XCircle, AlertCircle, Loader2, CreditCard, ChevronRight,
    ArrowUpRight, History
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import { toast } from "sonner";
import axios from "axios";
import { API_URL, getAuthHeader } from "@/services/api";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface WalletData {
    balance: number;
    pending_balance: number;
    total_earned: number;
    total_withdrawn: number;
}

interface PayoutRequest {
    id: number;
    amount: number;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
    card_number: string;
    card_holder: string;
    created_at: string;
    rejection_reason?: string;
}

const TeacherWalletPage = () => {
    const { t } = useTranslation();
    const [wallet, setWallet] = useState<WalletData | null>(null);
    const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
    const [withdrawData, setWithdrawData] = useState({
        amount: 0,
        card_number: "",
        card_holder: ""
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [walletRes, payoutsRes] = await Promise.all([
                axios.get(`${API_URL}/wallet/balance/`, { headers: getAuthHeader() }),
                axios.get(`${API_URL}/payouts/`, { headers: getAuthHeader() })
            ]);
            setWallet(walletRes.data);
            setPayouts(payoutsRes.data.results || []);
        } catch (error) {
            console.error("Failed to fetch wallet data:", error);
            toast.error("Ma'lumotlarni yuklashda xatolik yuz berdi");
        } finally {
            setLoading(false);
        }
    };

    const handleWithdraw = async () => {
        if (withdrawData.amount < 100000) {
            toast.error("Minimal yechish miqdori 100,000 so'm");
            return;
        }
        if (!withdrawData.card_number || withdrawData.card_number.length < 16) {
            toast.error("Karta raqamini to'liq kiriting");
            return;
        }

        setSubmitting(true);
        try {
            await axios.post(`${API_URL}/payouts/`, withdrawData, { headers: getAuthHeader() });
            toast.success("So'rov yuborildi. Tez orada ko'rib chiqiladi.");
            setWithdrawDialogOpen(false);
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "So'rov yuborishda xatolik");
        } finally {
            setSubmitting(false);
        }
    };

    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('uz-UZ').format(amount) + " AC";
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PENDING': return <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 border-yellow-200">Kutilmoqda</Badge>;
            case 'APPROVED': return <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border-blue-200">Tasdiqlandi</Badge>;
            case 'COMPLETED': return <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-200">To'landi</Badge>;
            case 'REJECTED': return <Badge variant="destructive" className="bg-red-500/10 text-red-600 border-red-200">Rad etildi</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    if (loading && !wallet) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black font-cinzel tracking-tight text-foreground">Hamyon va Daromadlar</h1>
                    <p className="text-muted-foreground font-medium mt-1">Kurslardan kelgan daromadlarni boshqaring</p>
                </div>
                <Button
                    onClick={() => setWithdrawDialogOpen(true)}
                    disabled={(wallet?.balance || 0) < 100000}
                    className="bg-primary hover:bg-primary-light shadow-gold font-bold h-12 px-8 rounded-xl gap-2"
                >
                    <Download className="w-5 h-5" /> Pul yechish
                </Button>
            </div>

            {/* Wallet Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-primary/20 bg-primary/5 hover:border-primary/40 transition-colors">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                            Asosiy balans <Wallet className="w-4 h-4 text-primary" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-foreground">{formatMoney(wallet?.balance || 0)}</div>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <ArrowUpRight className="w-3 h-3 text-green-500" /> +15% o'tgan oydan
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                            Kutilayotgan <Clock className="w-4 h-4 text-orange-500" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-foreground">{formatMoney(wallet?.pending_balance || 0)}</div>
                        <p className="text-xs text-muted-foreground mt-1">7 kunlik ushlab turish</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                            Jami topilgan <TrendingUp className="w-4 h-4 text-blue-500" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-foreground">{formatMoney(wallet?.total_earned || 0)}</div>
                        <p className="text-xs text-muted-foreground mt-1">Barcha vaqtlar uchun</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                            Yechib olingan <Download className="w-4 h-4 text-purple-500" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-foreground">{formatMoney(wallet?.total_withdrawn || 0)}</div>
                        <p className="text-xs text-muted-foreground mt-1">Muvaffaqiyatli o'tkazmalar</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="history" className="w-full">
                <TabsList className="bg-muted p-1">
                    <TabsTrigger value="history" className="gap-2 px-6">
                        <History className="w-4 h-4" /> So'rovlar tarixi
                    </TabsTrigger>
                    <TabsTrigger value="info" className="gap-2 px-6">
                        <AlertCircle className="w-4 h-4" /> Ma'lumot
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="history" className="mt-6">
                    <Card>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted/50 border-b border-border">
                                        <tr>
                                            <th className="text-left py-4 px-6 font-bold uppercase tracking-wider text-xs">Sana</th>
                                            <th className="text-left py-4 px-6 font-bold uppercase tracking-wider text-xs">Miqdor</th>
                                            <th className="text-left py-4 px-6 font-bold uppercase tracking-wider text-xs">Karta</th>
                                            <th className="text-left py-4 px-6 font-bold uppercase tracking-wider text-xs">Holat</th>
                                            <th className="text-right py-4 px-6 font-bold uppercase tracking-wider text-xs">Harakat</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {payouts.map((payout) => (
                                            <tr key={payout.id} className="hover:bg-muted/30 transition-colors">
                                                <td className="py-4 px-6 whitespace-nowrap text-muted-foreground font-medium">
                                                    {new Date(payout.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="py-4 px-6 whitespace-nowrap font-black text-foreground">
                                                    {formatMoney(payout.amount)}
                                                </td>
                                                <td className="py-4 px-6 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <CreditCard className="w-4 h-4 text-muted-foreground" />
                                                        <span className="font-mono text-xs">{payout.card_number.slice(0, 4)} **** **** {payout.card_number.slice(-4)}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 whitespace-nowrap">
                                                    {getStatusBadge(payout.status)}
                                                </td>
                                                <td className="py-4 px-6 text-right">
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                        <ChevronRight className="w-4 h-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                        {payouts.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="py-12 text-center text-muted-foreground italic">
                                                    Hozircha yechib olish so'rovlari yo'q
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="info" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="border-blue-100 bg-blue-50/10">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2 text-blue-600">
                                    <Clock className="w-5 h-5" /> 7 kunlik kutilma
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm text-muted-foreground leading-relaxed">
                                Har bir kurs sotuvidan kelgan foyda xavfsizlik va qaytarib berish siyosati sababli 7 kun davomida kutilayotgan balansda ushlab turiladi. Shundan so'ng u asosiy balansga o'tadi.
                            </CardContent>
                        </Card>

                        <Card className="border-orange-100 bg-orange-50/10">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2 text-orange-600">
                                    <AlertCircle className="w-5 h-5" /> Komissiya
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm text-muted-foreground leading-relaxed">
                                Platforma kurs narxidan kelishilgan foizni (default 30%) o'ziga oladi. Siz ko'rayotgan balanslar barcha komissiyalar chegirilgandan keyingi sof foydangizdir.
                            </CardContent>
                        </Card>

                        <Card className="border-green-100 bg-green-50/10">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2 text-green-600">
                                    <CheckCircle2 className="w-5 h-5" /> To'lov muddati
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm text-muted-foreground leading-relaxed">
                                Pul yechish so'rovlari 24-48 soat ichida ishchi kunlarida ko'rib chiqiladi. Tasdiqlangandan so'ng mablag'lar kartangizga o'tkaziladi.
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Withdraw Dialog */}
            <Dialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen}>
                <DialogContent className="sm:max-w-[425px] rounded-3xl border-border shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black font-cinzel">Pul yechish</DialogTitle>
                        <DialogDescription className="font-medium">
                            Karta ma'lumotlarini kiriting. Minimal miqdor 100,000 so'm.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <label className="text-sm font-bold opacity-70">Miqdor (AC)</label>
                                <span className="text-xs font-black text-primary">Mavjud: {formatMoney(wallet?.balance || 0)}</span>
                            </div>
                            <div className="relative">
                                <Input
                                    type="number"
                                    value={withdrawData.amount}
                                    onChange={(e) => setWithdrawData({ ...withdrawData, amount: parseInt(e.target.value) })}
                                    className="h-12 pl-4 pr-12 text-lg font-black border-2 focus-visible:ring-primary rounded-xl"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">AC</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold opacity-70">Karta raqami</label>
                            <Input
                                placeholder="8600 **** **** ****"
                                value={withdrawData.card_number}
                                onChange={(e) => setWithdrawData({ ...withdrawData, card_number: e.target.value.replace(/\D/g, '').slice(0, 16) })}
                                className="h-12 font-mono tracking-widest border-2 rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold opacity-70">Karta egasi (Ism sharif)</label>
                            <Input
                                placeholder="ISM SHARIF"
                                value={withdrawData.card_holder}
                                onChange={(e) => setWithdrawData({ ...withdrawData, card_holder: e.target.value.toUpperCase() })}
                                className="h-12 font-bold uppercase border-2 rounded-xl"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="ghost"
                            onClick={() => setWithdrawDialogOpen(false)}
                            className="font-bold h-12 rounded-xl"
                        >
                            Bekor qilish
                        </Button>
                        <Button
                            onClick={handleWithdraw}
                            disabled={submitting || withdrawData.amount < 100000 || withdrawData.amount > (wallet?.balance || 0)}
                            className="bg-primary hover:bg-primary-light h-12 px-8 rounded-xl font-black shadow-gold"
                        >
                            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "So'rov yuborish"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default TeacherWalletPage;
