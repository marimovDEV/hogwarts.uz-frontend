import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useTranslation } from 'react-i18next';
import api from '@/services/api';

const TopItemsChart = () => {
    const { t } = useTranslation();
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/analytics/top-products/');
            setData(res.data);
        } catch (error) {
            console.error("Failed to fetch top products", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm h-full flex flex-col">
            <h3 className="font-bold text-lg mb-2 text-foreground">{t('admin.topItemsTitle')}</h3>
            <p className="text-xs text-muted-foreground mb-6">{t('admin.topItemsDesc')}</p>

            <div className="w-full h-[300px] min-h-[300px] mt-2">
                {loading ? (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                        {t('common.loading')}
                    </div>
                ) : data.length === 0 ? (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                        {t('common.noData')}
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                            <XAxis type="number" hide />
                            <YAxis
                                dataKey="name"
                                type="category"
                                width={120}
                                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                                tickFormatter={(val) => val.length > 15 ? val.substring(0, 15) + '...' : val}
                            />
                            <Tooltip
                                cursor={{ fill: 'transparent' }}
                                contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                                itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
                                formatter={(value: number) => [`${value.toLocaleString()} ${t('common.currency')}`, t('admin.charts.revenue')]}
                            />
                            <Bar dataKey="revenue" radius={[0, 4, 4, 0]} barSize={20}>
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color || '#3b82f6'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
};

export default TopItemsChart;
