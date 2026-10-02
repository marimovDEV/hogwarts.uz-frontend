import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CreditCard, QrCode, Smartphone, Plus, Trash2, CheckCircle, XCircle, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { API_URL, getAuthHeader } from "@/services/api";
import { useTranslation } from "react-i18next";

interface PaymentProvider {
    id: number;
    name: string;
    type: 'INTEGRATION' | 'MANUAL' | 'BOT';
    provider: string; // CLICK, PAYME, CARD, QR, USERBOT
    is_active: boolean;
    config: any;
    merchant_id?: string;
    secret_key?: string;
    test_mode?: boolean;
}

const AdminPaymentSettings = () => {
    const { t } = useTranslation();
    const [providers, setProviders] = useState<PaymentProvider[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState("integration");

    // Dialog State
    const [showDialog, setShowDialog] = useState(false);
    const [editingProvider, setEditingProvider] = useState<PaymentProvider | null>(null);
    const [formData, setFormData] = useState<Partial<PaymentProvider>>({
        type: 'INTEGRATION',
        provider: 'CLICK',
        is_active: true,
        test_mode: true,
        config: {}
    });

    const openAddDialog = (type: string) => {
        setEditingProvider(null);
        setFormData({
            type: type as any,
            provider: type === 'INTEGRATION' ? 'CLICK' : (type === 'MANUAL' ? 'CARD' : 'USERBOT'),
            is_active: true,
            test_mode: true,
            config: {}
        });
        setShowDialog(true);
    };

    // Bot Control State
    const [botStatus, setBotStatus] = useState<{ is_running: boolean; pid: number | null }>({ is_running: false, pid: null });
    const [checkingStatus, setCheckingStatus] = useState(false);

    useEffect(() => {
        if (activeTab === 'bot') {
            checkBotStatus();
        }
    }, [activeTab]);

    const checkBotStatus = async () => {
        setCheckingStatus(true);
        try {
            const headers = getAuthHeader();
            const res = await axios.get(`${API_URL}/settings/bot-control/status/`, { headers });
            setBotStatus(res.data);
        } catch (error) {
            console.error("Bot status check failed", error);
        } finally {
            setCheckingStatus(false);
        }
    };

    const toggleBot = async () => {
        setCheckingStatus(true);
        try {
            const headers = getAuthHeader();
            const action = botStatus.is_running ? 'stop' : 'start';
            await axios.post(`${API_URL}/settings/bot-control/${action}/`, {}, { headers });
            toast.success(t(`settings.bot${action === 'start' ? 'Started' : 'Stopped'}`));
            setTimeout(checkBotStatus, 1000);
        } catch (error) {
            toast.error(t('error.errorOccurred'));
        } finally {
            setCheckingStatus(false);
        }
    };

    const [platformSettings, setPlatformSettings] = useState<any>(null);

    useEffect(() => {
        fetchProviders();
        fetchPlatformSettings();
    }, []);

    const fetchPlatformSettings = async () => {
        try {
            const headers = getAuthHeader();
            const res = await axios.get(`${API_URL}/settings/platform/`, { headers });
            // API returns a list [settings_obj] or single object depending on viewset
            // Based on viewset it returns list.
            const settings = Array.isArray(res.data) ? res.data[0] : res.data;
            setPlatformSettings(settings || {});
        } catch (error) {
            console.error("Error fetching platform settings", error);
        }
    };

    const fetchProviders = async () => {
        setLoading(true);
        try {
            const headers = getAuthHeader();
            const res = await axios.get(`${API_URL}/settings/payment-providers/`, { headers });
            setProviders(Array.isArray(res.data) ? res.data : res.data.results || []);
        } catch (error) {
            console.error(error);
            toast.error(t('settings.loadError', { defaultValue: "To'lov tizimlarini yuklashda xatolik" }));
        } finally {
            setLoading(false);
        }
    };

    const handleActiveTypeChange = async (type: string) => {
        if (!platformSettings?.id) return;
        try {
            const headers = getAuthHeader();
            await axios.patch(`${API_URL}/settings/platform/${platformSettings.id}/`, {
                active_payment_type: type
            }, { headers });
            setPlatformSettings({ ...platformSettings, active_payment_type: type });
            toast.success(t('settings.activePaymentTypeUpdated'));
        } catch (error) {
            toast.error(t('error.errorOccurred'));
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const headers = getAuthHeader();
            const data = {
                ...formData,
                name: formData.name || formData.provider, // Default name if empty
            };

            if (editingProvider) {
                await axios.put(`${API_URL}/settings/payment-providers/${editingProvider.id}/`, data, { headers });
                toast.success(t('global.updated', { defaultValue: "Muvaffaqiyatli yangilandi" }));
            } else {
                await axios.post(`${API_URL}/settings/payment-providers/`, data, { headers });
                toast.success(t('global.created', { defaultValue: "Muvaffaqiyatli yaratildi" }));
            }
            setShowDialog(false);
            fetchProviders();
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.detail || "Saqlashda xatolik yuz berdi");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm(t('global.confirmDelete', { defaultValue: "Ishonchingiz komilmi?" }))) return;
        try {
            const headers = getAuthHeader();
            await axios.delete(`${API_URL}/settings/payment-providers/${id}/`, { headers });
            toast.success(t('global.deleted', { defaultValue: "Muvaffaqiyatli o'chirildi" }));
            fetchProviders();
        } catch (error) {
            toast.error("O'chirishda xatolik yuz berdi");
        }
    };

    const renderProviderList = (type: string) => {
        const list = providers.filter(p => p.type === type);

        if (list.length === 0) {
            return (
                <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                    <p>{t('settings.noProviders', { defaultValue: "Bu bo'limda hech narsa topilmadi" })}</p>
                </div>
            );
        }

        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {list.map(provider => (
                    <Card key={provider.id} className="flex items-center justify-between p-4 bg-card hover:bg-accent/5 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold
                                ${provider.provider === 'CLICK' ? 'bg-blue-500' :
                                    provider.provider === 'PAYME' ? 'bg-purple-500' :
                                        provider.provider === 'UZUM' ? 'bg-indigo-500' : 'bg-gray-500'}`}>
                                {provider.provider === 'CARD' ? <CreditCard className="w-6 h-6" /> :
                                    provider.provider === 'QR' ? <QrCode className="w-6 h-6" /> :
                                        provider.provider === 'USERBOT' ? <Smartphone className="w-6 h-6" /> :
                                            provider.provider.substring(0, 2)}
                            </div>
                            <div>
                                <h3 className="font-semibold">{provider.name || provider.provider}</h3>
                                <div className="text-xs text-muted-foreground flex gap-2">
                                    <span>{provider.provider}</span>
                                    {provider.type === 'INTEGRATION' && (
                                        <span className="px-1.5 py-0.5 rounded bg-muted">
                                            {provider.test_mode ? 'TEST' : 'ISHLAB CHIQARISH'}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Switch checked={provider.is_active} disabled />
                            <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => handleDelete(provider.id)}>
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </Card>
                ))}
                {list.length === 0 && <p className="text-muted-foreground col-span-3 text-center py-8">{t('settings.noProvidersFound')}</p>}
            </div>
        );
    };

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6">
            {/* Active Payment System Selector */}
            {platformSettings && (
                <Card>
                    <CardHeader>
                        <CardTitle>{t('settings.activePaymentSystem', { defaultValue: "Faol to'lov tizimi" })}</CardTitle>
                        <CardDescription>{t('settings.activePaymentSystemDesc', { defaultValue: "Foydalanuvchilar uchun qaysi to'lov usuli faol bo'lishini tanlang." })}</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { id: 'INTEGRATION', icon: CreditCard, label: t('settings.automaticIntegrations') },
                            { id: 'MANUAL', icon: QrCode, label: t('settings.manualPayments') },
                            { id: 'BOT', icon: Smartphone, label: t('settings.userBotPayment') },
                        ].map((item) => (
                            <div
                                key={item.id}
                                onClick={() => handleActiveTypeChange(item.id)}
                                className={`cursor-pointer border rounded-lg p-4 flex flex-col items-center justify-center gap-3 transition-all hover:bg-accent/50
                                    ${platformSettings.active_payment_type === item.id ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : ''}
                                `}
                            >
                                <item.icon className={`w-8 h-8 ${platformSettings.active_payment_type === item.id ? 'text-primary' : 'text-muted-foreground'}`} />
                                <span className={`font-medium ${platformSettings.active_payment_type === item.id ? 'text-foreground' : 'text-muted-foreground'}`}>
                                    {item.label}
                                </span>
                                {platformSettings.active_payment_type === item.id && (
                                    <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                                        {t('common.active')}
                                    </span>
                                )}
                            </div>
                        ))}

                    </CardContent>

                    <div className="px-6 pb-6 pt-0">
                        <label className="text-sm font-medium mb-2 block">
                            ArdCoin Kursi (1 Coin = ? So'm)
                        </label>
                        <div className="flex gap-4 items-center">
                            <Input
                                type="number"
                                value={platformSettings.ardcoin_exchange_rate || 100}
                                onChange={(e) => setPlatformSettings({ ...platformSettings, ardcoin_exchange_rate: e.target.value })}
                                className="max-w-[200px]"
                            />
                            <Button
                                onClick={async () => {
                                    try {
                                        const headers = getAuthHeader();
                                        await axios.patch(`${API_URL}/settings/platform/${platformSettings.id}/`, {
                                            ardcoin_exchange_rate: platformSettings.ardcoin_exchange_rate
                                        }, { headers });
                                        toast.success("Kurs yangilandi");
                                    } catch (e) {
                                        toast.error("Xatolik");
                                    }
                                }}
                            >
                                Saqlash
                            </Button>
                        </div>
                    </div>
                </Card>
            )
            }

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="integration">{t('settings.automaticIntegrations')}</TabsTrigger>
                    <TabsTrigger value="manual">{t('settings.manualPayments')}</TabsTrigger>
                    <TabsTrigger value="bot">{t('settings.userBotPayment')}</TabsTrigger>
                </TabsList>

                <TabsContent value="integration" className="space-y-4 pt-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-medium">{t('settings.automaticIntegrations')}</h3>
                            <p className="text-sm text-muted-foreground">{t('settings.automaticIntegrationsDesc')}</p>
                        </div>
                        <Button onClick={() => openAddDialog('INTEGRATION')}>
                            <Plus className="w-4 h-4 mr-2" /> {t('settings.addNew')}
                        </Button>
                    </div>
                    {renderProviderList('INTEGRATION')}
                </TabsContent>

                <TabsContent value="manual" className="space-y-4 pt-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-medium">{t('settings.manualPayments')}</h3>
                            <p className="text-sm text-muted-foreground">{t('settings.manualPaymentsDesc')}</p>
                        </div>
                        <Button onClick={() => openAddDialog('MANUAL')}>
                            <Plus className="w-4 h-4 mr-2" /> {t('settings.addNew')}
                        </Button>
                    </div>
                    {renderProviderList('MANUAL')}
                </TabsContent>

                <TabsContent value="bot" className="space-y-4 pt-4">
                    <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-start border p-4 rounded-lg bg-card">
                            <div>
                                <h3 className="text-lg font-medium flex items-center gap-2">
                                    Holat:
                                    <span className={`px-2 py-0.5 rounded text-sm ${botStatus.is_running ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {botStatus.is_running ? 'ISHLAYAPTI' : 'TO\'XTATILGAN'}
                                    </span>
                                </h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {botStatus.is_running
                                        ? t('settings.botRunningDesc', { pid: botStatus.pid })
                                        : t('settings.botStoppedDesc')}
                                </p>
                            </div>
                            <Button
                                variant={botStatus.is_running ? "destructive" : "default"}
                                onClick={toggleBot}
                                disabled={checkingStatus}
                            >
                                {checkingStatus ? <Loader2 className="w-4 h-4 animate-spin" /> :
                                    (botStatus.is_running ? t('settings.stopBot') : t('settings.startBot'))}
                            </Button>
                        </div>

                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-medium">{t('settings.userBotPayment')}</h3>
                                <p className="text-sm text-muted-foreground">{t('settings.userBotPaymentDesc')}</p>
                            </div>
                            <Button onClick={() => openAddDialog('BOT')}>
                                <Plus className="w-4 h-4 mr-2" /> {t('settings.addNew')}
                            </Button>
                        </div>
                        {renderProviderList('BOT')}
                    </div>
                </TabsContent>
            </Tabs>

            {/* ADD/EDIT DIALOG */}
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {editingProvider ? t('global.edit') : t('global.add')} {t(`settings.${formData.type?.toLowerCase()}`)}
                        </DialogTitle>
                        <DialogDescription>To'lov tizimi sozlamalarini kiriting</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label>{t('settings.displayName')}</Label>
                            <Input
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder={t('settings.displayNamePlaceholder')}
                            />
                        </div>

                        {formData.type === 'INTEGRATION' && (
                            <>
                                <div className="space-y-2">
                                    <Label>{t('settings.provider')}</Label>
                                    <Select
                                        value={formData.provider}
                                        onValueChange={v => setFormData({ ...formData, provider: v })}
                                    >
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="CLICK">Click</SelectItem>
                                            <SelectItem value="PAYME">Payme</SelectItem>
                                            <SelectItem value="UZUM">Uzum</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>{t('settings.merchantId')}</Label>
                                    <Input
                                        value={formData.merchant_id}
                                        onChange={e => setFormData({ ...formData, merchant_id: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>{t('settings.secretKey')}</Label>
                                    <Input
                                        type="password"
                                        value={formData.secret_key}
                                        onChange={e => setFormData({ ...formData, secret_key: e.target.value })}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label>{t('settings.testMode')}</Label>
                                    <Switch
                                        checked={formData.test_mode}
                                        onCheckedChange={c => setFormData({ ...formData, test_mode: c })}
                                    />
                                </div>
                            </>
                        )}

                        {formData.type === 'MANUAL' && (
                            <>
                                <div className="space-y-2">
                                    <Label>{t('settings.method')}</Label>
                                    <Select
                                        value={formData.provider}
                                        onValueChange={v => setFormData({ ...formData, provider: v })}
                                    >
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="CARD">{t('settings.cardTransfer')}</SelectItem>
                                            <SelectItem value="QR">{t('settings.qrCode')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                {formData.provider === 'CARD' && (
                                    <>
                                        <div className="space-y-2">
                                            <Label>{t('settings.cardNumber')}</Label>
                                            <Input
                                                value={formData.config?.card_number || ''}
                                                onChange={e => setFormData({
                                                    ...formData,
                                                    config: { ...formData.config, card_number: e.target.value }
                                                })}
                                                placeholder="8600 0000 0000 0000"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>{t('settings.cardHolder')}</Label>
                                            <Input
                                                value={formData.config?.holder_name || ''}
                                                onChange={e => setFormData({
                                                    ...formData,
                                                    config: { ...formData.config, holder_name: e.target.value }
                                                })}
                                                placeholder="JOHN DOE"
                                            />
                                        </div>
                                    </>
                                )}
                                {formData.provider === 'QR' && (
                                    <div className="space-y-2">
                                        <Label>{t('settings.qrImageUrl')}</Label>
                                        <Input
                                            value={formData.config?.qr_image_url || ''}
                                            onChange={e => setFormData({
                                                ...formData,
                                                config: { ...formData.config, qr_image_url: e.target.value }
                                            })}
                                            placeholder="https://..."
                                        />
                                        <p className="text-xs text-muted-foreground">{t('settings.qrImageHelp')}</p>
                                    </div>
                                )}
                            </>
                        )}

                        {formData.type === 'BOT' && (
                            <>
                                <div className="space-y-2">
                                    <Label>{t('settings.targetBot')}</Label>
                                    <Input
                                        value={formData.config?.target_username || ''}
                                        onChange={e => setFormData({
                                            ...formData,
                                            config: { ...formData.config, target_username: e.target.value }
                                        })}
                                        placeholder="@example_bot"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        {t('settings.targetBotHelp')}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <Label>{t('settings.apiId')}</Label>
                                    <Input
                                        value={formData.config?.api_id || ''}
                                        onChange={e => setFormData({
                                            ...formData,
                                            config: { ...formData.config, api_id: e.target.value }
                                        })}
                                        placeholder="123456"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>{t('settings.apiHash')}</Label>
                                    <Input
                                        value={formData.config?.api_hash || ''}
                                        onChange={e => setFormData({
                                            ...formData,
                                            config: { ...formData.config, api_hash: e.target.value }
                                        })}
                                        placeholder="abcdef123456..."
                                    />
                                    <p className="text-xs text-muted-foreground">{t('settings.apiHelp')}</p>
                                </div>
                            </>
                        )}

                        <div className="flex items-center justify-between pt-2">
                            <Label>{t('common.active')}</Label>
                            <Switch
                                checked={formData.is_active}
                                onCheckedChange={c => setFormData({ ...formData, is_active: c })}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDialog(false)}>{t('common.cancel')}</Button>
                        <Button onClick={handleSave} disabled={saving}>
                            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {t('common.save')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminPaymentSettings;
