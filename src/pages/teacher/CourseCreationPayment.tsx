import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, Sparkles, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { API_URL, getAuthHeader } from "@/services/api";
import { toast } from "sonner";

const CourseCreationPayment = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [selectedOption, setSelectedOption] = useState<'fee' | 'premium' | null>(null);

    const handlePayFee = async () => {
        setLoading(true);
        try {
            // Create a payment for course creation fee (50,000 so'm)
            const response = await axios.post(
                `${API_URL}/payments/initiate/`,
                {
                    amount: 50000,
                    type: 'COURSE_CREATION_FEE',
                    reference_id: 'fee', // Required by initiate endpoint validation
                    method: 'CLICK'
                },
                { headers: getAuthHeader() }
            );

            if (response.data.success && response.data.payment_url) {
                toast.success(t('courseCreationPayment.toast.redirecting'));
                // Redirect to payment gateway
                setTimeout(() => {
                    window.location.href = response.data.payment_url;
                }, 1000);
            } else {
                navigate('/teacher/courses');
            }
        } catch (error) {
            console.error(error);
            toast.error(t('courseCreationPayment.toast.error_general'));
        } finally {
            setLoading(false);
        }
    };

    const handleBuyPremium = async () => {
        setLoading(true);
        try {
            // Initiate Premium payment (150,000 so'm)
            const response = await axios.post(
                `${API_URL}/payments/initiate/`,
                {
                    amount: 150000,
                    type: 'PREMIUM',
                    reference_id: 'premium',
                    method: 'CLICK'
                },
                { headers: getAuthHeader() }
            );

            if (response.data.success && response.data.payment_url) {
                toast.success(t('courseCreationPayment.toast.redirecting'));
                setTimeout(() => {
                    window.location.href = response.data.payment_url;
                }, 1000);
            } else {
                toast.error(t('courseCreationPayment.toast.error_link'));
            }
        } catch (error) {
            console.error(error);
            toast.error(t('courseCreationPayment.toast.error_general'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center p-6 transition-colors duration-300">
            <div className="max-w-4xl w-full">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        {t('courseCreationPayment.title')}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        {t('courseCreationPayment.subtitle')}
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* One-time Fee Option */}
                    <Card
                        className={`cursor-pointer transition-all hover:shadow-lg border-2 ${selectedOption === 'fee' ? 'border-indigo-600 dark:border-indigo-500 shadow-lg' : 'border-gray-200 dark:border-gray-800'
                            } bg-white dark:bg-gray-900`}
                        onClick={() => setSelectedOption('fee')}
                    >
                        <CardHeader>
                            <div className="flex items-center justify-between mb-2">
                                <CreditCard className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                                {selectedOption === 'fee' && (
                                    <div className="w-6 h-6 rounded-full bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center">
                                        <Check className="w-4 h-4 text-white" />
                                    </div>
                                )}
                            </div>
                            <CardTitle className="dark:text-white">{t('courseCreationPayment.feeOption.title')}</CardTitle>
                            <CardDescription className="dark:text-gray-400">{t('courseCreationPayment.feeOption.description')}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{t('courseCreationPayment.feeOption.price')}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('courseCreationPayment.feeOption.priceSub')}</p>
                                </div>
                                <ul className="space-y-2">
                                    <li className="flex items-center gap-2 text-sm dark:text-gray-300">
                                        <Check className="w-4 h-4 text-green-600 dark:text-green-500" />
                                        {t('courseCreationPayment.feeOption.feature1')}
                                    </li>
                                    <li className="flex items-center gap-2 text-sm dark:text-gray-300">
                                        <Check className="w-4 h-4 text-green-600 dark:text-green-500" />
                                        {t('courseCreationPayment.feeOption.feature2')}
                                    </li>
                                    <li className="flex items-center gap-2 text-sm dark:text-gray-300">
                                        <Check className="w-4 h-4 text-green-600 dark:text-green-500" />
                                        {t('courseCreationPayment.feeOption.feature3')}
                                    </li>
                                </ul>
                                <Button
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handlePayFee();
                                    }}
                                    disabled={loading}
                                >
                                    {loading && selectedOption === 'fee' ? t('courseCreationPayment.feeOption.buttonLoading') : t('courseCreationPayment.feeOption.button')}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Premium Subscription Option */}
                    <Card
                        className={`cursor-pointer transition-all hover:shadow-lg border-2 relative overflow-hidden ${selectedOption === 'premium' ? 'border-purple-600 dark:border-purple-500 shadow-lg' : 'border-gray-200 dark:border-gray-800'
                            } bg-white dark:bg-gray-900`}
                        onClick={() => setSelectedOption('premium')}
                    >
                        <div className="absolute top-0 right-0 bg-gradient-to-bl from-yellow-400 to-orange-500 text-white px-3 py-1 text-xs font-bold rounded-bl-lg">
                            {t('courseCreationPayment.premiumOption.badge')}
                        </div>
                        <CardHeader>
                            <div className="flex items-center justify-between mb-2">
                                <Sparkles className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                                {selectedOption === 'premium' && (
                                    <div className="w-6 h-6 rounded-full bg-purple-600 dark:bg-purple-500 flex items-center justify-center">
                                        <Check className="w-4 h-4 text-white" />
                                    </div>
                                )}
                            </div>
                            <CardTitle className="text-purple-600 dark:text-purple-400">{t('courseCreationPayment.premiumOption.title')}</CardTitle>
                            <CardDescription className="dark:text-gray-400">{t('courseCreationPayment.premiumOption.description')}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{t('courseCreationPayment.premiumOption.price')}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('courseCreationPayment.premiumOption.priceSub')}</p>
                                </div>
                                <ul className="space-y-2">
                                    <li className="flex items-center gap-2 text-sm font-semibold text-purple-700 dark:text-purple-400">
                                        <Check className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                        {t('courseCreationPayment.premiumOption.feature1')}
                                    </li>
                                    <li className="flex items-center gap-2 text-sm dark:text-gray-300">
                                        <Check className="w-4 h-4 text-green-600 dark:text-green-500" />
                                        {t('courseCreationPayment.premiumOption.feature2')}
                                    </li>
                                    <li className="flex items-center gap-2 text-sm dark:text-gray-300">
                                        <Check className="w-4 h-4 text-green-600 dark:text-green-500" />
                                        {t('courseCreationPayment.premiumOption.feature3')}
                                    </li>
                                    <li className="flex items-center gap-2 text-sm dark:text-gray-300">
                                        <Check className="w-4 h-4 text-green-600 dark:text-green-500" />
                                        {t('courseCreationPayment.premiumOption.feature4')}
                                    </li>
                                </ul>
                                <Button
                                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleBuyPremium();
                                    }}
                                    disabled={loading}
                                >
                                    {loading && selectedOption === 'premium' ? t('courseCreationPayment.premiumOption.buttonLoading') : t('courseCreationPayment.premiumOption.button')}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="mt-6 text-center">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/teacher/dashboard')}
                        className="dark:text-gray-400 dark:hover:text-white"
                    >
                        {t('courseCreationPayment.back')}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default CourseCreationPayment;
