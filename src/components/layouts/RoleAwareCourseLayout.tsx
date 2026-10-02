import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, LayoutDashboard, BookOpen, Settings, Users, BarChart3 } from "lucide-react";
import Header from "@/components/Header";
import DashboardNavbar from "@/components/DashboardNavbar";

/**
 * RoleAwareCourseLayout
 * Wraps the course detail page with a layout that changes based on the user's role.
 * - TEACHER: Teacher contextual top bar with course management links
 * - STUDENT: Minimal student top bar with back to dashboard
 * - Guest: Standard public header (marketing navbar)
 */
interface RoleAwareCourseLayoutProps {
    children: React.ReactNode;
    courseTitle?: string;
    courseId?: string | number;
}

type UserRole = 'STUDENT' | 'TEACHER' | 'ADMIN' | 'guest';

const RoleAwareCourseLayout = ({ children, courseTitle, courseId }: RoleAwareCourseLayoutProps) => {
    const [role, setRole] = useState<UserRole>('guest');
    const navigate = useNavigate();

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        if (!token || !userStr) {
            setRole('guest');
            return;
        }
        try {
            const user = JSON.parse(userStr);
            setRole((user.role as UserRole) || 'guest');
        } catch {
            setRole('guest');
        }
    }, []);

    if (role === 'TEACHER') {
        return (
            <div className="min-h-screen bg-background text-foreground">
                {/* Teacher Contextual Top Bar */}
                <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-border bg-card/95 backdrop-blur-md shadow-sm">
                    <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/teacher/dashboard')}
                                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span className="hidden sm:inline">Dashboard</span>
                            </button>
                            <div className="h-5 w-px bg-border" />
                            {courseTitle && (
                                <span className="text-sm font-bold truncate max-w-[180px] sm:max-w-xs">
                                    {courseTitle}
                                </span>
                            )}
                        </div>

                        {/* Teacher Course Management Actions */}
                        {courseId && (
                            <nav className="flex items-center gap-1">
                                <Link
                                    to={`/teacher/courses/${courseId}/edit`}
                                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                                >
                                    <Settings className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">Tahrirlash</span>
                                </Link>
                                <Link
                                    to={`/teacher/courses/${courseId}/students`}
                                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                                >
                                    <Users className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">Talabalar</span>
                                </Link>
                                <Link
                                    to={`/teacher/courses/${courseId}/stats`}
                                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                                >
                                    <BarChart3 className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">Statistika</span>
                                </Link>
                            </nav>
                        )}
                    </div>
                </header>
                <div className="pt-16">{children}</div>
            </div>
        );
    }

    if (role === 'STUDENT') {
        return (
            <div className="min-h-screen bg-background text-foreground">
                {/* Student Minimal Top Bar */}
                <header className="fixed top-0 left-0 right-0 z-50 h-14 border-b border-border bg-background/95 backdrop-blur-md">
                    <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
                        <button
                            onClick={() => navigate('/courses')}
                            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium group"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                            <LayoutDashboard className="w-4 h-4" />
                            <span className="hidden sm:inline font-bold">Shaxsiy kabinet</span>
                        </button>

                        <div className="flex items-center gap-3">
                            {courseTitle && (
                                <span className="text-xs text-muted-foreground font-medium truncate max-w-[140px] hidden sm:block">
                                    {courseTitle}
                                </span>
                            )}
                            <Link
                                to="/my-courses"
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded-full hover:bg-primary/20 transition-colors"
                            >
                                <BookOpen className="w-3.5 h-3.5" />
                                Kurslarim
                            </Link>
                        </div>
                    </div>
                </header>
                <div className="pt-14">{children}</div>
            </div>
        );
    }

    // ADMIN — same as student bar but pointing to admin
    if (role === 'ADMIN') {
        return (
            <div className="min-h-screen bg-background text-foreground">
                <header className="fixed top-0 left-0 right-0 z-50 h-14 border-b border-border bg-background/95 backdrop-blur-md">
                    <div className="max-w-7xl mx-auto px-6 h-full flex items-center gap-4">
                        <button
                            onClick={() => navigate('/admin/dashboard')}
                            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Admin Panel
                        </button>
                    </div>
                </header>
                <div className="pt-14">{children}</div>
            </div>
        );
    }

    // Guest: standard public header
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Header />
            <div className="pt-16">{children}</div>
        </div>
    );
};

export default RoleAwareCourseLayout;
