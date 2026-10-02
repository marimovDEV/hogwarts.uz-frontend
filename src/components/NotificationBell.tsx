
import { useState, useEffect } from 'react';
import { Bell, Check, Info, Trophy, Zap, BookOpen, AlertTriangle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import axios from 'axios';
import { API_URL, getAuthHeader } from '@/services/api';
import { useNavigate } from 'react-router-dom';
import { cn } from "@/lib/utils";

interface Notification {
    id: number;
    title: string;
    message: string;
    notification_type: 'STREAK' | 'LESSON' | 'OLYMPIAD' | 'SYSTEM' | 'PAYMENT' | 'ACHIEVEMENT';
    is_read: boolean;
    timestamp: string;
    link?: string;
}

const NotificationBell = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Initial Fetch & Polling
    useEffect(() => {
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 60000); // Poll every 60s
        return () => clearInterval(interval);
    }, []);

    // Fetch list when opened
    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen]);

    const fetchUnreadCount = async () => {
        if (!navigator.onLine) return; // Skip polling if offline

        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const res = await axios.get(`${API_URL}/notifications/unread_count/`, {
                headers: getAuthHeader(),
                timeout: 10000 // 10 second timeout to avoid long hangs
            });
            setUnreadCount(res.data.count);
        } catch (error) {
            if (axios.isAxiosError(error) && (!error.response || error.code === 'ECONNABORTED')) {
                // Silently ignore network/timeout errors to avoid console spam
                return;
            }
            console.error("Failed to fetch notification count", error);
        }
    };

    const fetchNotifications = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/notifications/`, { headers: getAuthHeader() });
            setNotifications(res.data.results || res.data); // Handle pagination logic if needed
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkRead = async (id: number) => {
        try {
            await axios.post(`${API_URL}/notifications/${id}/mark_read/`, {}, { headers: getAuthHeader() });
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Failed to mark read", error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await axios.post(`${API_URL}/notifications/mark_all_read/`, {}, { headers: getAuthHeader() });
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error("Failed to mark all read", error);
        }
    };

    const handleClickNotification = (notification: Notification) => {
        if (!notification.is_read) {
            handleMarkRead(notification.id);
        }
        if (notification.link) {
            setIsOpen(false);
            if (notification.link.startsWith('http')) {
                window.location.href = notification.link;
            } else {
                navigate(notification.link);
            }
        }
    };

    // Icons Mapping
    const getIcon = (type: string) => {
        switch (type) {
            case 'STREAK': return <Zap className="w-4 h-4 text-orange-500" />;
            case 'OLYMPIAD': return <Trophy className="w-4 h-4 text-yellow-500" />;
            case 'LESSON': return <BookOpen className="w-4 h-4 text-blue-500" />;
            case 'PAYMENT': return <Check className="w-4 h-4 text-green-500" />;
            case 'ACHIEVEMENT': return <Trophy className="w-4 h-4 text-purple-500" />;
            default: return <Info className="w-4 h-4 text-gray-500" />;
        }
    };

    const getBgColor = (type: string, is_read: boolean) => {
        if (is_read) return 'bg-card';
        switch (type) {
            case 'STREAK': return 'bg-orange-50 dark:bg-orange-900/10 border-l-2 border-orange-500';
            case 'OLYMPIAD': return 'bg-yellow-50 dark:bg-yellow-900/10 border-l-2 border-yellow-500';
            default: return 'bg-blue-50 dark:bg-blue-900/10 border-l-2 border-blue-500';
        }
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <div className="relative cursor-pointer">
                    <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground hover:bg-muted/10 rounded-full transition-all">
                        <Bell className="w-5 h-5" />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#1a1f37]" />
                        )}
                    </Button>
                </div>
            </PopoverTrigger>
            <PopoverContent className="w-80 md:w-96 p-0 shadow-xl border-border bg-card" align="end">
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <h4 className="font-semibold text-sm">Bildirishnomalar</h4>
                    {unreadCount > 0 && (
                        <Button variant="ghost" size="sm" onClick={handleMarkAllRead} className="text-xs h-8 text-blue-600 dark:text-blue-400 hover:text-blue-700">
                            Hammasini o'qish
                        </Button>
                    )}
                </div>
                <ScrollArea className="h-[400px]">
                    {loading ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">Yuklanmoqda...</div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                            <Bell className="w-8 h-8 opacity-20 mb-2" />
                            <p className="text-sm">Hozircha xabarlar yo'q</p>
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            {notifications.map((n) => (
                                <div
                                    key={n.id}
                                    onClick={() => handleClickNotification(n)}
                                    className={cn(
                                        "p-4 cursor-pointer transition-colors hover:bg-muted/50 border-b border-border last:border-0",
                                        !n.is_read && "bg-blue-50/50 dark:bg-blue-900/10"
                                    )}
                                >
                                    <div className="flex gap-3">
                                        <div className="mt-1 flex-shrink-0">
                                            <div className="w-8 h-8 rounded-full bg-card shadow-sm flex items-center justify-center">
                                                {getIcon(n.notification_type)}
                                            </div>
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex justify-between items-start">
                                                <p className={cn("text-sm font-medium leading-none", !n.is_read ? "text-foreground" : "text-muted-foreground")}>
                                                    {n.title}
                                                </p>
                                                <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                                                    {n.timestamp.split(' ')[0]}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                {n.message}
                                            </p>
                                        </div>
                                        {!n.is_read && (
                                            <div className="flex items-center justify-center">
                                                <div className="w-2 h-2 rounded-full bg-blue-600" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
                <div className="p-2 border-t border-border bg-muted/20">
                    <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground h-8">
                        Barcha xabarlarni ko'rish
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
};

export default NotificationBell;
