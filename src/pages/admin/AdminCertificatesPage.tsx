import { useState, useEffect, useCallback } from "react";
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Search,
    Award,
    Download,
    CheckCircle,
    XCircle,
    QrCode,
    Clock,
    Filter,
    RefreshCw,
    Eye,
    Loader2,
    GraduationCap,
    Trophy,
    AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { API_URL, getAuthHeader, getImageUrl } from "@/services/api";

interface Certificate {
    id: number;
    cert_number: string;
    cert_type: string;
    type_display: string;
    user: {
        id: number;
        username: string;
        first_name: string;
        last_name: string;
        email: string;
    };
    title: string;
    course_title?: string;
    olympiad_title?: string;
    grade: string;
    score: number;
    status: "PENDING" | "VERIFIED" | "REJECTED";
    status_display: string;
    issued_at: string;
    verified_at?: string;
    verified_by_name?: string;
    rejection_reason?: string;
    qr_code?: string;
    pdf_file?: string;
    source?: {
        type: string;
        title: string;
        id: number;
    };
}

interface VerifyCertificate {
    user_name: string;
    source: string;
    grade: string;
    issued_at: string;
}

interface VerifyResult {
    success: boolean;
    error?: string;
    certificate?: VerifyCertificate;
}

interface UserOption {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
}

interface CourseOption {
    id: number;
    title: string;
}

interface OlympiadOption {
    id: number;
    title: string;
}

type PaginatedResponse<T> = { count?: number; results?: T[] } | T[];

const unwrapList = <T,>(data: PaginatedResponse<T>): T[] => {
    if (Array.isArray(data)) return data;
    return data.results || [];
};

const getCertificateErrorMessage = (error: unknown, fallback: string) => {
    if (axios.isAxiosError(error)) {
        const data = error.response?.data;
        if (typeof data === "object" && data !== null) {
            const record = data as Record<string, unknown>;
            if (typeof record.error === "string") return record.error;
            if (typeof record.detail === "string") return record.detail;

            const firstField = Object.values(record).find((value) => Array.isArray(value) || typeof value === "string");
            if (Array.isArray(firstField) && firstField.length > 0) return String(firstField[0]);
            if (typeof firstField === "string") return firstField;
        }
    }
    return fallback;
};

const AdminCertificatesPage = () => {
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // Filters
    const [statusFilter, setStatusFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");

    // Selection
    const [selectedCertIds, setSelectedCertIds] = useState<number[]>([]);

    // Reject Dialog
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [rejectingCert, setRejectingCert] = useState<Certificate | null>(null);
    const [rejectReason, setRejectReason] = useState("");

    // Preview Dialog
    const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
    const [previewCert, setPreviewCert] = useState<Certificate | null>(null);

    // Quick Verify Dialog
    const [quickVerifyOpen, setQuickVerifyOpen] = useState(false);
    const [verifyNumber, setVerifyNumber] = useState("");
    const [verifyResult, setVerifyResult] = useState<VerifyResult | null>(null);

    // Create Certificate Dialog
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [users, setUsers] = useState<UserOption[]>([]);
    const [courses, setCourses] = useState<CourseOption[]>([]);
    const [olympiads, setOlympiads] = useState<OlympiadOption[]>([]);
    const [newCert, setNewCert] = useState({
        user_id: "",
        cert_type: "COURSE",
        course_id: "",
        olympiad_id: "",
        grade: "",
        score: 0
    });

    const [actionLoading, setActionLoading] = useState(false);
    const { t } = useTranslation();

    // Stats
    const [stats, setStats] = useState({ total: 0, thisMonth: 0, pending: 0 });

    const fetchCertificates = useCallback(async () => {
        setLoading(true);
        try {
            let url = `${API_URL}/certificates/?`;
            if (statusFilter !== "all") url += `status=${statusFilter}&`;
            if (typeFilter !== "all") url += `type=${typeFilter}&`;

            const res = await axios.get<PaginatedResponse<Certificate>>(url, { headers: getAuthHeader() });
            const data = unwrapList(res.data);
            setCertificates(data);

            // Calculate stats
            setStats({
                total: Array.isArray(res.data) ? data.length : (res.data.count || data.length),
                thisMonth: data.filter((c: Certificate) => {
                    const issued = new Date(c.issued_at);
                    const now = new Date();
                    return issued.getMonth() === now.getMonth() && issued.getFullYear() === now.getFullYear();
                }).length,
                pending: data.filter((c: Certificate) => c.status === 'PENDING').length
            });
        } catch (error) {
            console.error(error);
            toast.error(t('admin.loadError'));
        } finally {
            setLoading(false);
        }
    }, [statusFilter, t, typeFilter]);

    useEffect(() => {
        void fetchCertificates();
    }, [fetchCertificates]);

    // Filter client-side for search
    const filteredCerts = certificates.filter(cert => {
        const firstName = cert.user?.first_name || "";
        const lastName = cert.user?.last_name || "";
        const email = cert.user?.email || "";
        const certNumber = cert.cert_number || "";

        const userName = `${firstName} ${lastName}`.toLowerCase();
        const matchesSearch = userName.includes(searchQuery.toLowerCase()) ||
            certNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            email.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    // HANDLERS
    const handleVerify = async (cert: Certificate) => {
        setActionLoading(true);
        try {
            await axios.post(`${API_URL}/certificates/${cert.id}/approve/`, {}, { headers: getAuthHeader() });
            toast.success(t('admin.certificateVerified', { number: cert.cert_number }));
            fetchCertificates();
        } catch (error) {
            toast.error(t('admin.certificates.verifyError'));
        } finally {
            setActionLoading(false);
        }
    };

    const openRejectDialog = (cert: Certificate) => {
        setRejectingCert(cert);
        setRejectReason("");
        setRejectDialogOpen(true);
    };

    const handleReject = async () => {
        if (!rejectingCert) return;
        if (rejectReason.length < 10) {
            toast.error(t('admin.rejectReasonMinLength'));
            return;
        }

        setActionLoading(true);
        try {
            await axios.post(`${API_URL}/certificates/${rejectingCert.id}/reject/`,
                { reason: rejectReason },
                { headers: getAuthHeader() }
            );
            toast.success(t('admin.certificateRejected', { number: rejectingCert.cert_number }));
            setRejectDialogOpen(false);
            fetchCertificates();
        } catch (error: unknown) {
            toast.error(getCertificateErrorMessage(error, t('admin.certificates.rejectError')));
        } finally {
            setActionLoading(false);
        }
    };

    const handleBatchApprove = async () => {
        if (selectedCertIds.length === 0) return;
        setActionLoading(true);
        try {
            await axios.post(`${API_URL}/certificates/batch_approve/`,
                { ids: selectedCertIds },
                { headers: getAuthHeader() }
            );
            toast.success(t('admin.batchVerified', { count: selectedCertIds.length }));
            setSelectedCertIds([]);
            fetchCertificates();
        } catch (error) {
            toast.error(t('admin.certificates.batchVerifyError'));
        } finally {
            setActionLoading(false);
        }
    };

    const handleDownloadPDF = async (cert: Certificate) => {
        if (cert.status !== 'VERIFIED') {
            toast.error(t('admin.downloadVerifiedOnly'));
            return;
        }

        try {
            toast.loading(t('admin.certificates.pdfPreparing'), { id: 'pdf-loading' });
            const res = await axios.get(`${API_URL}/certificates/${cert.id}/download/`, { headers: getAuthHeader() });
            toast.dismiss('pdf-loading');

            if (res.data.success && res.data.pdf_url) {
                window.open(res.data.pdf_url, '_blank');
                toast.success(t('admin.certificates.pdfReady'));
            } else {
                toast.error(t('admin.certificates.pdfNotFound'));
            }
        } catch (error: unknown) {
            toast.dismiss('pdf-loading');
            toast.error(getCertificateErrorMessage(error, t('admin.certificates.pdfLoadError')));
        }
    };

    const toggleSelect = (id: number) => {
        if (selectedCertIds.includes(id)) {
            setSelectedCertIds(selectedCertIds.filter(cid => cid !== id));
        } else {
            setSelectedCertIds([...selectedCertIds, id]);
        }
    };

    const handleView = (cert: Certificate) => {
        setPreviewCert(cert);
        setPreviewDialogOpen(true);
    };

    const handleQuickVerify = async () => {
        if (!verifyNumber) {
            toast.error(t('admin.enterCertNumber'));
            return;
        }
        setActionLoading(true);
        try {
            const res = await axios.get(`${API_URL}/certificates/verify/?number=${verifyNumber.toUpperCase()}`);
            setVerifyResult(res.data);
        } catch (error: unknown) {
            setVerifyResult({
                success: false,
                error: getCertificateErrorMessage(error, t('admin.certificates.certNotFoundOrError'))
            });
        } finally {
            setActionLoading(false);
        }
    };

    const prepareCreateDialog = async () => {
        setCreateDialogOpen(true);
        try {
            const headers = getAuthHeader();
            const [usersRes, coursesRes, olympiadsRes] = await Promise.all([
                axios.get<PaginatedResponse<UserOption>>(`${API_URL}/users/?limit=100`, { headers }),
                axios.get<PaginatedResponse<CourseOption>>(`${API_URL}/courses/?limit=100`, { headers }),
                axios.get<PaginatedResponse<OlympiadOption>>(`${API_URL}/olympiads/?limit=100`, { headers })
            ]);
            setUsers(unwrapList(usersRes.data));
            setCourses(unwrapList(coursesRes.data));
            setOlympiads(unwrapList(olympiadsRes.data));
        } catch (error) {
            console.error("Data fetch error:", error);
            toast.error(t('admin.certificates.loadError') || t('admin.loadError'));
        }
    };

    const handleCreateCertificate = async () => {
        if (!newCert.user_id || !newCert.cert_type || !newCert.grade) {
            toast.error(t('common.fillRequiredFields'));
            return;
        }

        setActionLoading(true);
        try {
            const payload = {
                user_id: parseInt(newCert.user_id),
                cert_type: newCert.cert_type,
                grade: newCert.grade,
                score: newCert.score,
                course_id: newCert.cert_type === 'COURSE' ? parseInt(newCert.course_id) : null,
                olympiad_id: (newCert.cert_type === 'OLYMPIAD' || newCert.cert_type === 'DIPLOMA') ? parseInt(newCert.olympiad_id) : null,
                status: 'VERIFIED' // Manual issuance usually implies verified
            };
            await axios.post(`${API_URL}/certificates/`, payload, { headers: getAuthHeader() });
            toast.success(t('admin.certificates.certCreatedSuccess'));
            setCreateDialogOpen(false);
            fetchCertificates();
            // Reset form
            setNewCert({
                user_id: "",
                cert_type: "COURSE",
                course_id: "",
                olympiad_id: "",
                grade: "",
                score: 0
            });
        } catch (error: unknown) {
            toast.error(getCertificateErrorMessage(error, t('admin.certificates.createError')));
        } finally {
            setActionLoading(false);
        }
    };

    // UI Helpers
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'VERIFIED': return <Badge className="bg-green-500/10 text-green-500 border-green-500/20"><CheckCircle className="w-3 h-3 mr-1" />{t('admin.verified')}</Badge>;
            case 'PENDING': return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20"><Clock className="w-3 h-3 mr-1" />{t('admin.pending')}</Badge>;
            case 'REJECTED': return <Badge variant="destructive" className="bg-red-500/10 text-red-500 border-red-500/20"><XCircle className="w-3 h-3 mr-1" />{t('admin.rejected')}</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getTypeBadge = (type: string) => {
        switch (type) {
            case 'COURSE': return <Badge variant="secondary" className="text-xs"><GraduationCap className="w-3 h-3 mr-1" />{t('admin.course')}</Badge>;
            case 'OLYMPIAD': return <Badge variant="secondary" className="text-xs bg-amber-500/10 text-amber-500 border-amber-500/20"><Trophy className="w-3 h-3 mr-1" />{t('admin.olympiad')}</Badge>;
            case 'DIPLOMA': return <Badge variant="secondary" className="text-xs bg-purple-500/10 text-purple-500 border-purple-500/20"><Award className="w-3 h-3 mr-1" />{t('admin.certificates.diplomaCert')}</Badge>;
            default: return <Badge variant="outline" className="text-xs">{type}</Badge>;
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString(t('common.locale') === 'ru' ? 'ru-RU' : 'uz-UZ', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-black text-foreground">{t('admin.certificates.title')}</h1>
                    <p className="text-muted-foreground">{t('admin.certificates.certificatesSubtitle')}</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => fetchCertificates()} disabled={loading}>
                        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        {t('admin.refresh')}
                    </Button>
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-200" onClick={prepareCreateDialog}>
                        <Award className="w-4 h-4 mr-2" />
                        {t('admin.certificates.newCertificate')}
                    </Button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-card p-5 rounded-2xl border border-border shadow-sm">
                    <div className="text-sm text-muted-foreground font-medium mb-1">{t('admin.certificates.totalIssued')}</div>
                    <div className="text-2xl font-black text-foreground">{stats.total}</div>
                </div>
                <div className="bg-card p-5 rounded-2xl border border-border shadow-sm">
                    <div className="text-sm text-muted-foreground font-medium mb-1">{t('admin.certificates.thisMonth')}</div>
                    <div className="text-2xl font-black text-green-600">
                        +{stats.thisMonth}
                    </div>
                </div>
                <div className="bg-card p-5 rounded-2xl border border-yellow-500/30 bg-yellow-500/5 shadow-sm">
                    <div className="text-sm text-yellow-600 font-medium mb-1">{t('admin.pending')}</div>
                    <div className="text-2xl font-black text-yellow-500">{stats.pending}</div>
                </div>
                <div
                    className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl p-5 text-white shadow-lg shadow-purple-200 flex flex-col justify-center cursor-pointer hover:shadow-xl transition-all"
                    onClick={() => setQuickVerifyOpen(true)}
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg">
                            <QrCode className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <div className="font-bold">{t('admin.certificates.quickVerify')}</div>
                            <div className="text-xs text-purple-200">{t('admin.certificates.byIdOrQr')}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Card */}
            <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden min-h-[600px] flex flex-col">
                {/* Toolbar */}
                <div className="p-4 border-b border-border bg-muted/30 flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        {/* Search */}
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder={t('admin.certificates.searchCertPlaceholder')}
                                className="pl-9 bg-card border-border"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Filters */}
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <Filter className="w-4 h-4 text-muted-foreground mr-1" />

                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[140px] bg-card text-xs h-9 border-border">
                                    <SelectValue placeholder={t('admin.status')} />
                                </SelectTrigger>
                                <SelectContent className="bg-card border-border">
                                    <SelectItem value="all">{t('admin.certificates.allStatuses')}</SelectItem>
                                    <SelectItem value="PENDING">{t('admin.pending')}</SelectItem>
                                    <SelectItem value="VERIFIED">{t('admin.verified')}</SelectItem>
                                    <SelectItem value="REJECTED">{t('admin.rejected')}</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger className="w-[140px] bg-card text-xs h-9 border-border">
                                    <SelectValue placeholder={t('common.type')} />
                                </SelectTrigger>
                                <SelectContent className="bg-card border-border">
                                    <SelectItem value="all">{t('admin.certificates.allTypes')}</SelectItem>
                                    <SelectItem value="COURSE">{t('admin.course')}</SelectItem>
                                    <SelectItem value="OLYMPIAD">{t('admin.olympiad')}</SelectItem>
                                    <SelectItem value="DIPLOMA">{t('admin.diploma')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Batch Actions */}
                    {selectedCertIds.length > 0 && (
                        <div className="flex items-center gap-4 bg-purple-500/10 p-2 rounded-lg border border-purple-500/20 animate-in fade-in slide-in-from-top-2">
                            <div className="flex items-center gap-2 pl-2">
                                <div className="bg-purple-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                                    {selectedCertIds.length}
                                </div>
                                <span className="text-sm font-bold text-purple-600 dark:text-purple-400">{t('common.selected')}</span>
                            </div>
                            <div className="h-4 w-px bg-purple-200 dark:bg-purple-800" />
                            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white h-7 text-xs" onClick={handleBatchApprove} disabled={actionLoading}>
                                <CheckCircle className="w-3 h-3 mr-1.5" /> {t('common.approve')}
                            </Button>
                            <Button size="sm" variant="ghost" className="text-purple-700 h-7 text-xs" onClick={() => setSelectedCertIds([])}>
                                {t('common.cancel')}
                            </Button>
                        </div>
                    )}
                </div>
                <div className="flex-1 overflow-auto">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                        </div>
                    ) : filteredCerts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                            <Award className="w-12 h-12 mb-4 opacity-30" />
                            <p>{t('admin.certificates.noCertificates')}</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="w-[50px]">
                                        <Checkbox
                                            checked={selectedCertIds.length === filteredCerts.length && filteredCerts.length > 0}
                                            onCheckedChange={(checked) => {
                                                if (checked) setSelectedCertIds(filteredCerts.map(c => c.id));
                                                else setSelectedCertIds([]);
                                            }}
                                        />
                                    </TableHead>
                                    <TableHead>{t('admin.certificates.certId')}</TableHead>
                                    <TableHead>{t('common.type')}</TableHead>
                                    <TableHead>{t('admin.student')}</TableHead>
                                    <TableHead>{t('admin.certificates.source')}</TableHead>
                                    <TableHead>{t('admin.certificates.result')}</TableHead>
                                    <TableHead>{t('common.date')}</TableHead>
                                    <TableHead>{t('admin.status')}</TableHead>
                                    <TableHead className="text-right">{t('admin.certificates.actions')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredCerts.map((cert) => (
                                    <TableRow
                                        key={cert.id}
                                        className={`cursor-pointer group transition-colors ${selectedCertIds.includes(cert.id) ? "bg-purple-500/10 hover:bg-purple-500/20" : "hover:bg-muted/50"}`}
                                    >
                                        <TableCell>
                                            <Checkbox
                                                checked={selectedCertIds.includes(cert.id)}
                                                onCheckedChange={() => toggleSelect(cert.id)}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </TableCell>
                                        <TableCell className="font-mono text-xs font-bold text-muted-foreground group-hover:text-purple-500">
                                            {cert.cert_number}
                                        </TableCell>
                                        <TableCell>{getTypeBadge(cert.cert_type)}</TableCell>
                                        <TableCell>
                                            <div className="font-bold text-foreground">
                                                {cert.user?.first_name || t('admin.certificates.unknownUser')} {cert.user?.last_name || ""}
                                            </div>
                                            <div className="text-xs text-muted-foreground">{cert.user?.email || t('admin.certificates.noEmail')}</div>
                                        </TableCell>
                                        <TableCell className="text-foreground/80 font-medium max-w-[200px] truncate">
                                            {cert.title}
                                        </TableCell>
                                        <TableCell>
                                            <span className={`font-bold ${Number((cert.grade || "").toString().replace('%', '')) > 80 ? 'text-green-500' : 'text-yellow-500'}`}>
                                                {cert.grade || "N/A"}
                                            </span>
                                            {cert.score > 0 && (
                                                <span className="text-xs text-muted-foreground ml-1">({cert.score} ball)</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground">{formatDate(cert.issued_at)}</TableCell>
                                        <TableCell>
                                            {getStatusBadge(cert.status)}
                                            {cert.status === 'REJECTED' && cert.rejection_reason && (
                                                <Tooltip>
                                                    <TooltipTrigger>
                                                        <AlertCircle className="w-3 h-3 text-red-500 ml-1 inline" />
                                                    </TooltipTrigger>
                                                    <TooltipContent className="max-w-xs">
                                                        <p className="text-xs">{cert.rejection_reason}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <TooltipProvider>
                                                <div className="flex justify-end gap-1">
                                                    {cert.status === 'PENDING' && (
                                                        <>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:bg-green-500/10" onClick={() => handleVerify(cert)} disabled={actionLoading}>
                                                                        <CheckCircle className="w-4 h-4" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>{t('common.approve')}</TooltipContent>
                                                            </Tooltip>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-500/10" onClick={() => openRejectDialog(cert)}>
                                                                        <XCircle className="w-4 h-4" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>{t('common.reject')}</TooltipContent>
                                                            </Tooltip>
                                                        </>
                                                    )}
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-500/10" onClick={() => handleView(cert)}>
                                                                <Eye className="w-4 h-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>{t('common.view')}</TooltipContent>
                                                    </Tooltip>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-900" onClick={() => handleDownloadPDF(cert)} disabled={actionLoading}>
                                                                <Download className="w-4 h-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>{t('common.downloadPdf')}</TooltipContent>
                                                    </Tooltip>
                                                </div>
                                            </TooltipProvider>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </div>

            {/* Reject Dialog */}
            <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <XCircle className="w-5 h-5" />
                            {t('admin.certificates.rejectCertificate')}
                        </DialogTitle>
                        <DialogDescription>
                            {t('admin.certificates.rejectCertDesc')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        {rejectingCert && (
                            <div className="bg-muted p-3 rounded-lg">
                                <p className="font-bold">{rejectingCert.cert_number}</p>
                                <p className="text-sm text-muted-foreground">
                                    {rejectingCert.user.first_name} {rejectingCert.user.last_name} - {rejectingCert.title}
                                </p>
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label>{t('admin.certificates.rejectReasonLabel')}</Label>
                            <Textarea
                                placeholder={t('admin.certificates.rejectReasonPlaceholder')}
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                className="min-h-[100px]"
                            />
                            <p className="text-xs text-muted-foreground">{rejectReason.length}/10 {t('common.characters') || 'belgi'}</p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>{t('common.cancel')}</Button>
                        <Button variant="destructive" onClick={handleReject} disabled={actionLoading || rejectReason.length < 10}>
                            {actionLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {t('common.reject')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Preview Dialog */}
            <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto backdrop-blur-sm bg-card/95 border-border">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-blue-600">
                            <Award className="w-5 h-5" />
                            {t('admin.certificates.certDetails')}
                        </DialogTitle>
                        <DialogDescription>
                            {t('admin.certificates.certDetailsDesc')}
                        </DialogDescription>
                    </DialogHeader>

                    {previewCert && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                            {/* Left Side: Details */}
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-xs text-muted-foreground">{t('admin.certificates.certNumber')}</Label>
                                        <p className="font-mono font-bold text-foreground">{previewCert.cert_number}</p>
                                    </div>
                                    <div>
                                        <Label className="text-xs text-muted-foreground">{t('common.type')}</Label>
                                        <div className="mt-1">{getTypeBadge(previewCert.cert_type)}</div>
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-xs text-muted-foreground">{t('admin.student')}</Label>
                                    <p className="font-bold text-foreground">{previewCert.user?.first_name || t('admin.certificates.unknownUser')} {previewCert.user?.last_name || ""}</p>
                                    <p className="text-xs text-muted-foreground">{previewCert.user?.email || t('admin.certificates.noEmail')}</p>
                                </div>

                                <div>
                                    <Label className="text-xs text-muted-foreground">{t('admin.certificates.source')}</Label>
                                    <p className="font-bold text-foreground">{previewCert.title}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-xs text-muted-foreground">{t('admin.certificates.result')}</Label>
                                        <p className="text-lg font-black text-purple-600 dark:text-purple-400">{previewCert.grade}</p>
                                    </div>
                                    <div>
                                        <Label className="text-xs text-muted-foreground">{t('admin.certificates.issuedDate')}</Label>
                                        <p className="text-sm font-medium text-foreground">{new Date(previewCert.issued_at).toLocaleDateString(t('common.locale') === 'ru' ? 'ru-RU' : 'uz-UZ')}</p>
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-xs text-muted-foreground">{t('admin.status')}</Label>
                                    <div className="mt-1">{getStatusBadge(previewCert.status)}</div>
                                </div>

                                {previewCert.verified_at && (
                                    <div className="bg-green-500/10 p-3 rounded-lg border border-green-500/20">
                                        <p className="text-xs text-green-700 dark:text-green-500 font-bold uppercase mb-1">{t('admin.certificates.verifyInfo')}</p>
                                        <p className="text-sm text-green-800 dark:text-green-400">{t('admin.certificates.verifiedBy')} <b>{previewCert.verified_by_name}</b></p>
                                        <p className="text-xs text-green-600 dark:text-green-600/80">{t('admin.certificates.dateColon')} {new Date(previewCert.verified_at).toLocaleString(t('common.locale') === 'ru' ? 'ru-RU' : 'uz-UZ')}</p>
                                    </div>
                                ) || null}

                                {previewCert.status === 'REJECTED' && previewCert.rejection_reason && (
                                    <div className="bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                                        <p className="text-xs text-red-700 dark:text-red-500 font-bold uppercase mb-1">{t('admin.certificates.rejectReasonTitle')}</p>
                                        <p className="text-sm text-red-800 dark:text-red-400">{previewCert.rejection_reason}</p>
                                    </div>
                                ) || null}
                            </div>

                            {/* Right Side: PDF Preview */}
                            <div className="flex flex-col gap-3">
                                <Label className="text-xs text-muted-foreground">{t('admin.certificates.certCopyPdf')}</Label>
                                {previewCert.pdf_file ? (
                                    <div className="border rounded-lg overflow-hidden bg-muted aspect-[1.414/1] relative group">
                                        <iframe
                                            src={`${getImageUrl(previewCert.pdf_file)}#toolbar=0`}
                                            className="w-full h-full border-none"
                                            title="Certificate PDF"
                                        />
                                        <div className="absolute inset-0 bg-black/5 pointer-events-none group-hover:bg-transparent transition-colors" />
                                    </div>
                                ) : (
                                    <div className="border-2 border-dashed rounded-lg aspect-[1.414/1] flex flex-col items-center justify-center text-muted-foreground bg-muted/30">
                                        <Award className="w-12 h-12 mb-2 opacity-20" />
                                        <p className="text-sm font-medium">{t('admin.certificates.pdfNotCreated')}</p>
                                        <p className="text-xs">{t('admin.certificates.willBeCreatedAfterVerify')}</p>
                                    </div>
                                )}

                                {previewCert.pdf_file && (
                                    <Button className="w-full" variant="outline" onClick={() => handleDownloadPDF(previewCert)}>
                                        <Download className="w-4 h-4 mr-2" />
                                        {t('common.downloadPdfFile')}
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setPreviewDialogOpen(false)}>{t('common.close')}</Button>
                        {previewCert?.status === 'PENDING' && (
                            <div className="flex gap-2">
                                <Button variant="destructive" onClick={() => { setPreviewDialogOpen(false); openRejectDialog(previewCert); }}>{t('common.reject')}</Button>
                                <Button className="bg-green-600 hover:bg-green-700" onClick={() => { setPreviewDialogOpen(false); handleVerify(previewCert); }}>{t('common.approve')}</Button>
                            </div>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {/* Quick Verify Dialog */}
            <Dialog open={quickVerifyOpen} onOpenChange={(open) => {
                setQuickVerifyOpen(open);
                if (!open) {
                    setVerifyNumber("");
                    setVerifyResult(null);
                }
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-primary">
                            <QrCode className="w-5 h-5" />
                            {t('admin.certificates.quickVerifyTitle')}
                        </DialogTitle>
                        <DialogDescription>
                            {t('admin.certificates.quickVerifyDesc')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="flex gap-2">
                            <Input
                                placeholder="CRT-XXXX"
                                value={verifyNumber}
                                onChange={(e) => setVerifyNumber(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleQuickVerify()}
                            />
                            <Button onClick={handleQuickVerify} disabled={actionLoading}>
                                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : t('admin.certificates.check')}
                            </Button>
                        </div>

                        {verifyResult && (
                            <div className={`p-4 rounded-xl border ${verifyResult.success ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                                {verifyResult.success ? (
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-green-500 font-bold">
                                            <CheckCircle className="w-5 h-5" />
                                            {t('admin.certificates.certIsValide')}
                                        </div>
                                        <div className="text-sm space-y-1 mt-3">
                                            <p className="text-foreground"><b>{t('admin.certificates.owner')}</b> {verifyResult.certificate.user_name}</p>
                                            <p className="text-foreground"><b>{t('admin.certificates.name')}</b> {verifyResult.certificate.source}</p>
                                            <p className="text-foreground"><b>{t('admin.certificates.grade')}</b> {verifyResult.certificate.grade}</p>
                                            <p className="text-foreground"><b>{t('admin.certificates.date')}</b> {new Date(verifyResult.certificate.issued_at).toLocaleDateString(t('common.locale') === 'ru' ? 'ru-RU' : 'uz-UZ')}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-red-500 font-bold">
                                        <XCircle className="w-5 h-5" />
                                        {verifyResult.error}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Create Certificate Dialog */}
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-purple-600">
                            <Award className="w-5 h-5" />
                            {t('admin.certificates.createNewCert')}
                        </DialogTitle>
                        <DialogDescription>
                            {t('admin.certificates.certManualDesc')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                        <div className="space-y-2">
                            <Label>{t('admin.student')} *</Label>
                            <Select value={newCert.user_id} onValueChange={(v) => setNewCert({ ...newCert, user_id: v })}>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('admin.certificates.selectStudent')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {users.map(u => (
                                        <SelectItem key={u.id} value={u.id.toString()}>
                                            {u.first_name} {u.last_name} ({u.username})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>{t('admin.certificates.certType')} *</Label>
                            <Select value={newCert.cert_type} onValueChange={(v) => setNewCert({ ...newCert, cert_type: v })}>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('admin.certificates.selectType')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="COURSE">{t('admin.certificates.courseCert')}</SelectItem>
                                    <SelectItem value="OLYMPIAD">{t('admin.certificates.olympiadCert')}</SelectItem>
                                    <SelectItem value="DIPLOMA">{t('admin.certificates.diplomaCert')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {newCert.cert_type === 'COURSE' ? (
                            <div className="space-y-2">
                                <Label>{t('admin.course')} *</Label>
                                <Select value={newCert.course_id} onValueChange={(v) => setNewCert({ ...newCert, course_id: v })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('admin.notifications.selectCourse')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {courses.map(c => (
                                            <SelectItem key={c.id} value={c.id.toString()}>{c.title}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Label>{t('admin.olympiad')} *</Label>
                                <Select value={newCert.olympiad_id} onValueChange={(v) => setNewCert({ ...newCert, olympiad_id: v })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('admin.notifications.selectOlympiad')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {olympiads.map(o => (
                                            <SelectItem key={o.id} value={o.id.toString()}>{o.title}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label>{t('admin.certificates.resultInPercent')} *</Label>
                            <Input
                                placeholder={t('admin.certificates.resultPlaceholder')}
                                value={newCert.grade}
                                onChange={(e) => setNewCert({ ...newCert, grade: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>{t('admin.certificates.totalBallOptional')}</Label>
                            <Input
                                type="number"
                                placeholder="0"
                                value={newCert.score}
                                onChange={(e) => setNewCert({ ...newCert, score: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>{t('common.cancel')}</Button>
                        <Button onClick={handleCreateCertificate} disabled={actionLoading} className="bg-purple-600 hover:bg-purple-700">
                            {actionLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {t('admin.certificates.createAndApprove')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminCertificatesPage;
