
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Search, MoreHorizontal, Eye, RefreshCcw, Trash2, BookOpen, Trophy, DollarSign, AlertCircle, Download, Smartphone } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { API_URL, getAuthHeader } from "@/services/api";
import { toast } from "sonner";

interface Transaction {
    id: number;
    amount: string;
    description: string;
    payment_method: "CLICK" | "PAYME" | "UZUM" | "CARD" | "QR" | "USERBOT";
    status: "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED";
    created_at: string;
    user: any;
    payment_id: string;
    type?: "Course" | "Olympiad";
}

export default function FinanceTransactions() {
    const { t } = useTranslation();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");

    // Refund State
    const [refundId, setRefundId] = useState<number | null>(null);
    const [refundReason, setRefundReason] = useState("");

    // Details State
    const [selectedTrx, setSelectedTrx] = useState<Transaction | null>(null);

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/payments/`, { headers: getAuthHeader() });
            const data = res.data.results || res.data;
            if (Array.isArray(data)) {
                setTransactions(data);
            } else {
                setTransactions([]);
            }
        } catch (error) {
            console.error(error);
            setTransactions([]);
            // toast.error("To'lovlarni yuklashda xatolik");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm(t('global.confirmDelete', { defaultValue: "Ishonchingiz komilmi?" }))) return;
        try {
            await axios.delete(`${API_URL}/payments/${id}/`, { headers: getAuthHeader() });
            setTransactions(prev => prev.filter(t => t.id !== id));
            toast.success(t('admin.transactionDeleted'));
        } catch (error) {
            toast.error(t('common.error'));
        }
    };

    const handleRefund = async () => {
        if (!refundId) return;
        try {
            // Simulated Refund
            toast.success(t('admin.refundSimulated') + ` (ID: ${refundId})`);
            setTransactions(prev => prev.map(t => t.id === refundId ? { ...t, status: "CANCELLED" } : t));
        } catch (err) {
            toast.error(t('common.error'));
        }
        setRefundId(null);
        setRefundReason("");
    };

    const handleApprove = async (id: number) => {
        try {
            await axios.post(`${API_URL}/payments/${id}/confirm/`, {}, { headers: getAuthHeader() });
            setTransactions(prev => prev.map(t => t.id === id ? { ...t, status: "COMPLETED" } : t));
            toast.success(t('common.successMessage'));
        } catch (error) {
            toast.error(t('common.errorOccurred'));
        }
    };

    const filteredTransactions = transactions.filter(trx => {
        const matchesSearch = (trx.payment_id?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
            (trx.description?.toLowerCase() || "").includes(searchQuery.toLowerCase());

        const type = trx.description?.toLowerCase().includes('olimpiada') ? 'Olympiad' : 'Course';
        const matchesType = typeFilter === "all" || type === typeFilter;
        const matchesStatus = statusFilter === "all" || trx.status === statusFilter;

        return matchesSearch && matchesType && matchesStatus;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'COMPLETED': return <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200">{t('common.success')}</Badge>;
            case 'FAILED': return <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-200 border-red-200">{t('common.failed')}</Badge>;
            case 'CANCELLED': return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">{t('admin.refunded')}</Badge>;
            case 'PENDING': return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">{t('common.pending', { defaultValue: "Kutilmoqda" })}</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    const formatMoney = (amount: string | number) => {
        return Number(amount).toLocaleString() + " " + t('olympiadsSection.currency', { defaultValue: "UZS" });
    };

    return (
        <div className="space-y-4 animate-in fade-in duration-500">
            {/* FILTERS & SEARCH */}
            <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder={t('admin.searchFinancePlaceholder', { defaultValue: "ID yoki izoh bo'yicha qidirish..." })}
                        className="pl-9 bg-muted/30 border-border"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex w-full md:w-auto gap-3 flex-wrap">
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-[140px] bg-card">
                            <SelectValue placeholder={t('common.type')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('common.all')}</SelectItem>
                            <SelectItem value="Course">{t('admin.courses.title')}</SelectItem>
                            <SelectItem value="Olympiad">{t('admin.olympiads.title')}</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[140px] bg-card">
                            <SelectValue placeholder="Holat" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Holat: Barchasi</SelectItem>
                            <SelectItem value="COMPLETED">Muvaffaqiyatli</SelectItem>
                            <SelectItem value="FAILED">Xatolik</SelectItem>
                            <SelectItem value="CANCELLED">Qaytarilgan</SelectItem>
                            <SelectItem value="PENDING">Kutilmoqda</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button variant="outline" size="icon" onClick={fetchTransactions} className="rounded-xl">
                        <RefreshCcw className={`w-4 h-4 text-muted-foreground ${loading ? 'animate-spin' : ''}`} />
                    </Button>

                    <Button variant="outline" className="text-green-600 border-green-200 hover:bg-green-50">
                        <Download className="w-4 h-4 mr-2" />
                        Eksport
                    </Button>
                </div>
            </div>

            {/* TRANSACTIONS TABLE */}
            <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="w-[100px]">{t('admin.id')}</TableHead>
                                <TableHead>{t('admin.user')}</TableHead>
                                <TableHead>{t('admin.description')}</TableHead>
                                <TableHead>{t('admin.sumMethod')}</TableHead>
                                <TableHead>{t('admin.date')}</TableHead>
                                <TableHead>{t('admin.status')}</TableHead>
                                <TableHead className="text-right">{t('admin.actions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-12">
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                                    </TableCell>
                                </TableRow>
                            ) : filteredTransactions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                                        {t('admin.noTransactions')}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredTransactions.map((trx) => (
                                    <TableRow key={trx.id} className="hover:bg-muted/50 transition-colors">
                                        <TableCell className="font-mono text-xs text-muted-foreground">{trx.payment_id || trx.id}</TableCell>
                                        <TableCell>
                                            <div className="font-bold text-foreground text-sm">{trx.user?.full_name || trx.user?.username || `User #${trx.user}`}</div>
                                            <div className="text-xs text-muted-foreground">{trx.user?.phone}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {trx.description?.toLowerCase().includes('kurs') ? (
                                                    <BookOpen className="w-4 h-4 text-blue-500" />
                                                ) : (
                                                    <Trophy className="w-4 h-4 text-purple-500" />
                                                )}
                                                <span className="text-sm text-foreground/80 line-clamp-1 max-w-[200px]" title={trx.description}>{trx.description}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium text-foreground">{formatMoney(trx.amount)}</div>
                                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                {trx.payment_method === 'USERBOT' && <Smartphone className="w-3 h-3" />}
                                                {trx.payment_method}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                                            {new Date(trx.created_at).toLocaleString('ru-RU', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                        </TableCell>
                                        <TableCell>
                                            {getStatusBadge(trx.status)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>{t('admin.actions')}</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="cursor-pointer" onClick={() => setSelectedTrx(trx)}>
                                                        <Eye className="w-4 h-4 mr-2" /> {t('admin.details')}
                                                    </DropdownMenuItem>
                                                    {trx.status === 'PENDING' && (
                                                        <DropdownMenuItem
                                                            className="cursor-pointer text-green-600 focus:text-green-700 focus:bg-green-50"
                                                            onClick={() => handleApprove(trx.id)}
                                                        >
                                                            <RefreshCcw className="w-4 h-4 mr-2" /> Tasdiqlash
                                                        </DropdownMenuItem>
                                                    )}
                                                    {trx.status === 'COMPLETED' && (
                                                        <DropdownMenuItem
                                                            className="cursor-pointer text-yellow-600 focus:text-yellow-700 focus:bg-yellow-50"
                                                            onClick={() => setRefundId(trx.id)}
                                                        >
                                                            <RefreshCcw className="w-4 h-4 mr-2" /> {t('admin.refund')}
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50"
                                                        onClick={() => handleDelete(trx.id)}
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-2" /> {t('admin.delete')}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Details Dialog */}
            <Dialog open={!!selectedTrx} onOpenChange={(open) => !open && setSelectedTrx(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{t('admin.details')}</DialogTitle>
                        <DialogDescription>
                            To'lov ma'lumotlari: {selectedTrx?.payment_id || selectedTrx?.id}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedTrx && (
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="text-muted-foreground">{t('admin.id')}:</div>
                                <div className="font-mono">{selectedTrx.payment_id || selectedTrx.id}</div>

                                <div className="text-muted-foreground">{t('admin.user')}:</div>
                                <div>{selectedTrx.user?.full_name || selectedTrx.user?.username || `User #${selectedTrx.user}`} ({selectedTrx.user?.phone})</div>

                                <div className="text-muted-foreground">{t('admin.sumMethod')}:</div>
                                <div>{formatMoney(selectedTrx.amount)} ({selectedTrx.payment_method})</div>

                                <div className="text-muted-foreground">{t('admin.description')}:</div>
                                <div>{selectedTrx.description}</div>

                                <div className="text-muted-foreground">{t('admin.date')}:</div>
                                <div>{new Date(selectedTrx.created_at).toLocaleString('ru-RU')}</div>

                                <div className="text-muted-foreground">{t('admin.status')}:</div>
                                <div>{getStatusBadge(selectedTrx.status)}</div>
                            </div>

                            {(selectedTrx as any).receipt_image && (
                                <div className="mt-4 border border-border rounded-lg overflow-hidden">
                                    <div className="bg-muted px-3 py-2 text-xs font-semibold">To'lov cheki (kvitansiya)</div>
                                    <img
                                        src={(selectedTrx as any).receipt_image}
                                        alt="To'lov cheki"
                                        className="w-full max-h-[300px] object-contain bg-black/5"
                                        controls={false}
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://placehold.co/400x300?text=Rasm+topilmadi';
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedTrx(null)}>{t('common.close')}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Refund Dialog */}
            <Dialog open={!!refundId} onOpenChange={(open) => !open && setRefundId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-yellow-600">
                            <AlertCircle className="w-5 h-5" />
                            {t('admin.refundMoney')}
                        </DialogTitle>
                        <DialogDescription>
                            {t('admin.refundConfirmation', { id: refundId })}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <label className="text-sm font-medium mb-2 block">{t('admin.refundReason')}</label>
                        <Textarea
                            placeholder={t('admin.refundReasonPlaceholder')}
                            value={refundReason}
                            onChange={(e) => setRefundReason(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRefundId(null)}>{t('common.cancel')}</Button>
                        <Button variant="default" className="bg-yellow-600 hover:bg-yellow-700 text-white" onClick={handleRefund} disabled={!refundReason}>
                            {t('admin.confirmRefund')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
