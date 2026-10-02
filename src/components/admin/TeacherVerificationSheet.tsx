
import { useState } from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    CheckCircle2,
    XCircle,
    AlertTriangle,
    ShieldCheck,
    FileText,
    ExternalLink,
    Loader2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { getImageUrl } from "@/services/api";

interface Teacher {
    id: number;
    first_name: string;
    last_name: string;
    teacher_profile?: {
        verification_status: string;
        rejection_reason?: string;
        is_identity_verified: boolean;
        identity_document?: string;
    };
}

interface TeacherVerificationSheetProps {
    teacher: Teacher | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onVerify: (id: number, status: string, reason?: string) => Promise<void>;
    onToggleIdentity: (id: number) => Promise<void>;
}

const TeacherVerificationSheet = ({
    teacher,
    open,
    onOpenChange,
    onVerify,
    onToggleIdentity
}: TeacherVerificationSheetProps) => {
    const { t } = useTranslation();
    const [reason, setReason] = useState(teacher?.teacher_profile?.rejection_reason || "");
    const [loading, setLoading] = useState(false);

    if (!teacher) return null;

    const handleAction = async (status: string) => {
        setLoading(true);
        try {
            await onVerify(teacher.id, status, status === 'REJECTED' ? reason : "");
            onOpenChange(false);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleIdentity = async () => {
        setLoading(true);
        try {
            await onToggleIdentity(teacher.id);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-[500px] overflow-y-auto">
                <SheetHeader className="space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <ShieldCheck className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <SheetTitle className="text-2xl font-black">
                            {t('admin.teacherVerification')}
                        </SheetTitle>
                        <SheetDescription>
                            {teacher.first_name} {teacher.last_name} arizasini ko'rib chiqish va tasdiqlash.
                        </SheetDescription>
                    </div>
                </SheetHeader>

                <div className="py-8 space-y-8">
                    {/* Status Actions */}
                    <div className="space-y-6">
                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                            {t('admin.finalDecision')}
                        </Label>

                        <div className="space-y-4">
                            <div className="space-y-3">
                                <Label className="font-bold text-xs ml-1">{t('admin.rejectionReason')} (Ixtiyoriy)</Label>
                                <Textarea
                                    placeholder={t('admin.rejectionReasonPlaceholder')}
                                    className="min-h-[100px] rounded-2xl bg-muted/30 border-none font-medium"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                />
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    className="flex-1 h-14 rounded-2xl bg-red-500 hover:bg-red-600 font-black shadow-lg shadow-red-500/20"
                                    onClick={() => handleAction('REJECTED')}
                                    disabled={loading}
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                        <><XCircle className="w-5 h-5 mr-2" /> {t('common.reject')}</>
                                    )}
                                </Button>
                                <Button
                                    className="flex-1 h-14 rounded-2xl bg-green-600 hover:bg-green-700 font-black shadow-lg shadow-green-600/20"
                                    onClick={() => handleAction('APPROVED')}
                                    disabled={loading}
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                        <><CheckCircle2 className="w-5 h-5 mr-2" /> {t('common.approve')}</>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                <SheetFooter className="pt-4">
                    <p className="text-[10px] text-center w-full text-muted-foreground font-medium italic">
                        Tasdiqlashdan so'ng o'qituvchiga avtomatik bildirishnoma yuboriladi.
                    </p>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
};

const Separator = () => <div className="h-px bg-border/60 w-full" />;

export default TeacherVerificationSheet;
