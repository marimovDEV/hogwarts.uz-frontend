import { useEffect, useState } from "react";
import { Trophy, Search, Filter, CheckCircle2, Truck, MapPin, Eye, MoreHorizontal, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import axios from "axios";
import { API_URL, getAuthHeader } from "@/services/api";
import { useTranslation } from "react-i18next";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

const TeacherPrizeManagement = () => {
    const { t } = useTranslation();
    const [prizes, setPrizes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [selectedPrize, setSelectedPrize] = useState<any>(null);

    useEffect(() => {
        fetchPrizes();
    }, [statusFilter]);

    const fetchPrizes = async () => {
        setLoading(true);
        try {
            let url = `${API_URL}/winner-prizes/`;
            if (statusFilter !== "ALL") {
                url += `?status=${statusFilter}`;
            }
            const res = await axios.get(url, { headers: getAuthHeader() });
            setPrizes(res.data.results || []);
        } catch (error) {
            console.error(error);
            toast.error(t('common.error'));
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: number, status: string) => {
        try {
            await axios.post(`${API_URL}/winner-prizes/${id}/update_status/`, { status }, { headers: getAuthHeader() });
            toast.success(t('teacher.prizes.statusUpdated'));
            fetchPrizes();
        } catch (error) {
            console.error(error);
            toast.error(t('common.error'));
        }
    };

    const filteredPrizes = prizes.filter(p =>
        p.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.olympiad_title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED': return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'SHIPPED': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'ADDRESS_RECEIVED': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
            case 'CONTACTED': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
            default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black font-cinzel tracking-tight">{t('teacher.prizes.title')}</h1>
                    <p className="text-muted-foreground">{t('teacher.olympiadResultsSubtitle')}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative md:col-span-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder={t('teacher.dashboard.recentActivityDesc')}
                        className="pl-10 h-12 bg-card border-border rounded-xl"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <Button
                        variant={statusFilter === 'ALL' ? 'default' : 'outline'}
                        onClick={() => setStatusFilter('ALL')}
                        className="flex-1 rounded-xl h-12 font-bold"
                    >
                        {t('common.all')}
                    </Button>
                    <Button
                        variant={statusFilter === 'ADDRESS_RECEIVED' ? 'default' : 'outline'}
                        onClick={() => setStatusFilter('ADDRESS_RECEIVED')}
                        className="flex-1 rounded-xl h-12 font-bold"
                    >
                        {t('teacher.prizes.address_received')}
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center p-20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredPrizes.length > 0 ? (
                        filteredPrizes.map((prize) => (
                            <Card key={prize.id} className="border-border hover:shadow-md transition-all overflow-hidden">
                                <CardContent className="p-0">
                                    <div className="flex flex-col md:flex-row md:items-center p-6 gap-6">
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-lg font-black tracking-tight">{prize.student_name}</h3>
                                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md border ${getStatusColor(prize.status)}`}>
                                                    {t(`teacher.prizes.${prize.status.toLowerCase()}`)}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                                                <Trophy className="w-3 h-3 text-primary" /> {prize.olympiad_title} • {prize.position}-o'rin
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-3">
                                            {prize.address && (
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button variant="outline" size="sm" className="rounded-lg gap-2 font-bold">
                                                            <MapPin className="w-4 h-4" /> {t('teacher.prizes.viewAddress')}
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="sm:max-w-[425px] bg-card border-border">
                                                        <DialogHeader>
                                                            <DialogTitle className="font-cinzel font-black">Manzil ma'lumotlari</DialogTitle>
                                                            <DialogDescription>
                                                                {prize.student_name} tomonidan yuborilgan manzil
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <div className="space-y-4 py-4">
                                                            {prize.address.address_text && (
                                                                <div className="p-4 rounded-xl bg-muted/50 border border-border">
                                                                    <p className="text-sm font-medium">{prize.address.address_text}</p>
                                                                </div>
                                                            )}
                                                            {prize.address.latitude && (
                                                                <Button
                                                                    className="w-full gap-2 rounded-xl"
                                                                    onClick={() => window.open(`https://www.google.com/maps?q=${prize.address.latitude},${prize.address.longitude}`, '_blank')}
                                                                >
                                                                    <MapPin className="w-4 h-4" /> Google Maps da ko'rish
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                            )}

                                            {prize.status === 'ADDRESS_RECEIVED' && (
                                                <Button
                                                    size="sm"
                                                    className="bg-primary text-primary-foreground hover:bg-primary-light rounded-lg gap-2 font-bold shadow-gold"
                                                    onClick={() => updateStatus(prize.id, 'SHIPPED')}
                                                >
                                                    <Truck className="w-4 h-4" /> {t('teacher.prizes.markShipped')}
                                                </Button>
                                            )}

                                            {prize.status === 'SHIPPED' && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="border-green-500 text-green-500 hover:bg-green-500/10 rounded-lg gap-2 font-bold"
                                                    onClick={() => updateStatus(prize.id, 'COMPLETED')}
                                                >
                                                    <CheckCircle2 className="w-4 h-4" /> {t('teacher.prizes.completed')}
                                                </Button>
                                            )}

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="bg-card border-border">
                                                    <DropdownMenuItem onClick={() => updateStatus(prize.id, 'PENDING')}>
                                                        Mark as Pending
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => updateStatus(prize.id, 'CONTACTED')}>
                                                        Mark as Contacted
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="text-center py-20 bg-card rounded-2xl border border-dashed border-border">
                            <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                            <h3 className="text-xl font-bold">{t('teacher.prizes.noPrizes')}</h3>
                            <p className="text-muted-foreground">{t('teacher.dashboard.noActivity')}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default TeacherPrizeManagement;
