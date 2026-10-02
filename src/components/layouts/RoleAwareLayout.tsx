import { useState, useEffect } from "react";
import DashboardLayout from "../DashboardLayout";
import TeacherLayout from "../TeacherLayout";
import PublicLayout from "./PublicLayout";

const RoleAwareLayout = () => {
    const [role, setRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkRole = () => {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                try {
                    const user = JSON.parse(userStr);
                    setRole(user.role);
                } catch (e) {
                    setRole(null);
                }
            } else {
                setRole(null);
            }
            setLoading(false);
        };

        checkRole();

        // Listen for storage changes (login/logout in other tabs)
        window.addEventListener('storage', checkRole);
        return () => window.removeEventListener('storage', checkRole);
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (role === 'STUDENT') {
        return <DashboardLayout />;
    }

    if (role === 'TEACHER') {
        return <TeacherLayout />;
    }

    return <PublicLayout />;
};

export default RoleAwareLayout;
