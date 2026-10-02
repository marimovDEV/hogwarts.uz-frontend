import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Award, Download, Share2, XCircle } from "lucide-react";

const CertificateVerify = () => {
    const { id } = useParams();
    const [status, setStatus] = useState<"loading" | "valid" | "invalid">("loading");

    useEffect(() => {
        // Simulate API check
        setTimeout(() => {
            if (id === "123456" || id === "TEST-CERT") { // Mock validation
                setStatus("valid");
            } else {
                setStatus("invalid");
            }
        }, 1500);
    }, [id]);

    return (
        <div className="min-h-screen bg-background">
            <main className="pt-24 container mx-auto px-4 flex flex-col items-center justify-center min-h-[80vh]">
                {status === "loading" && (
                    <div className="flex flex-col items-center animate-pulse">
                        <div className="w-16 h-16 rounded-full bg-muted mb-4"></div>
                        <div className="h-4 w-48 bg-muted rounded mb-2"></div>
                        <div className="h-3 w-32 bg-muted rounded"></div>
                    </div>
                )}

                {status === "valid" && (
                    <div className="max-w-md w-full bg-card rounded-3xl p-8 shadow-strong text-center animate-scale-in border border-success/20">
                        <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="w-10 h-10 text-success" />
                        </div>
                        <h1 className="text-2xl font-bold mb-2">Sertifikat Haqiqiy</h1>
                        <p className="text-muted-foreground mb-6">
                            Ushbu sertifikat <span className="font-semibold text-foreground">Olimpiada Platformasi</span> tomonidan tasdiqlangan.
                        </p>

                        <div className="bg-muted/50 rounded-xl p-4 mb-6 text-left space-y-3">
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">ID:</span>
                                <span className="text-sm font-mono font-medium">{id || "CERT-8842-9921"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Ism:</span>
                                <span className="text-sm font-medium">Azizbek T.</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Kurs/Olimpiada:</span>
                                <span className="text-sm font-medium">Matematika Pro</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Berilgan sana:</span>
                                <span className="text-sm font-medium">20 Yanvar, 2026</span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button className="flex-1" variant="outline">
                                <Download className="w-4 h-4 mr-2" />
                                Yuklash
                            </Button>
                            <Button className="flex-1" variant="outline">
                                <Share2 className="w-4 h-4 mr-2" />
                                Ulashish
                            </Button>
                        </div>
                    </div>
                )}

                {status === "invalid" && (
                    <div className="max-w-md w-full bg-card rounded-3xl p-8 shadow-strong text-center animate-scale-in border border-destructive/20">
                        <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
                            <XCircle className="w-10 h-10 text-destructive" />
                        </div>
                        <h1 className="text-2xl font-bold mb-2">Sertifikat Topilmadi</h1>
                        <p className="text-muted-foreground mb-6">
                            Ushbu ID raqami bilan sertifikat bazadan topilmadi. Iltimos, qayta tekshirib ko'ring.
                        </p>
                        <Button variant="default" onClick={() => window.location.reload()}>
                            Qayta tekshirish
                        </Button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default CertificateVerify;
