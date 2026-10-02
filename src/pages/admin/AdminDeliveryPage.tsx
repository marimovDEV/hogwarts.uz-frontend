import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Truck, Search, MapPin, Package, CheckCircle, Clock, Filter, Phone, User as UserIcon, Calendar, Trophy } from "lucide-react";
import { API_URL, getAuthHeader } from "@/services/api";
import axios from "axios";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const AdminDeliveryPage = () => {
    const [prizes, setPrizes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const fetchPrizes = async () => {
        setLoading(true);
        try {
            let url = `${API_URL}/winner-prizes/`;
            if (statusFilter !== "all") {
                url += `?status=${statusFilter}`;
            }
            const res = await axios.get(url, { headers: getAuthHeader() });
            setPrizes(res.data.results || res.data);
        } catch (error) {
            toast.error("Ma'lumotlarni yuklashda xatolik");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPrizes();
    }, [statusFilter]);

    const handleUpdateStatus = async (id: number, newStatus: string) => {
        try {
            await axios.post(`${API_URL}/winner-prizes/${id}/update_status/`, { status: newStatus }, { headers: getAuthHeader() });
            toast.success("Status yangilandi");
            fetchPrizes();
        } catch (error) {
            toast.error("Xatolik yuz berdi");
        }
    };

    const getStatusBadge = (status: string) => {
        const variants: any = {
            'PENDING': { label: 'Kutilmoqda', color: 'bg-gray-500/10 text-gray-500' },
            'CONTACTED': { label: 'Bog\'lanilgan', color: 'bg-blue-500/10 text-blue-500' },
            'ADDRESS_RECEIVED': { label: 'Manzil olindi', color: 'bg-yellow-500/10 text-yellow-500' },
            'SHIPPED': { label: 'Yuborildi', color: 'bg-purple-500/10 text-purple-500' },
            'COMPLETED': { label: 'Yetkazildi', color: 'bg-green-500/10 text-green-500' },
        };
        const config = variants[status] || variants['PENDING'];
        return <Badge className={`${config.color} border-0`}>{config.label}</Badge>;
    };

    const filteredPrizes = prizes.filter(p =>
        p.student_name.toLowerCase().includes(search.toLowerCase()) ||
        p.olympiad_title.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                        <Truck className="w-8 h-8 text-primary" /> Yetkazib berish (Prizes)
                    </h1>
                    <p className="text-muted-foreground mt-1">Olimpiada sovrinlarini boshqarish va kuzatish</p>
                </div>
            </div>

            <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-3 border-b border-border/40">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Talaba yoki olimpiada nomi bo'yicha qidirish..."
                                className="pl-10 h-11 bg-background"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-muted-foreground" />
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[200px] h-11 bg-background">
                                    <SelectValue placeholder="Status bo'yicha" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Barchasi</SelectItem>
                                    <SelectItem value="PENDING">Kutilmoqda</SelectItem>
                                    <SelectItem value="CONTACTED">Bog'lanilgan</SelectItem>
                                    <SelectItem value="ADDRESS_RECEIVED">Manzil olindi</SelectItem>
                                    <SelectItem value="SHIPPED">Yuborildi</SelectItem>
                                    <SelectItem value="COMPLETED">Yetkazildi</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-muted/30 text-muted-foreground text-[11px] font-black uppercase tracking-wider">
                                    <th className="px-6 py-4">ID</th>
                                    <th className="px-6 py-4">G'olib / Olimpiada</th>
                                    <th className="px-6 py-4">Sovrin</th>
                                    <th className="px-6 py-4">Manzil</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Amallar</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/40">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                                            Yuklanmoqda...
                                        </td>
                                    </tr>
                                ) : filteredPrizes.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                                            Sovrinlar topilmadi
                                        </td>
                                    </tr>
                                ) : filteredPrizes.map((prize) => (
                                    <tr key={prize.id} className="hover:bg-muted/20 transition-colors group">
                                        <td className="px-6 py-4 font-mono text-xs opacity-50">#{prize.id}</td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="font-bold flex items-center gap-2">
                                                    <UserIcon className="w-3 h-3 text-primary" /> {prize.student_name}
                                                </div>
                                                <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight flex items-center gap-1">
                                                    <Trophy className="w-2.5 h-2.5" /> {prize.olympiad_title}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="inline-flex items-center gap-2 px-2 py-1 rounded-lg bg-primary/5 text-primary text-xs font-bold">
                                                <Package className="w-3 h-3" /> {prize.prize_item_name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 max-w-[200px]">
                                            <div className="space-y-1">
                                                {prize.address?.address_text ? (
                                                    <div className="text-xs font-medium truncate" title={prize.address.address_text}>
                                                        {prize.address.address_text}
                                                    </div>
                                                ) : prize.address?.latitude ? (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-7 text-xs text-blue-500 hover:text-blue-600 p-0"
                                                        onClick={() => window.open(`https://www.google.com/maps?q=${prize.address.latitude},${prize.address.longitude}`, '_blank')}
                                                    >
                                                        <MapPin className="w-3 h-3 mr-1" /> Kartada ko'rish
                                                    </Button>
                                                ) : (
                                                    <span className="text-[10px] text-muted-foreground italic tracking-tight">Manzil kiritilmagan</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(prize.status)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 pr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Select
                                                    onValueChange={(val) => handleUpdateStatus(prize.id, val)}
                                                    defaultValue={prize.status}
                                                >
                                                    <SelectTrigger className="h-8 w-32 text-[10px] font-bold uppercase">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="PENDING">Kutilmoqda</SelectItem>
                                                        <SelectItem value="CONTACTED">Bog'lanilgan</SelectItem>
                                                        <SelectItem value="SHIPPED">Yuborildi</SelectItem>
                                                        <SelectItem value="COMPLETED">Yetkazildi</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminDeliveryPage;
