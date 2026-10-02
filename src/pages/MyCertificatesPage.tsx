import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    Award,
    CheckCircle,
    XCircle,
    Clock,
    GraduationCap,
    Trophy,
    Download,
    ExternalLink,
    Share2,
    Loader2,
    QrCode,
    AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import axios from "axios";
import { API_URL, getAuthHeader } from "@/services/api";
import { toast } from "sonner";

interface Certificate {
    id: number;
    cert_number: string;
    cert_type: string;
    type_display: string;
    title: string;
    grade: string;
    score: number;
    status: "PENDING" | "VERIFIED" | "REJECTED";
    status_display: string;
    issued_at: string;
    verified_at?: string;
    verified_by_name?: string;
    rejection_reason?: string;
    verify_url: string;
    pdf_file?: string;
}

const MyCertificatesPage = () => {
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
    const [shareDialogOpen, setShareDialogOpen] = useState(false);

    useEffect(() => {
        fetchCertificates();
    }, []);

    const fetchCertificates = async () => {
        try {
            const res = await axios.get(`${API_URL}/certificates/my-certificates/`, { headers: getAuthHeader() });
            setCertificates(res.data.results || res.data);
        } catch (error) {
            toast.error("Sertifikatlarni yuklashda xatolik");
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('uz-UZ', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'VERIFIED': return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'PENDING': return <Clock className="w-5 h-5 text-yellow-500" />;
            case 'REJECTED': return <XCircle className="w-5 h-5 text-red-500" />;
            default: return null;
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'COURSE': return <GraduationCap className="w-6 h-6" />;
            case 'OLYMPIAD': return <Trophy className="w-6 h-6" />;
            case 'DIPLOMA': return <Award className="w-6 h-6" />;
            default: return <Award className="w-6 h-6" />;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'COURSE': return 'bg-primary';
            case 'OLYMPIAD': return 'bg-primary';
            case 'DIPLOMA': return 'bg-primary';
            default: return 'bg-primary';
        }
    };

    const openShareDialog = (cert: Certificate) => {
        setSelectedCert(cert);
        setShareDialogOpen(true);
    };

    const copyVerifyLink = () => {
        if (!selectedCert) return;
        const url = `${window.location.origin}/certificate/verify/${selectedCert.cert_number}`;
        navigator.clipboard.writeText(url);
        toast.success("Havola nusxalandi!");
    };

    const shareToTelegram = () => {
        if (!selectedCert) return;
        const url = `${window.location.origin}/certificate/verify/${selectedCert.cert_number}`;
        const text = encodeURIComponent(`🎓 Men Hogwords Olimpiada platformasida "${selectedCert.title}" bo'yicha sertifikat oldim!\n\n✅ Tekshirish: ${url}`);
        window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
    };

    const shareToLinkedIn = () => {
        if (!selectedCert) return;
        const url = `${window.location.origin}/certificate/verify/${selectedCert.cert_number}`;
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
    };

    const handleDownloadPDF = async (cert: Certificate) => {
        try {
            toast.loading("PDF tayyorlanmoqda...", { id: 'pdf-loading' });
            const res = await axios.get(`${API_URL}/certificates/${cert.id}/download/`, { headers: getAuthHeader() });
            toast.dismiss('pdf-loading');

            if (res.data.success && res.data.pdf_url) {
                window.open(res.data.pdf_url, '_blank');
                toast.success("PDF tayyor!");
            } else {
                toast.error("PDF topilmadi");
            }
        } catch (error: any) {
            toast.dismiss('pdf-loading');
            toast.error(error.response?.data?.error || "PDF yuklashda xatolik");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-black text-foreground">Mening Sertifikatlarim</h1>
                    <p className="text-muted-foreground">Erishgan yutuqlaringiz va sertifikatlaringiz</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-5 flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
                            <CheckCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Tasdiqlangan</p>
                            <p className="text-2xl font-black">{certificates.filter(c => c.status === 'VERIFIED').length}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-5 flex items-center gap-4">
                        <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center text-yellow-600">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Kutilmoqda</p>
                            <p className="text-2xl font-black">{certificates.filter(c => c.status === 'PENDING').length}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-5 flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                            <Award className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Jami</p>
                            <p className="text-2xl font-black">{certificates.length}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Certificates List */}
            {certificates.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <Award className="w-16 h-16 text-muted-foreground/30 mb-4" />
                        <h3 className="text-lg font-bold mb-2">Hali sertifikat yo'q</h3>
                        <p className="text-muted-foreground text-center max-w-md">
                            Kurslarni tugatib yoki olimpiadalarda ishtirok etib sertifikat oling
                        </p>
                        <div className="flex gap-3 mt-6">
                            <Link to="/courses">
                                <Button variant="outline">
                                    <GraduationCap className="w-4 h-4 mr-2" />
                                    Kurslar
                                </Button>
                            </Link>
                            <Link to="/olympiads">
                                <Button className="bg-primary hover:bg-primary/90 text-background font-bold">
                                    <Trophy className="w-4 h-4 mr-2" />
                                    Olimpiadalar
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid md:grid-cols-2 gap-4">
                    {certificates.map((cert) => (
                        <Card key={cert.id} className={`overflow-hidden ${cert.status === 'REJECTED' ? 'opacity-75' : ''}`}>
                            <div className={`h-2 ${getTypeColor(cert.cert_type)}`} />
                            <CardHeader className="pb-2">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-12 h-12 ${getTypeColor(cert.cert_type)} rounded-xl flex items-center justify-center text-background font-bold`}>
                                            {getTypeIcon(cert.cert_type)}
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">{cert.title}</CardTitle>
                                            <p className="text-xs text-muted-foreground font-mono">{cert.cert_number}</p>
                                        </div>
                                    </div>
                                    {getStatusIcon(cert.status)}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Natija:</span>
                                    <span className="font-bold text-green-600">{cert.grade}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Sana:</span>
                                    <span>{formatDate(cert.issued_at)}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Status:</span>
                                    <Badge variant={cert.status === 'VERIFIED' ? 'default' : cert.status === 'PENDING' ? 'outline' : 'destructive'}>
                                        {cert.status_display}
                                    </Badge>
                                </div>

                                {/* Rejection Reason */}
                                {cert.status === 'REJECTED' && cert.rejection_reason && (
                                    <div className="bg-red-50 border border-red-100 rounded-lg p-3">
                                        <div className="flex items-start gap-2">
                                            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
                                            <div>
                                                <p className="text-xs font-bold text-red-700">Rad etish sababi:</p>
                                                <p className="text-xs text-red-600">{cert.rejection_reason}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Actions */}
                                {cert.status === 'VERIFIED' && (
                                    <div className="flex gap-2 pt-2">
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button variant="outline" size="sm" className="flex-1" asChild>
                                                        <Link to={`/certificate/verify/${cert.cert_number}`} target="_blank">
                                                            <QrCode className="w-4 h-4 mr-2" />
                                                            Tekshirish
                                                        </Link>
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>QR kod sahifasini ochish</TooltipContent>
                                            </Tooltip>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button variant="outline" size="sm" onClick={() => openShareDialog(cert)}>
                                                        <Share2 className="w-4 h-4" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>Ulashish</TooltipContent>
                                            </Tooltip>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button variant="outline" size="sm" onClick={() => handleDownloadPDF(cert)}>
                                                        <Download className="w-4 h-4" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>PDF yuklash</TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Share Dialog */}
            <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Share2 className="w-5 h-5" />
                            Sertifikatni Ulashish
                        </DialogTitle>
                        <DialogDescription>
                            Sertifikat havolasini ijtimoiy tarmoqlarda ulashing yoki nusxalab oling.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedCert && (
                        <div className="space-y-4 py-4">
                            <div className="bg-muted p-4 rounded-lg">
                                <p className="font-bold">{selectedCert.title}</p>
                                <p className="text-sm text-muted-foreground font-mono">{selectedCert.cert_number}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <Button variant="outline" onClick={shareToTelegram} className="h-12">
                                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M11.944 0A12 12 0 1 0 24 12.056A12.014 12.014 0 0 0 11.944 0Zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635Z" />
                                    </svg>
                                    Telegram
                                </Button>
                                <Button variant="outline" onClick={shareToLinkedIn} className="h-12">
                                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                    </svg>
                                    LinkedIn
                                </Button>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="secondary" className="flex-1" onClick={copyVerifyLink}>
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    Havolani nusxalash
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default MyCertificatesPage;
