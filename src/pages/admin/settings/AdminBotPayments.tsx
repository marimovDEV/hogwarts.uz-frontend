import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Check, X, Eye, Loader2, RefreshCcw, Download, Search,
    ArrowUpDown, Filter, MoreHorizontal, AlertCircle, CheckCircle, XCircle, Image as ImageIcon
} from "lucide-react";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import api, { API_URL, getAuthHeader } from "@/services/api";
import { toast } from "sonner";
import { format } from "date-fns";
import FinanceTrendChart from "@/components/admin/bi/FinanceTrendChart";
import TopItemsChart from "@/components/admin/bi/TopItemsChart";
import { useTranslation } from "react-i18next";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function AdminBotPayments() {
    const { t } = useTranslation();
    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalcount, setTotalCount] = useState(0);

    // Filters
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");

    // Action States
    const [selectedPayment, setSelectedPayment] = useState<any>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchPayments();
        }, 500);
        return () => clearTimeout(timer);
    }, [page, search, statusFilter, typeFilter]);

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const params: any = {
                page,
                ordering: '-created_at',
                search: search || undefined
            };

            if (statusFilter !== 'all') params.status = statusFilter;
            if (typeFilter !== 'all') params.type = typeFilter;

            const res = await api.get('/payments/', { params });
            setPayments(res.data.results);
            setTotalCount(res.data.count);
        } catch (error) {
            console.error("Error fetching payments", error);
            toast.error(t('common.error'));
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id: number, action: 'confirm' | 'reject' | 'refund') => {
        if (!confirm(t('common.confirmDelete'))) return; // Simple confirm, usually use Dialog

        setActionLoading(true);
        try {
            await api.post(`/payments/${id}/${action}/`);
            toast.success(t('global.updated'));
            fetchPayments();
            setIsDetailOpen(false);
        } catch (error) {
            toast.error(t('common.error'));
        } finally {
            setActionLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            // Build query string matched with current filters
            const params = new URLSearchParams();
            if (statusFilter !== 'all') params.append('status', statusFilter);
            if (typeFilter !== 'all') params.type = typeFilter;
            if (search) params.append('search', search);

            // Direct open to trigger download
            // Note: Use full URL from env or derived
            const downloadUrl = `${api.defaults.baseURL}/payments/export/?${params.toString()}`;
            window.open(downloadUrl, '_blank');
        } catch (error) {
            toast.error("Eksport xatolik yuz berdi");
        }
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500",
            COMPLETED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500",
            FAILED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500",
            REFUNDED: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400",
        };
        return <Badge className={`${styles[status] || styles.PENDING} border-0`}>{status}</Badge>;
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">{t('admin.finance')}</h2>
                    <p className="text-muted-foreground">To'lovlar monitoringi va boshqaruv.</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={handleExport} variant="outline">
                        <Download className="w-4 h-4 mr-2" /> Eksport
                    </Button>
                    <Button onClick={() => fetchPayments()} variant="default">
                        <RefreshCcw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Yangilash
                    </Button>
                </div>
            </div>

            {/* DASHBOARD CHARTS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[300px]">
                <FinanceTrendChart />
                <TopItemsChart />
            </div>

            {/* FILTERS */}
            <Card className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="ID, User, Telefon..."
                            className="pl-8"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Holat" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Barcha Statuslar</SelectItem>
                            <SelectItem value="COMPLETED">Bajarilgan</SelectItem>
                            <SelectItem value="PENDING">Kutilmoqda</SelectItem>
                            <SelectItem value="FAILED">Bekor qilingan</SelectItem>
                            <SelectItem value="REFUNDED">Qaytarilgan</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Turi" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Barcha Turlar</SelectItem>
                            <SelectItem value="COURSE">Kurs</SelectItem>
                            <SelectItem value="OLYMPIAD">Olimpiada</SelectItem>
                            <SelectItem value="TOPUP">Balans</SelectItem>
                            <SelectItem value="USERBOT">Bot To'lovi</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </Card>

            {/* TABLE */}
            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">ID</TableHead>
                            <TableHead>Foydalanuvchi</TableHead>
                            <TableHead>Mahsulot</TableHead>
                            <TableHead>Summa</TableHead>
                            <TableHead>Usul</TableHead>
                            <TableHead>Sana</TableHead>
                            <TableHead>Holat</TableHead>
                            <TableHead className="text-right">Amallar</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading && payments.length === 0 ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell colSpan={8} className="h-16 text-center">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : payments.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                                    Ma'lumot topilmadi
                                </TableCell>
                            </TableRow>
                        ) : (
                            payments.map((payment) => (
                                <TableRow key={payment.id}>
                                    <TableCell className="font-medium">#{payment.id}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={payment.user.avatar} />
                                                <AvatarFallback>{payment.user.first_name?.[0] || 'U'}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium">{payment.user.first_name} {payment.user.last_name}</span>
                                                <span className="text-xs text-muted-foreground">{payment.user.phone}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <Badge variant="outline" className="w-fit mb-1 text-[10px]">{payment.type}</Badge>
                                            <span className="text-xs text-muted-foreground max-w-[150px] truncate" title={payment.reference_id}>
                                                #{payment.reference_id}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-bold">
                                        {Number(payment.amount).toLocaleString()} UZS
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {payment.method === 'PAYME' && <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">Payme</Badge>}
                                            {payment.method === 'CLICK' && <Badge variant="secondary" className="bg-cyan-100 text-cyan-800 hover:bg-cyan-200">Click</Badge>}
                                            {(payment.method === 'BOT' || payment.method === 'USERBOT') && <Badge variant="secondary" className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200">Bot</Badge>}
                                            {payment.receipt_image && <ImageIcon className="w-4 h-4 text-muted-foreground" />}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground">
                                        {format(new Date(payment.created_at), 'dd MMM, HH:mm')}
                                    </TableCell>
                                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Amallar</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => { setSelectedPayment(payment); setIsDetailOpen(true); }}>
                                                    <Eye className="mr-2 h-4 w-4" /> Batafsil
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                {payment.status === 'PENDING' && (
                                                    <>
                                                        <DropdownMenuItem onClick={() => handleAction(payment.id, 'confirm')} className="text-green-600">
                                                            <CheckCircle className="mr-2 h-4 w-4" /> Tasdiqlash
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleAction(payment.id, 'reject')} className="text-red-600">
                                                            <XCircle className="mr-2 h-4 w-4" /> Rad etish
                                                        </DropdownMenuItem>
                                                    </>
                                                )}
                                                {payment.status === 'COMPLETED' && (
                                                    <DropdownMenuItem onClick={() => handleAction(payment.id, 'refund')} className="text-orange-600">
                                                        <RefreshCcw className="mr-2 h-4 w-4" /> Qaytarish
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>

                {/* PAGINATION */}
                <div className="flex items-center justify-end space-x-2 p-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1 || loading}
                    >
                        Oldingi
                    </Button>
                    <div className="text-sm text-muted-foreground">
                        Sahifa {page}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => p + 1)}
                        disabled={payments.length < 10 || loading} // Assuming default page size 10
                    >
                        Keyingi
                    </Button>
                </div>
            </div>

            {/* DETAIL DIALOG */}
            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>To'lov #{selectedPayment?.id}</DialogTitle>
                        <DialogDescription>Batafsil ma'lumotlar</DialogDescription>
                    </DialogHeader>
                    {selectedPayment && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-muted-foreground">Foydalanuvchi</p>
                                    <p className="font-medium">{selectedPayment.user.first_name} {selectedPayment.user.last_name}</p>
                                    <p className="text-xs">{selectedPayment.user.phone}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Summa</p>
                                    <p className="font-medium text-lg">{Number(selectedPayment.amount).toLocaleString()} UZS</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Turi</p>
                                    <Badge variant="secondary">{selectedPayment.type}</Badge>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Usul</p>
                                    <p className="font-medium">{selectedPayment.method}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Tranzaksiya ID</p>
                                    <code className="text-xs bg-muted p-1 rounded">{selectedPayment.transaction_id || '-'}</code>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Sana</p>
                                    <p>{format(new Date(selectedPayment.created_at), 'dd MMM yyyy, HH:mm')}</p>
                                </div>
                            </div>

                            {selectedPayment.receipt_image && (
                                <div>
                                    <p className="text-muted-foreground mb-2">To'lov Cheki</p>
                                    <div className="relative aspect-video rounded-lg overflow-hidden border">
                                        <img
                                            src={selectedPayment.receipt_image}
                                            alt="Chek"
                                            className="object-cover w-full h-full"
                                        />
                                    </div>
                                    <Button variant="link" size="sm" className="px-0" onClick={() => window.open(selectedPayment.receipt_image, '_blank')}>
                                        <Eye className="w-3 h-3 mr-2" /> To'liq ochish
                                    </Button>
                                </div>
                            )}

                            <DialogFooter className="gap-2 sm:gap-0">
                                {selectedPayment.status === 'PENDING' && (
                                    <>
                                        <Button variant="destructive" onClick={() => handleAction(selectedPayment.id, 'reject')} disabled={actionLoading}>
                                            Rad etish
                                        </Button>
                                        <Button onClick={() => handleAction(selectedPayment.id, 'confirm')} disabled={actionLoading}>
                                            Tasdiqlash
                                        </Button>
                                    </>
                                )}
                                {selectedPayment.status === 'COMPLETED' && (
                                    <Button variant="secondary" onClick={() => handleAction(selectedPayment.id, 'refund')} disabled={actionLoading} className="text-red-600 hover:text-red-700">
                                        <RefreshCcw className="w-4 h-4 mr-2" /> Qaytarish
                                    </Button>
                                )}
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
