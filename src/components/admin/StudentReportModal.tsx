import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
    Trophy,
    BookOpen,
    Target,
    Calendar,
    Clock,
    Loader2,
    TrendingUp,
    GraduationCap,
    Award
} from "lucide-react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { API_URL, getAuthHeader } from "@/services/api";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface StudentReportModalProps {
    userId: number | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const StudentReportModal: React.FC<StudentReportModalProps> = ({ userId, open, onOpenChange }) => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [report, setReport] = useState<any>(null);

    useEffect(() => {
        if (open && userId) {
            fetchReport();
        }
    }, [open, userId]);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/users/${userId}/performance_report/`, {
                headers: getAuthHeader()
            });
            setReport(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (!userId) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl p-0 gap-0 border-none bg-background shadow-2xl">
                <DialogHeader className="p-8 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-b relative">
                    <div className="flex items-center gap-6 relative z-10">
                        <div className="w-20 h-20 bg-primary/20 rounded-2xl flex items-center justify-center ring-4 ring-background shadow-xl">
                            <GraduationCap className="w-10 h-10 text-primary" />
                        </div>
                        <div className="space-y-1">
                            <DialogTitle className="text-3xl font-black tracking-tight">
                                {report?.user?.full_name || t('admin.loading')}
                            </DialogTitle>
                            <div className="flex items-center gap-3">
                                <Badge variant="outline" className="bg-background/50 font-black">@{report?.user?.username}</Badge>
                                <Badge variant="secondary" className="font-black">Lvl {report?.user?.level || 1}</Badge>
                                <div className="flex items-center gap-1 text-xs font-bold text-amber-600">
                                    <Trophy className="w-3 h-3" />
                                    {report?.user?.xp || 0} XP
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogHeader>

                {loading ? (
                    <div className="h-96 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : report && (
                    <div className="p-8 space-y-8">
                        {/* Summary Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Card className="p-4 bg-muted/30 border-none shadow-sm flex flex-col items-center justify-center text-center space-y-1">
                                <BookOpen className="w-5 h-5 text-blue-500 mb-1" />
                                <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{t('admin.reports.coursesEnrolled')}</span>
                                <span className="text-xl font-black">{report.summary.courses_enrolled}</span>
                            </Card>
                            <Card className="p-4 bg-muted/30 border-none shadow-sm flex flex-col items-center justify-center text-center space-y-1">
                                <TrendingUp className="w-5 h-5 text-green-500 mb-1" />
                                <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{t('admin.reports.coursesCompleted')}</span>
                                <span className="text-xl font-black">{report.summary.courses_completed}</span>
                            </Card>
                            <Card className="p-4 bg-muted/30 border-none shadow-sm flex flex-col items-center justify-center text-center space-y-1">
                                <Target className="w-5 h-5 text-purple-500 mb-1" />
                                <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{t('admin.reports.olympiadsParticipated')}</span>
                                <span className="text-xl font-black">{report.summary.olympiads_participated}</span>
                            </Card>
                            <Card className="p-4 bg-muted/30 border-none shadow-sm flex flex-col items-center justify-center text-center space-y-1">
                                <Award className="w-5 h-5 text-amber-500 mb-1" />
                                <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{t('admin.reports.avgScore')}</span>
                                <span className="text-xl font-black">{Math.round(report.summary.avg_olympiad_score)}%</span>
                            </Card>
                        </div>

                        {/* Courses Section */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-primary" />
                                {t('admin.reports.courseProgress')}
                            </h3>
                            <div className="grid gap-3">
                                {report.courses.map((course: any) => (
                                    <Card key={course.id} className="p-5 border-muted bg-card hover:bg-muted/5 transition-colors">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="space-y-1 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-sm">{course.title}</span>
                                                    {course.is_completed && <Badge className="bg-green-100 text-green-700 text-[10px] h-5">Tugallangan</Badge>}
                                                </div>
                                                <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                                                    <span>{course.completed_lessons} / {course.total_lessons} Dars</span>
                                                    {course.last_accessed && (
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            {new Date(course.last_accessed).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 min-w-[200px]">
                                                <div className="flex-1 space-y-1">
                                                    <div className="flex justify-between text-[10px] font-black uppercase text-muted-foreground">
                                                        <span>Progress</span>
                                                        <span>{Math.round(course.progress)}%</span>
                                                    </div>
                                                    <Progress value={course.progress} className="h-1.5" />
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                                {report.courses.length === 0 && (
                                    <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-xl">
                                        {t('admin.reports.noCourses')}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Olympiads Section */}
                        <div className="space-y-4 pb-4">
                            <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
                                <Trophy className="w-5 h-5 text-amber-500" />
                                {t('admin.reports.olympiadResults')}
                            </h3>
                            <div className="grid gap-3">
                                {report.olympiads.map((ol: any) => (
                                    <div key={ol.id} className="flex items-center justify-between p-4 rounded-xl border bg-card hover:border-amber-200 transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "w-10 h-10 rounded-full flex items-center justify-center font-black text-sm transition-transform group-hover:scale-110",
                                                ol.rank === 1 ? "bg-amber-100 text-amber-600" :
                                                    ol.rank === 2 ? "bg-slate-100 text-slate-600" :
                                                        ol.rank === 3 ? "bg-orange-100 text-orange-600" : "bg-muted text-muted-foreground"
                                            )}>
                                                #{ol.rank}
                                            </div>
                                            <div>
                                                <div className="font-bold text-sm">{ol.title}</div>
                                                <div className="text-[10px] text-muted-foreground font-bold flex items-center gap-2 uppercase tracking-tight">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(ol.date).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-black text-primary">{ol.score} Ball</div>
                                            <div className="text-[10px] font-bold text-muted-foreground">{ol.percentage}% | {ol.status}</div>
                                        </div>
                                    </div>
                                ))}
                                {report.olympiads.length === 0 && (
                                    <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-xl">
                                        {t('admin.reports.noOlympiads')}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default StudentReportModal;
