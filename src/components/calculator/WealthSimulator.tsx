import React, { useState, useEffect } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import { motion } from 'framer-motion';

interface WealthSimulatorProps {
    initialInvestment: number; // e.g. 300,000,000 (3억)
    growthRate: number; // e.g. 5 (%)
}

export const WealthSimulator: React.FC<WealthSimulatorProps> = ({ initialInvestment, growthRate }) => {
    const [data, setData] = useState<any[]>([]);
    const [years, setYears] = useState(5);

    useEffect(() => {
        // Generate projection data
        const newData = [];
        let currentAmount = initialInvestment;
        for (let i = 0; i <= years; i++) {
            newData.push({
                year: `Year ${i}`,
                amount: Math.round(currentAmount),
                formatted: (currentAmount / 100000000).toFixed(2) + '억'
            });
            currentAmount = currentAmount * (1 + growthRate / 100);
        }
        setData(newData);
    }, [initialInvestment, growthRate, years]);

    return (
        <div className="glass-card" style={{ padding: '30px', marginTop: '30px' }}>
            <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
                <i className="fas fa-chart-line text-gold" style={{ marginRight: '10px' }}></i>
                AI 자산 증식 시뮬레이터
            </h3>
            <p style={{ color: '#aaa', marginBottom: '30px', fontSize: '0.9rem' }}>
                현재 시장 데이터를 기반으로 분석한 <strong>향후 {years}년간의 자산 가치 변화</strong>입니다.
            </p>

            <div style={{ height: '300px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={data}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="year" stroke="#888" />
                        <YAxis stroke="#888" tickFormatter={(value) => (value / 100000000).toFixed(0) + '억'} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#050b14', border: '1px solid #D4AF37', color: '#fff' }}
                            formatter={(value: number) => [`${(value / 100000000).toFixed(2)}억`, '예상 자산']}
                        />
                        <Area
                            type="monotone"
                            dataKey="amount"
                            stroke="#D4AF37"
                            fillOpacity={1}
                            fill="url(#colorAmount)"
                            animationDuration={2000}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '10px' }}>
                <div>
                    <span style={{ color: '#888', fontSize: '0.9rem' }}>5년 후 예상 가치</span>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#D4AF37' }}>
                        {data.length > 0 ? data[data.length - 1].formatted : '0억'}
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <span style={{ color: '#888', fontSize: '0.9rem' }}>총 수익률</span>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#4caf50' }}>
                        +{((Math.pow(1 + growthRate / 100, years) - 1) * 100).toFixed(1)}%
                    </div>
                </div>
            </div>
        </div>
    );
};
