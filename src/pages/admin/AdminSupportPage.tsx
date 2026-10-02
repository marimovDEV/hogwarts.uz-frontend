import { useState, useEffect } from "react";
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
    MoreHorizontal,
    FileText,
    Filter,
    RefreshCw,
    Mail,
    CheckCircle2,
    Eye,
    Lock,
    Pencil,
    Calendar as CalendarIcon,
    X
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "react-i18next";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// Import Custom Components
import SupportAnalytics from "@/components/admin/support/SupportAnalytics";
import TicketDetailDialog from "@/components/admin/support/TicketDetailDialog";

import axios from "axios";
import { API_URL, getAuthHeader } from "@/services/api";

// Types
interface Ticket {
    id: string;
    ticket_number: string;
    user: {
        id: number;
        username: string;
        full_name: string;
        email: string;
    };
    subject: string;
    category: "Payment" | "Technical" | "Course" | "Olympiad";
    priority: "LOW" | "MEDIUM" | "HIGH";
    priority_display: string;
    status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "ESCALATED" | "PENDING";
    status_display: string;
    created_at: string;
    updated_at: string;
    last_message: string;
    messages_count: number;
    isNew?: boolean; // For animation
}

const AdminSupportPage = () => {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // Advanced Filters
    const [statusFilter, setStatusFilter] = useState("all");
    const [priorityFilter, setPriorityFilter] = useState("all");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [dateRange, setDateRange] = useState<Date | undefined>();

    // Interactive States
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [selectedTicketIds, setSelectedTicketIds] = useState<string[]>([]);

    const { toast } = useToast();
    const { t } = useTranslation();

    const [stats, setStats] = useState({
        categories: [],
        performance: [],
        responseTime: []
    });
    const [statsLoading, setStatsLoading] = useState(true);

    useEffect(() => {
        fetchTickets();
        fetchStats();
        const interval = setInterval(() => {
            fetchTickets();
            fetchStats();
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchTickets = async () => {
        try {
            const res = await axios.get(`${API_URL}/support/`, { headers: getAuthHeader() });
            // Handle pagination if results is wrapped
            const data = res.data.results || res.data;
            setTickets(data);
        } catch (error) {
            console.error("Fetch tickets error:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const res = await axios.get(`${API_URL}/support/stats/`, { headers: getAuthHeader() });
            if (res.data.success) {
                setStats({
                    categories: res.data.categories,
                    performance: res.data.performance,
                    responseTime: res.data.response_time
                });
            }
        } catch (error) {
            console.error("Fetch support stats error:", error);
        } finally {
            setStatsLoading(false);
        }
    };

    // FILTER LOGIC
    const filteredTickets = tickets.filter(ticket => {
        const matchesSearch = ticket.user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ticket.user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ticket.ticket_number.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
        const matchesPriority = priorityFilter === "all" || ticket.priority === priorityFilter;
        const matchesCategory = categoryFilter === "all" || ticket.category === categoryFilter;

        return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
    });

    // HANDLERS
    const handleStatusChange = async (newStatus: string) => {
        if (!selectedTicket) return;

        try {
            await axios.patch(`${API_URL}/support/${selectedTicket.id}/`, {
                status: newStatus
            }, { headers: getAuthHeader() });

            toast({ title: t('admin.statusChanged'), description: t('admin.ticketStatusChanged', { number: selectedTicket.ticket_number }) });
            fetchTickets();

            // Update selected ticket in place to show in dialog
            setSelectedTicket(prev => prev ? { ...prev, status: newStatus as any } : null);
        } catch (error) {
            toast({ title: t('common.error'), description: t('admin.statusUpdateError'), variant: "destructive" });
        }
    };

    const handleReply = async (message: string, isInternal: boolean = false) => {
        if (!selectedTicket) return;

        try {
            await axios.post(`${API_URL}/support/${selectedTicket.id}/reply/`, {
                message,
                is_internal: isInternal
            }, { headers: getAuthHeader() });

            toast({ title: t('admin.replySent'), description: isInternal ? t('admin.internalNoteSaved') : t('admin.replyDelivered') });
            fetchTickets();
        } catch (error) {
            toast({ title: t('common.error'), description: t('admin.replySendError'), variant: "destructive" });
        }
    };

    const toggleSelect = (id: string) => {
        if (selectedTicketIds.includes(id)) {
            setSelectedTicketIds(selectedTicketIds.filter(tid => tid !== id));
        } else {
            setSelectedTicketIds([...selectedTicketIds, id]);
        }
    };

    const handleBulkAction = async (action: string) => {
        if (selectedTicketIds.length === 0) return;

        if (action === "resolve") {
            try {
                const res = await axios.post(`${API_URL}/support/bulk_resolve/`, {
                    ids: selectedTicketIds
                }, { headers: getAuthHeader() });

                if (res.data.success) {
                    toast({
                        title: t('admin.bulkAction'),
                        description: t('admin.ticketsClosed')
                    });
                    fetchTickets();
                }
            } catch (error) {
                toast({
                    title: t('common.error'),
                    description: t('admin.bulkResolveError'),
                    variant: "destructive"
                });
            }
        }

        setSelectedTicketIds([]);
    };

    // Render Helpers
    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'HIGH': return <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-200 border-red-200">{t('admin.priorityHigh')}</Badge>;
            case 'MEDIUM': return <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border-yellow-200">{t('admin.priorityMedium')}</Badge>;
            case 'LOW': return <Badge variant="outline" className="text-gray-500">{t('admin.priorityLow')}</Badge>;
            default: return <Badge variant="outline">{priority}</Badge>;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'OPEN': return <Badge className="bg-green-100 text-green-700 border-green-200 animate-pulse">{t('admin.statusOpen')}</Badge>;
            case 'IN_PROGRESS': return <Badge className="bg-blue-50 text-blue-700 border-blue-200">{t('admin.statusInProgress')}</Badge>;
            case 'RESOLVED': return <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200"><CheckCircle2 className="w-3 h-3 mr-1" />{t('admin.statusResolved')}</Badge>;
            case 'ESCALATED': return <Badge variant="destructive" className="bg-orange-100 text-orange-800 border-orange-200">{t('admin.statusEscalated')}</Badge>;
            case 'PENDING': return <Badge variant="secondary" className="bg-gray-100 text-gray-600 border-gray-200">{t('admin.statusPending')}</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black text-foreground">{t('admin.supportSection.title')}</h1>
                    <p className="text-muted-foreground">{t('admin.supportSubtitle')}</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => { toast({ title: t('common.refresh'), description: t('admin.dataRefreshed') }) }}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        {t('admin.refresh')}
                    </Button>
                    <Button variant="hero" className="shadow-lg shadow-blue-200">
                        <FileText className="w-4 h-4 mr-2" />
                        {t('admin.reportPdf')}
                    </Button>
                </div>
            </div>

            {/* Analytics Section */}
            <SupportAnalytics
                categoryData={stats.categories}
                performanceData={stats.performance}
                responseTimeData={stats.responseTime}
                isLoading={statsLoading}
            />

            {/* Main Table Card */}
            <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden min-h-[600px] flex flex-col">
                {/* Advanced Toolbar */}
                <div className="p-4 border-b border-border flex flex-col gap-4 bg-muted/30">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder={t('admin.searchSupportPlaceholder')}
                                className="pl-9 bg-card border-border"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Filtering */}
                        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                            <Filter className="w-4 h-4 text-muted-foreground mr-1" />
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[130px] bg-card text-xs h-9 border-border">
                                    <SelectValue placeholder={t('admin.status')} />
                                </SelectTrigger>
                                <SelectContent className="bg-card border-border">
                                    <SelectItem value="all">{t('common.all')}</SelectItem>
                                    <SelectItem value="OPEN">{t('admin.statusOpen')}</SelectItem>
                                    <SelectItem value="IN_PROGRESS">{t('admin.statusInProgress')}</SelectItem>
                                    <SelectItem value="PENDING">{t('admin.statusPending')}</SelectItem>
                                    <SelectItem value="RESOLVED">{t('admin.statusResolved')}</SelectItem>
                                    <SelectItem value="ESCALATED">{t('admin.statusEscalated')}</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                                <SelectTrigger className="w-[130px] bg-card text-xs h-9 border-border">
                                    <SelectValue placeholder={t('admin.priority')} />
                                </SelectTrigger>
                                <SelectContent className="bg-card border-border">
                                    <SelectItem value="all">{t('common.all')}</SelectItem>
                                    <SelectItem value="HIGH">{t('admin.priorityHigh')}</SelectItem>
                                    <SelectItem value="MEDIUM">{t('admin.priorityMedium')}</SelectItem>
                                    <SelectItem value="LOW">{t('admin.priorityLow')}</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                <SelectTrigger className="w-[130px] bg-card text-xs h-9 border-border">
                                    <SelectValue placeholder={t('admin.category')} />
                                </SelectTrigger>
                                <SelectContent className="bg-card border-border">
                                    <SelectItem value="all">{t('common.all')}</SelectItem>
                                    <SelectItem value="Payment">{t('admin.ticketCategories.Payment')}</SelectItem>
                                    <SelectItem value="Technical">{t('admin.ticketCategories.Technical')}</SelectItem>
                                    <SelectItem value="Course">{t('admin.ticketCategories.Course')}</SelectItem>
                                    <SelectItem value="Olympiad">{t('admin.ticketCategories.Olympiad')}</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Date Range Simulation */}
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-[140px] justify-start text-left font-normal text-xs h-9 bg-card border-border",
                                            !dateRange && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {dateRange ? format(dateRange, "PPP") : <span>{t('common.date')}</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={dateRange}
                                        onSelect={setDateRange}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>

                        </div>
                    </div>

                    {/* Bulk Selection Actions */}
                    {selectedTicketIds.length > 0 && (
                        <div className="flex items-center gap-4 bg-blue-50 p-2 rounded-lg border border-blue-100 animate-in fade-in slide-in-from-top-2">
                            <span className="text-sm font-bold text-blue-700 ml-2">{t('admin.selectedTickets', { count: selectedTicketIds.length })}</span>
                            <div className="h-4 w-px bg-blue-200" />
                            <Button size="sm" variant="ghost" className="text-blue-700 hover:text-blue-800 hover:bg-blue-100" onClick={() => handleBulkAction("resolve")}>
                                <CheckCircle2 className="w-4 h-4 mr-2" /> {t('admin.resolved')}
                            </Button>
                            <Button size="sm" variant="ghost" className="text-blue-700 hover:text-blue-800 hover:bg-blue-100">
                                <Mail className="w-4 h-4 mr-2" /> {t('admin.sendEmail')}
                            </Button>
                        </div>
                    )}
                </div>

                {/* Ticket List */}
                <div className="flex-1 overflow-auto">
                    <Table>
                        <TableHeader className="bg-muted/50 sticky top-0 z-10 shadow-sm border-b border-border">
                            <TableRow>
                                <TableHead className="w-[50px]">
                                    <Checkbox
                                        checked={selectedTicketIds.length === filteredTickets.length && filteredTickets.length > 0}
                                        onCheckedChange={(checked) => {
                                            if (checked) setSelectedTicketIds(filteredTickets.map(t => t.id));
                                            else setSelectedTicketIds([]);
                                        }}
                                    />
                                </TableHead>
                                <TableHead className="w-[100px]">{t('admin.id')}</TableHead>
                                <TableHead>{t('admin.user')}</TableHead>
                                <TableHead>{t('admin.subjectCategory')}</TableHead>
                                <TableHead>{t('admin.status')}</TableHead>
                                <TableHead>{t('common.date')}</TableHead>
                                <TableHead>{t('admin.priority')}</TableHead>
                                <TableHead className="text-right">{t('admin.actions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredTickets.map((ticket) => (
                                <TableRow
                                    key={ticket.id}
                                    className={`cursor-pointer group transition-colors ${selectedTicketIds.includes(ticket.id) ? "bg-blue-500/10 hover:bg-blue-500/20" : "hover:bg-muted/50"} ${ticket.isNew ? "animate-pulse bg-green-500/10" : ""}`}
                                    onClick={(e) => {
                                        // Prevent opening dialog if clicking checkbox or buttons
                                        if ((e.target as HTMLElement).closest('[role="checkbox"]') || (e.target as HTMLElement).closest('button')) return;
                                        setSelectedTicket(ticket);
                                    }}
                                >
                                    <TableCell>
                                        <Checkbox
                                            checked={selectedTicketIds.includes(ticket.id)}
                                            onCheckedChange={() => toggleSelect(ticket.id)}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-mono text-xs text-muted-foreground group-hover:text-blue-500 font-medium">{ticket.ticket_number}</span>
                                        {ticket.isNew && <Badge className="ml-2 bg-green-500 text-[10px] px-1 py-0 h-4">{t('common.new')}</Badge>}
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-bold text-foreground">{ticket.user.full_name || ticket.user.username}</div>
                                        <div className="text-xs text-muted-foreground">{ticket.user.email}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium text-foreground/90">{t(ticket.subject as any)}</div>
                                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                            <span className="bg-muted px-1.5 py-0.5 rounded text-muted-foreground border border-border">{t(`admin.ticketCategories.${ticket.category}` as any)}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {getStatusBadge(ticket.status)}
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground">{new Date(ticket.created_at).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        {getPriorityBadge(ticket.priority)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <TooltipProvider>
                                            <div className="flex justify-end gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={() => setSelectedTicket(ticket)}>
                                                            <Eye className="w-4 h-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>{t('common.view')}</TooltipContent>
                                                </Tooltip>

                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-gray-900 hover:bg-gray-100" onClick={() => setSelectedTicket(ticket)}>
                                                            <Pencil className="w-4 h-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>{t('admin.edit')}</TooltipContent>
                                                </Tooltip>

                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50" onClick={(e) => { e.stopPropagation(); toast({ title: t('admin.closed'), description: t('admin.ticketClosed') }) }}>
                                                            <Lock className="w-4 h-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>{t('common.close')}</TooltipContent>
                                                </Tooltip>
                                            </div>
                                        </TooltipProvider>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Detail Dialog */}
            <TicketDetailDialog
                ticket={selectedTicket}
                isOpen={!!selectedTicket}
                onClose={() => setSelectedTicket(null)}
                onStatusChange={handleStatusChange}
                onReply={handleReply}
            />

        </div>
    );
};

export default AdminSupportPage;
