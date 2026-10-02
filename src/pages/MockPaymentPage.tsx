import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { API_URL, getAuthHeader } from '../services/api';
import { toast } from 'sonner';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const MockPaymentPage = () => {
    const { provider, paymentId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [payment, setPayment] = useState<any>(null);
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [code, setCode] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchPaymentDetails();
    }, [paymentId]);

    const fetchPaymentDetails = async () => {
        try {
            // We can fetch user payments to find this one and verify amount
            // Or just trust the ID for the mock
            const res = await axios.get(`${API_URL}/payments/${paymentId}/`, {
                headers: getAuthHeader()
            });
            setPayment(res.data);
            setLoading(false);
        } catch (error) {
            setError("To'lov ma'lumotlari topilmadi");
            setLoading(false);
        }
    };

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        // Simulate network delay
        setTimeout(async () => {
            try {
                // Call complete endpoint
                await axios.post(`${API_URL}/payments/${paymentId}/complete/`, {}, {
                    headers: getAuthHeader()
                });

                toast.success("To'lov muvaffaqiyatli amalga oshirildi!");

                // Redirect back to dashboard after short delay
                setTimeout(() => {
                    navigate('/dashboard');
                }, 1500);
            } catch (error) {
                toast.error("To'lovni tasdiqlashda xatolik");
                setProcessing(false);
            }
        }, 2000);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !payment) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-red-600 flex items-center">
                            <AlertCircle className="mr-2" /> Xatolik
                        </CardTitle>
                        <CardDescription>{error || "To'lov topilmadi"}</CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <Button onClick={() => navigate('/dashboard')} variant="outline" className="w-full">
                            Ortga qaytish
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    const isPayme = provider === 'payme';

    // Theme configs
    const theme = isPayme ? {
        bg: 'bg-[#f8fcfd]',
        cardBorder: 'border-[#00aabb]',
        headerBg: 'bg-[#00aabb]',
        headerText: 'text-white',
        buttonBg: 'bg-[#00aabb] hover:bg-[#008f9d]',
        logo: 'MyPay' // Just text for now
    } : {
        bg: 'bg-[#f0f3f7]',
        cardBorder: 'border-[#23262f]',
        headerBg: 'bg-[#23262f]',
        headerText: 'text-white',
        buttonBg: 'bg-[#0073f1] hover:bg-[#0060cb]', // Click blue
        logo: 'CLICK'
    };

    return (
        <div className={`min-h-screen flex items-center justify-center p-4 ${theme.bg}`}>
            <Card className={`w-full max-w-md shadow-xl border-t-4 ${theme.cardBorder}`}>
                <div className={`p-6 text-center ${theme.headerBg} ${theme.headerText} rounded-t-sm`}>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">{theme.logo}</h1>
                    <p className="opacity-90">Xavfsiz to'lov tizimi</p>
                </div>

                <CardHeader className="text-center border-b">
                    <div className="text-sm text-muted-foreground uppercase tracking-wide">To'lov miqdori</div>
                    <div className="text-3xl font-bold text-foreground">
                        {parseInt(payment.amount).toLocaleString()} <span className="text-lg text-muted-foreground">UZS</span>
                    </div>
                </CardHeader>

                <form onSubmit={handlePayment}>
                    <CardContent className="space-y-4 pt-6">
                        <div className="space-y-2">
                            <Label>Karta raqami</Label>
                            <Input
                                placeholder="8600 0000 0000 0000"
                                value={cardNumber}
                                onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                                required
                                minLength={16}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Amal qilish muddati</Label>
                                <Input
                                    placeholder="MM/YY"
                                    value={expiry}
                                    onChange={(e) => {
                                        let val = e.target.value.replace(/\D/g, '');
                                        if (val.length > 2) val = val.slice(0, 2) + '/' + val.slice(2, 4);
                                        setExpiry(val);
                                    }}
                                    required
                                    maxLength={5}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>SMS kod (ixtiyoriy)</Label>
                                <Input
                                    placeholder="12345"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                />
                            </div>
                        </div>
                    </CardContent>

                    <CardFooter className="flex flex-col gap-3 pt-2">
                        <Button
                            type="submit"
                            className={`w-full h-12 text-lg font-medium transition-all ${theme.buttonBg}`}
                            disabled={processing}
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Bajarilmoqda...
                                </>
                            ) : (
                                "To'lash"
                            )}
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => navigate('/dashboard')}
                            disabled={processing}
                            className="w-full"
                        >
                            Bekor qilish
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
};

export default MockPaymentPage;
