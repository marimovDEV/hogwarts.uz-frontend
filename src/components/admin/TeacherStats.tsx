
import {
    Users,
    BookOpen,
    Wallet,
    Star,
    Trophy,
    CheckCircle2,
    XCircle,
    TrendingUp,
    ShieldCheck
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface StatsData {
    courses: number;
    students: number;
    revenue: number;
    olympiads: number;
    rating: number;
    is_verified: boolean;
    is_identity_verified: boolean;
}

interface TeacherStatsProps {
    stats: StatsData;
    className?: string;
}

const TeacherStats = ({ stats, className }: TeacherStatsProps) => {
    const { t } = useTranslation();

    const formatRevenue = (val: number) => {
        return new Intl.NumberFormat('uz-UZ', { style: 'currency', currency: 'UZS', maximumFractionDigits: 0 }).format(val);
    };

    const statItems = [
        {
            label: t('admin.coursesCount'),
            value: stats.courses,
            icon: BookOpen,
            color: "text-blue-600",
            bg: "bg-blue-500/10",
        },
        {
            label: t('admin.studentsCount'),
            value: stats.students,
            icon: Users,
            color: "text-purple-600",
            bg: "bg-purple-500/10",
        },
        {
            label: t('admin.totalRevenue'),
            value: formatRevenue(stats.revenue),
            icon: Wallet,
            color: "text-green-600",
            bg: "bg-green-500/10",
        },
        {
            label: t('admin.olympiadsCount'),
            value: stats.olympiads,
            icon: Trophy,
            color: "text-amber-600",
            bg: "bg-amber-500/10",
        }
    ];

    return (
        <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", className)}>
            {statItems.map((item, idx) => (
                <Card key={idx} className="border-none bg-card/50 shadow-sm overflow-hidden group">
                    <CardContent className="p-6 relative">
                        <div className={cn("absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-10 transition-transform group-hover:scale-110", item.bg)} />
                        <div className="flex items-center gap-4">
                            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shadow-lg shadow-black/5", item.bg)}>
                                <item.icon className={cn("w-6 h-6", item.color)} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">{item.label}</p>
                                <p className="text-xl font-black text-foreground">{item.value}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

export default TeacherStats;
