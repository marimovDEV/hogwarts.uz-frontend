import { useState, useEffect, useMemo } from "react";
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
    Search,
    Users,
    MoreHorizontal,
    UserPlus,
    Filter,
    Eye,
    Edit,
    Ban,
    CheckCircle,
    Smartphone,
    SlidersHorizontal,
    Loader2,
    Shield,
    Mail,
    Calendar,
    ChevronDown,
    Trash2,
    CheckSquare,
    Square,
    XCircle,
    Copy,
    ArrowUpDown,
    Lock,
    BarChart3
} from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { API_URL, getAuthHeader } from "@/services/api";
import { Checkbox } from "@/components/ui/checkbox";
import { formatDistanceToNow } from 'date-fns';
import { uz, ru } from 'date-fns/locale';
import StudentReportModal from "@/components/admin/StudentReportModal";

interface User {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
    role: "STUDENT" | "TEACHER" | "ADMIN";
    is_active: boolean;
    last_login: string;
    date_joined: string;
}

const AdminUsersPage = () => {
    const { t, i18n } = useTranslation();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    // Dialog States
    const [isAddUserOpen, setIsAddUserOpen] = useState(false);
    const [newUser, setNewUser] = useState({
        username: "",
        first_name: "",
        last_name: "",
        phone: "+998",
        role: "STUDENT",
        password: ""
    });

    const [reportUserId, setReportUserId] = useState<number | null>(null);
    const [isReportOpen, setIsReportOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    // Password Reset State
    const [passwordResetDialogOpen, setPasswordResetDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [newPass, setNewPass] = useState("");
    const [confirmPass, setConfirmPass] = useState("");

    const dateLocale = i18n.language === 'ru' ? ru : uz;

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/users/`, { headers: getAuthHeader() });
            setUsers(res.data.results || res.data);
        } catch (error) {
            console.error(error);
            toast.error(t('common.error'));
        } finally {
            setLoading(false);
        }
    };

    // FILTER LOGIC
    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username;
            const matchesSearch = fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (user.phone && user.phone.includes(searchQuery)) ||
                user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchesRole = roleFilter === "all" || user.role === roleFilter;
            const matchesStatus = statusFilter === "all" || (statusFilter === "Active" ? user.is_active : !user.is_active);

            return matchesSearch && matchesRole && matchesStatus;
        });
    }, [users, searchQuery, roleFilter, statusFilter]);

    // SELECTION LOGIC
    const toggleSelectAll = () => {
        if (selectedIds.length === filteredUsers.length && filteredUsers.length > 0) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredUsers.map(u => u.id));
        }
    };

    const toggleSelect = (id: number) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    // HANDLERS
    const handleAddUser = async () => {
        if (!newUser.username || !newUser.password) {
            toast.error(t('error.missing_data'));
            return;
        }

        setIsSubmitting(true);
        try {
            await axios.post(`${API_URL}/users/`, newUser, { headers: getAuthHeader() });
            toast.success(t('success.successMessage'));
            setIsAddUserOpen(false);
            setNewUser({ username: "", first_name: "", last_name: "", phone: "+998", role: "STUDENT", password: "" });
            fetchUsers();
        } catch (error) {
            toast.error(t('common.error'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleStatusChange = async (userId: number, newStatus: boolean) => {
        try {
            await axios.patch(`${API_URL}/users/${userId}/`, { is_active: newStatus }, { headers: getAuthHeader() });
            setUsers(users.map(u => u.id === userId ? { ...u, is_active: newStatus } : u));
            toast.success(newStatus ? t('common.activate') : t('common.block'));
        } catch (error) {
            toast.error(t('common.error'));
        }
    };

    const handleBulkStatus = async (is_active: boolean) => {
        try {
            await axios.post(`${API_URL}/users/bulk_status_update/`, { user_ids: selectedIds, is_active }, { headers: getAuthHeader() });
            setUsers(users.map(u => selectedIds.includes(u.id) && u.role !== 'ADMIN' ? { ...u, is_active } : u));
            toast.success(t('success.successMessage'));
            setSelectedIds([]);
        } catch (error) {
            toast.error(t('common.error'));
        }
    };

    const handleBulkRoleChange = async (role: string) => {
        try {
            await axios.post(`${API_URL}/users/bulk_role_update/`, { user_ids: selectedIds, role }, { headers: getAuthHeader() });
            toast.success(t('success.successMessage'));
            fetchUsers();
            setSelectedIds([]);
        } catch (error) {
            toast.error(t('common.error'));
        }
    };

    const handleSaveEdit = async () => {
        if (!editingUser) return;
        try {
            await axios.patch(`${API_URL}/users/${editingUser.id}/`, editingUser, { headers: getAuthHeader() });
            toast.success(t('success.successMessage'));
            fetchUsers();
            setEditingUser(null);
        } catch (e) {
            toast.error(t('common.error'));
        }
    };

    const handleResetPassword = async () => {
        if (!selectedUser) return;
        if (newPass.length < 6) {
            toast.error(t('common.resetPasswordDesc'));
            return;
        }
        if (newPass !== confirmPass) {
            toast.error(t('common.passwordsDoNotMatch'));
            return;
        }

        setIsSubmitting(true);
        try {
            await axios.post(`${API_URL}/users/${selectedUser.id}/reset_password/`, {
                new_password: newPass
            }, { headers: getAuthHeader() });

            toast.success(t('common.passwordResetSuccess'));
            setPasswordResetDialogOpen(false);
            setNewPass("");
            setConfirmPass("");
        } catch (error) {
            toast.error(t('common.passwordResetError'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusBadge = (user: User) => {
        if (user.is_active) return <Badge className="bg-green-100 hover:bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-500 border-green-200 dark:border-green-900/30">{t('common.active')}</Badge>;
        return <Badge variant="destructive" className="bg-red-100 hover:bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-500 border-red-200 dark:border-red-900/30">{t('common.blocked')}</Badge>;
    };

    const getRoleBadge = (role: string) => {
        const styles = {
            ADMIN: "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 border-purple-200 dark:border-purple-900/30",
            TEACHER: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-900/30",
            STUDENT: "bg-gray-100 text-gray-700 dark:bg-white/5 dark:text-gray-400 border-gray-200 dark:border-white/10"
        };
        return <Badge className={`font-bold text-[10px] tracking-wider uppercase border ${styles[role as keyof typeof styles]}`}>{role}</Badge>;
    };

    return (
        <div className="space-y-8 pb-24">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-6 rounded-2xl border border-border shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                        <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-foreground tracking-tight">{t('admin.users.title')}</h1>
                        <p className="text-muted-foreground text-sm font-medium">{t('admin.usersSubtitle')}</p>
                    </div>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                        <DialogTrigger asChild>
                            <Button className="flex-1 md:flex-none bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 rounded-xl h-11 px-6">
                                <UserPlus className="w-4 h-4 mr-2" />
                                {t('admin.addUser')}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md rounded-2xl">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-black tracking-tight">{t('admin.addUserTitle')}</DialogTitle>
                                <DialogDescription>{t('admin.addUserDesc')}</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">{t('admin.username')}</label>
                                    <Input placeholder="example_user" value={newUser.username} onChange={e => setNewUser({ ...newUser, username: e.target.value })} className="rounded-xl h-11" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">{t('common.firstName')}</label>
                                        <Input placeholder="Ali" value={newUser.first_name} onChange={e => setNewUser({ ...newUser, first_name: e.target.value })} className="rounded-xl h-11" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">{t('common.lastName')}</label>
                                        <Input placeholder="Valiyev" value={newUser.last_name} onChange={e => setNewUser({ ...newUser, last_name: e.target.value })} className="rounded-xl h-11" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">{t('common.phone')}</label>
                                    <Input placeholder="+998" value={newUser.phone} onChange={e => setNewUser({ ...newUser, phone: e.target.value })} className="rounded-xl h-11" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">{t('common.password')}</label>
                                    <Input type="password" placeholder="******" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} className="rounded-xl h-11" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">{t('common.role')}</label>
                                    <Select value={newUser.role || ""} onValueChange={val => setNewUser({ ...newUser, role: val as any })}>
                                        <SelectTrigger className="rounded-xl h-11">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="STUDENT">{t('admin.role_student')}</SelectItem>
                                            <SelectItem value="TEACHER">{t('admin.role_teacher')}</SelectItem>
                                            <SelectItem value="ADMIN">{t('admin.role_admin')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsAddUserOpen(false)} className="rounded-xl h-11">{t('common.cancel')}</Button>
                                <Button onClick={handleAddUser} disabled={isSubmitting} className="rounded-xl h-11 bg-primary px-8">
                                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : t('common.save')}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Filter Toolbar */}
            <div className="bg-card p-4 rounded-2xl border border-border shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder={t('admin.usersSearchPlaceholder')}
                        className="pl-9 h-11 rounded-xl bg-muted/30 border-border border-2 focus-visible:border-primary/50 transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex w-full md:w-auto gap-3 items-center">
                    <div className="flex bg-muted/30 p-1 rounded-xl border border-border">
                        <Button
                            variant={roleFilter === "all" ? "secondary" : "ghost"}
                            size="sm"
                            className="text-xs font-bold px-4 rounded-lg h-8"
                            onClick={() => setRoleFilter("all")}
                        >
                            {t('common.all')}
                        </Button>
                        <Button
                            variant={roleFilter === "STUDENT" ? "secondary" : "ghost"}
                            size="sm"
                            className="text-xs font-bold px-4 rounded-lg h-8"
                            onClick={() => setRoleFilter("STUDENT")}
                        >
                            {t('admin.students.title')}
                        </Button>
                        <Button
                            variant={roleFilter === "TEACHER" ? "secondary" : "ghost"}
                            size="sm"
                            className="text-xs font-bold px-4 rounded-lg h-8"
                            onClick={() => setRoleFilter("TEACHER")}
                        >
                            {t('admin.teachers.title')}
                        </Button>
                    </div>

                    <Select value={statusFilter || ""} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[140px] h-10 rounded-xl border-border bg-card">
                            <SelectValue placeholder={t('common.status')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('admin.allStatus')}</SelectItem>
                            <SelectItem value="Active">{t('admin.activeUsers')}</SelectItem>
                            <SelectItem value="Blocked">{t('admin.blockedUsers')}</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button variant="outline" size="icon" onClick={fetchUsers} className="rounded-xl h-10 w-10 border-border">
                        <Loader2 className={`w-4 h-4 text-muted-foreground ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </div>

            {/* Table Area */}
            <div className="bg-card rounded-2xl shadow-md border border-border overflow-hidden relative">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-muted/50 border-b border-border">
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="w-[50px]">
                                    <Checkbox
                                        checked={selectedIds.length === filteredUsers.length && filteredUsers.length > 0}
                                        onCheckedChange={toggleSelectAll}
                                        className="rounded-md"
                                    />
                                </TableHead>
                                <TableHead className="w-[80px] text-xs font-black uppercase tracking-wider text-muted-foreground">ID</TableHead>
                                <TableHead className="text-xs font-black uppercase tracking-wider text-muted-foreground">{t('common.user')}</TableHead>
                                <TableHead className="text-xs font-black uppercase tracking-wider text-muted-foreground">{t('common.contact')}</TableHead>
                                <TableHead className="text-xs font-black uppercase tracking-wider text-muted-foreground">{t('admin.roleStatus')}</TableHead>
                                <TableHead className="text-xs font-black uppercase tracking-wider text-muted-foreground">{t('common.lastLogin')}</TableHead>
                                <TableHead className="text-right text-xs font-black uppercase tracking-wider text-muted-foreground">{t('common.actions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-20">
                                        <div className="flex flex-col items-center gap-4">
                                            <Loader2 className="w-10 h-10 animate-spin text-primary" />
                                            <p className="text-muted-foreground font-medium">{t('common.loading')}...</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : filteredUsers.map((user) => (
                                <TableRow key={user.id} className={`hover:bg-muted/30 border-b border-border transition-colors group ${selectedIds.includes(user.id) ? 'bg-primary/5' : ''}`}>
                                    <TableCell>
                                        <Checkbox
                                            checked={selectedIds.includes(user.id)}
                                            onCheckedChange={() => toggleSelect(user.id)}
                                            className="rounded-md"
                                        />
                                    </TableCell>
                                    <TableCell className="font-mono text-[11px] text-muted-foreground font-bold">#{user.id}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center font-black text-xs text-muted-foreground border border-border shadow-sm group-hover:border-primary/30 transition-all">
                                                {user.first_name?.[0]}{user.last_name?.[0] || user.username[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-bold text-foreground group-hover:text-primary transition-colors">
                                                    {user.first_name} {user.last_name}
                                                </div>
                                                <div className="text-[10px] font-black text-muted-foreground uppercase opacity-70 tracking-tighter">
                                                    @{user.username} • {new Date(user.date_joined).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-xs font-medium text-foreground/80">
                                                <Smartphone className="w-3.5 h-3.5 text-muted-foreground" />
                                                {user.phone || '-'}
                                            </div>
                                            {user.email && (
                                                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                                    <Mail className="w-3.5 h-3.5" />
                                                    {user.email}
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1.5 items-start">
                                            {getRoleBadge(user.role)}
                                            {getStatusBadge(user)}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground">
                                        {user.last_login ? (
                                            <div className="flex flex-col">
                                                <span className="font-bold text-foreground/70">
                                                    {formatDistanceToNow(new Date(user.last_login), { addSuffix: true, locale: dateLocale })}
                                                </span>
                                                <span className="text-[10px] opacity-60">
                                                    {new Date(user.last_login).toLocaleString(i18n.language === 'uz' ? 'uz-UZ' : 'ru-RU', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="opacity-50 font-black italic">{t('common.neverLoggedIn')}</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-muted border border-transparent hover:border-border rounded-xl transition-all">
                                                    <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48 p-2 rounded-2xl border-border shadow-2xl">
                                                <DropdownMenuLabel className="px-2 py-1.5 text-[10px] uppercase font-black tracking-widest text-muted-foreground">{t('common.management')}</DropdownMenuLabel>
                                                <DropdownMenuItem className="cursor-pointer gap-2 rounded-xl focus:bg-primary/10 mb-1" onClick={() => setEditingUser(user)}>
                                                    <Edit className="w-4 h-4" /> {t('common.edit')}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="cursor-pointer gap-2 rounded-xl focus:bg-primary/10 mb-1">
                                                    <Eye className="w-4 h-4" /> {t('common.viewProfile')}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="cursor-pointer gap-2 rounded-xl focus:bg-primary/10 transition-all" onClick={() => {
                                                    navigator.clipboard.writeText(user.id.toString());
                                                    toast.success(t('common.idCopied'));
                                                }}>
                                                    <Copy className="w-4 h-4" /> {t('common.copyId')}
                                                </DropdownMenuItem>

                                                <DropdownMenuSeparator className="my-1 border-white/5" />

                                                {user.is_active ? (
                                                    <DropdownMenuItem
                                                        className="cursor-pointer gap-2 rounded-xl text-red-600 focus:text-red-700 focus:bg-red-50 dark:focus:bg-red-900/20 font-bold"
                                                        onClick={() => handleStatusChange(user.id, false)}
                                                        disabled={user.role === 'ADMIN'}
                                                    >
                                                        <Ban className="w-4 h-4" /> {t('common.block')}
                                                    </DropdownMenuItem>
                                                ) : (
                                                    <DropdownMenuItem
                                                        className="cursor-pointer gap-2 rounded-xl text-green-600 focus:text-green-700 focus:bg-green-50 dark:focus:bg-green-900/20 font-bold"
                                                        onClick={() => handleStatusChange(user.id, true)}
                                                    >
                                                        <CheckCircle className="w-4 h-4" /> {t('common.activate')}
                                                    </DropdownMenuItem>
                                                )}

                                                <DropdownMenuSeparator className="my-1 border-white/5" />

                                                <DropdownMenuItem
                                                    className="cursor-pointer gap-2 rounded-xl focus:bg-primary/10 transition-all font-bold"
                                                    onClick={() => { setSelectedUser(user); setPasswordResetDialogOpen(true); }}
                                                >
                                                    <Lock className="w-4 h-4 text-orange-500" /> {t('common.resetPassword')}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {!loading && filteredUsers.length === 0 && (
                    <div className="py-32 flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
                            <Search className="w-10 h-10 text-muted-foreground opacity-20" />
                        </div>
                        <h3 className="text-xl font-black text-foreground tracking-tight">{t('common.noUsersFound')}</h3>
                        <p className="text-muted-foreground max-w-xs mt-2 font-medium">{t('common.noUsersFoundDesc')}</p>
                        <Button
                            variant="outline"
                            className="mt-8 rounded-xl px-8 border-2"
                            onClick={() => { setSearchQuery(""); setRoleFilter("all"); setStatusFilter("all"); }}
                        >
                            {t('common.clearFilters')}
                        </Button>
                    </div>
                )}
            </div>

            {/* Selection Mass Action Bar */}
            {selectedIds.length > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-card border border-primary/20 shadow-2xl rounded-2xl px-6 py-4 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300 flex items-center gap-8 min-w-[500px]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-black text-lg">
                            {selectedIds.length}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-black text-foreground">{t('common.selected')}</span>
                            <button onClick={() => setSelectedIds([])} className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-red-500 transition-colors">{t('common.clearSelection')}</button>
                        </div>
                    </div>

                    <div className="h-10 w-px bg-border mx-2" />

                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            variant="destructive"
                            className="rounded-xl h-10 px-4 font-bold gap-2"
                            onClick={() => handleBulkStatus(false)}
                        >
                            <Ban className="w-4 h-4" /> {t('common.block')}
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            className="rounded-xl h-10 px-4 font-bold gap-2 border-green-200 text-green-700 hover:bg-green-50"
                            onClick={() => handleBulkStatus(true)}
                        >
                            <CheckCircle className="w-4 h-4" /> {t('common.activate')}
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button size="sm" variant="outline" className="rounded-xl h-10 px-4 font-bold gap-2">
                                    {t('admin.changeRole')} <ChevronDown className="w-4 h-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="p-2 rounded-xl">
                                <DropdownMenuItem className="cursor-pointer gap-2 rounded-lg" onClick={() => handleBulkRoleChange('STUDENT')}>{t('admin.role_student')}</DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer gap-2 rounded-lg" onClick={() => handleBulkRoleChange('TEACHER')}>{t('admin.role_teacher')}</DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer gap-2 rounded-lg text-red-600 font-bold" onClick={() => handleBulkRoleChange('ADMIN')}>{t('admin.role_admin')}</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            )}

            {/* Edit User Dialog */}
            <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
                <DialogContent className="sm:max-w-md rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black tracking-tight">{t('admin.editUserTitle')}</DialogTitle>
                        <DialogDescription>{t('admin.editUserDesc')}</DialogDescription>
                    </DialogHeader>
                    {editingUser && (
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">{t('common.firstName')}</label>
                                    <Input value={editingUser.first_name} onChange={e => setEditingUser({ ...editingUser, first_name: e.target.value })} className="rounded-xl h-11" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">{t('common.lastName')}</label>
                                    <Input value={editingUser.last_name} onChange={e => setEditingUser({ ...editingUser, last_name: e.target.value })} className="rounded-xl h-11" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">{t('common.phone')}</label>
                                <Input value={editingUser.phone} onChange={e => setEditingUser({ ...editingUser, phone: e.target.value })} className="rounded-xl h-11" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">{t('common.role')}</label>
                                <Select value={editingUser.role || ""} onValueChange={(val: any) => setEditingUser({ ...editingUser, role: val })}>
                                    <SelectTrigger className="rounded-xl h-11">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="STUDENT">{t('admin.role_student')}</SelectItem>
                                        <SelectItem value="TEACHER">{t('admin.role_teacher')}</SelectItem>
                                        <SelectItem value="ADMIN">{t('admin.role_admin')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button onClick={handleSaveEdit} className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-black mt-4 shadow-lg shadow-primary/20">
                                {t('common.saveChanges')}
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Password Reset Dialog */}
            <Dialog open={passwordResetDialogOpen} onOpenChange={setPasswordResetDialogOpen}>
                <DialogContent className="sm:max-w-md rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black tracking-tight">{t('common.resetPasswordTitle')}</DialogTitle>
                        <DialogDescription>{t('common.resetPasswordDesc')}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">{t('common.newPassword')}</label>
                            <Input
                                type="password"
                                placeholder="••••••"
                                className="rounded-xl h-11"
                                value={newPass}
                                onChange={(e) => setNewPass(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">{t('common.confirmNewPassword')}</label>
                            <Input
                                type="password"
                                placeholder="••••••"
                                className="rounded-xl h-11"
                                value={confirmPass}
                                onChange={(e) => setConfirmPass(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setPasswordResetDialogOpen(false)} className="rounded-xl h-11">{t('common.cancel')}</Button>
                        <Button
                            onClick={handleResetPassword}
                            disabled={isSubmitting || !newPass || newPass !== confirmPass}
                            className="rounded-xl h-11 bg-primary px-8"
                        >
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : t('common.confirm')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <StudentReportModal
                userId={reportUserId}
                open={isReportOpen}
                onOpenChange={setIsReportOpen}
            />
        </div>
    );
};

export default AdminUsersPage;
