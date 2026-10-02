import { useState, useEffect } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import {
    Award,
    CheckCircle,
    XCircle,
    Clock,
    GraduationCap,
    Trophy,
    Calendar,
    User,
    Loader2,
    Search,
    ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import axios from "axios";
import { API_URL } from "@/services/api";

interface CertificateData {
    cert_number: string;
    cert_type: string;
    type_display: string;
    user_name: string;
    source: string;
    grade: string;
    score: number;
    status: string;
    issued_at: string;
    verified_at?: string;
}

const CertificateVerifyPage = () => {
    const { certNumber } = useParams<{ certNumber: string }>();
    const [searchParams] = useSearchParams();
    const queryNumber = searchParams.get('number');

    const [certificate, setCertificate] = useState<CertificateData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchInput, setSearchInput] = useState(certNumber || queryNumber || "");
    const [isValid, setIsValid] = useState<boolean | null>(null);

    useEffect(() => {
        const numberToVerify = certNumber || queryNumber;
        if (numberToVerify) {
            verifyCertificate(numberToVerify);
        }
    }, [certNumber, queryNumber]);

    const verifyCertificate = async (number: string) => {
        if (!number.trim()) return;

        setLoading(true);
        setError(null);
        setCertificate(null);
        setIsValid(null);

        try {
            const res = await axios.get(`${API_URL}/certificates/verify/?number=${number.trim()}`);
            if (res.data.success) {
                setCertificate(res.data.certificate);
                setIsValid(res.data.valid);
            } else {
                setError(res.data.error || "Sertifikat topilmadi");
            }
        } catch (err: any) {
            setError(err.response?.data?.error || "Sertifikat topilmadi");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        verifyCertificate(searchInput);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('uz-UZ', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'COURSE': return <GraduationCap className="w-6 h-6" />;
            case 'OLYMPIAD': return <Trophy className="w-6 h-6" />;
            case 'DIPLOMA': return <Award className="w-6 h-6" />;
            default: return <Award className="w-6 h-6" />;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 py-12 px-4">
                <div className="container mx-auto max-w-2xl text-center text-white">
                    <Award className="w-16 h-16 mx-auto mb-4 opacity-90" />
                    <h1 className="text-3xl font-black mb-2">Sertifikat Tekshirish</h1>
                    <p className="text-purple-200">
                        Hogwords Olimpiada platformasi sertifikatlari haqiqiyligini tekshiring
                    </p>
                </div>
            </div>

            <div className="container mx-auto max-w-2xl px-4 -mt-8 pb-20">
                {/* Search Box */}
                <Card className="mb-8 shadow-xl">
                    <CardContent className="p-6">
                        <form onSubmit={handleSearch} className="flex gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <Input
                                    placeholder="Sertifikat raqamini kiriting (masalan: CRT-1234)"
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    className="pl-11 h-12 text-lg"
                                />
                            </div>
                            <Button type="submit" className="h-12 px-6 bg-purple-600 hover:bg-purple-700" disabled={loading}>
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Tekshirish"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Loading */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-16">
                        <Loader2 className="w-12 h-12 animate-spin text-purple-600 mb-4" />
                        <p className="text-muted-foreground">Tekshirilmoqda...</p>
                    </div>
                )}

                {/* Error */}
                {error && !loading && (
                    <Card className="border-red-200 bg-red-50">
                        <CardContent className="p-8 text-center">
                            <XCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
                            <h2 className="text-xl font-bold text-red-700 mb-2">Sertifikat Topilmadi</h2>
                            <p className="text-red-600">{error}</p>
                            <p className="text-sm text-muted-foreground mt-4">
                                Sertifikat raqamini to'g'ri kiritganingizga ishonch hosil qiling
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Certificate Result */}
                {certificate && !loading && (
                    <div className="space-y-6">
                        {/* Status Banner */}
                        {isValid ? (
                            <Card className="border-green-300 bg-gradient-to-r from-green-50 to-emerald-50 overflow-hidden">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white">
                                            <CheckCircle className="w-10 h-10" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-green-700">✓ HAQIQIY SERTIFIKAT</h2>
                                            <p className="text-green-600">Bu sertifikat Hogwords Olimpiada tomonidan tasdiqlangan</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : certificate.status === 'PENDING' ? (
                            <Card className="border-yellow-300 bg-yellow-50">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center text-white">
                                            <Clock className="w-10 h-10" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-yellow-700">⏳ KUTILMOQDA</h2>
                                            <p className="text-yellow-600">Bu sertifikat hali tasdiqlanmagan</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card className="border-red-300 bg-red-50">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-white">
                                            <XCircle className="w-10 h-10" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-red-700">✗ RAD ETILGAN</h2>
                                            <p className="text-red-600">Bu sertifikat rad etilgan</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Certificate Details */}
                        <Card className="shadow-lg">
                            <CardContent className="p-8">
                                {/* Header */}
                                <div className="flex items-center gap-4 mb-8 pb-6 border-b">
                                    <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
                                        {getTypeIcon(certificate.cert_type)}
                                    </div>
                                    <div>
                                        <Badge variant="secondary" className="mb-1">{certificate.type_display}</Badge>
                                        <h3 className="text-xl font-bold">{certificate.source}</h3>
                                    </div>
                                </div>

                                {/* Details Grid */}
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-xs text-muted-foreground uppercase tracking-wide">Sertifikat Raqami</label>
                                            <p className="text-lg font-mono font-bold text-purple-600">{certificate.cert_number}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                                                <User className="w-3 h-3" /> Ism
                                            </label>
                                            <p className="text-lg font-bold">{certificate.user_name}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-xs text-muted-foreground uppercase tracking-wide">Natija</label>
                                            <p className="text-lg font-bold text-green-600">
                                                {certificate.grade}
                                                {certificate.score > 0 && <span className="text-muted-foreground font-normal"> ({certificate.score} ball)</span>}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                                                <Calendar className="w-3 h-3" /> Berilgan Sana
                                            </label>
                                            <p className="text-lg font-bold">{formatDate(certificate.issued_at)}</p>
                                        </div>
                                    </div>
                                </div>

                                {certificate.verified_at && (
                                    <div className="mt-6 pt-6 border-t">
                                        <p className="text-sm text-muted-foreground">
                                            Tasdiqlangan: {formatDate(certificate.verified_at)}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Footer */}
                        <div className="text-center text-sm text-muted-foreground">
                            <p>Bu sahifa faqat sertifikat haqiqiyligini tekshirish uchun mo'ljallangan</p>
                            <Link to="/" className="text-purple-600 hover:underline inline-flex items-center gap-1 mt-2">
                                Bosh sahifaga qaytish <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                )}

                {/* Initial State */}
                {!certificate && !loading && !error && (
                    <div className="text-center py-16">
                        <Award className="w-20 h-20 mx-auto text-purple-200 mb-4" />
                        <h2 className="text-xl font-bold text-muted-foreground mb-2">Sertifikat Raqamini Kiriting</h2>
                        <p className="text-muted-foreground">
                            Sertifikat haqiqiyligini tekshirish uchun yuqoridagi maydonga raqamni kiriting
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CertificateVerifyPage;
