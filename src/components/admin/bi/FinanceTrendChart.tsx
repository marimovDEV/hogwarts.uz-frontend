import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next';
import api from '@/services/api';

const FinanceTrendChart = () => {
    const { t } = useTranslation();
    const [data, setData] = useState<any[]>([]);
    const [days, setDays] = useState(7);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [days]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/analytics/finance-trend/?days=${days}`);
            setData(res.data);
        } catch (error) {
            console.error("Failed to fetch finance trend", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm h-full flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h3 className="font-bold text-lg text-foreground">{t('admin.financeTrend')}</h3>
                    <p className="text-xs text-muted-foreground">{t('admin.financeTrendDesc')}</p>
                </div>
                <select
                    className="bg-muted border border-border rounded-lg text-xs px-2 py-1 outline-none text-foreground cursor-pointer"
                    value={days}
                    onChange={(e) => setDays(Number(e.target.value))}
                >
                    <option value={7}>{t('admin.last7Days')}</option>
                    <option value={30}>{t('admin.last30Days')}</option>
                </select>
            </div>

            <div className="w-full h-[300px] min-h-[300px] mt-4">
                {loading ? (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                        {t('common.loading')}
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={data}
                            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                            <XAxis
                                dataKey="name"
                                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${value.toLocaleString()}`}
                                domain={[0, 'auto']}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                                itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
                                formatter={(value: number) => [`${value.toLocaleString()} ${t('olympiadsSection.currency')}`, t('admin.charts.income')]}
                            />
                            <Area type="monotone" dataKey="income" stroke="#22c55e" fillOpacity={1} fill="url(#colorIncome)" />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
};

export default FinanceTrendChart;
