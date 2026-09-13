import React, { useMemo } from 'react';
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { useTheme } from '../../context/ThemeContext';

const DEFAULT_COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];

export default function FinancialChart({ raw, spec: propSpec, height = 280 }) {
    const { isDark } = useTheme();

    const spec = useMemo(() => {
        if (propSpec) return propSpec;
        if (raw) {
            try {
                const parsed = typeof raw === 'string' ? JSON.parse(raw.trim()) : raw;
                return parsed;
            } catch (e) {
                console.warn('[FinancialChart] Parse error:', e);
            }
        }
        return null;
    }, [raw, propSpec]);

    if (!spec || !spec.data || !Array.isArray(spec.data)) {
        return null;
    }

    const { type = 'bar', data, xKey = 'name', title } = spec;
    const cardBorder = isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0';
    const cardBg = isDark ? 'rgba(15, 23, 42, 0.75)' : '#ffffff';
    const subCardBorder = isDark ? 'rgba(255, 255, 255, 0.06)' : '#e2e8f0';
    const textColor = isDark ? '#94a3b8' : '#475569';

    const tooltipStyle = {
        background: isDark ? '#0f172a' : '#ffffff',
        border: `1px solid ${cardBorder}`,
        borderRadius: '8px',
        color: isDark ? '#ffffff' : '#0f172a',
        fontSize: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
    };

    return (
        <div style={{
            margin: '20px 0',
            border: `1px solid ${cardBorder}`,
            borderRadius: '16px',
            overflow: 'hidden',
            background: cardBg,
            boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.35)' : '0 8px 24px rgba(0,0,0,0.06)'
        }}>
            {title && (
                <div style={{
                    padding: '12px 18px',
                    borderBottom: `1px solid ${subCardBorder}`,
                    fontSize: '0.88rem',
                    fontWeight: '800',
                    color: isDark ? '#ffffff' : '#0f172a',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    <span style={{ color: '#0ea5e9' }}>📊</span>
                    <span>{title}</span>
                </div>
            )}

            <div style={{ padding: '16px 14px 10px 14px' }}>
                <ResponsiveContainer width="100%" height={height}>
                    {type === 'bar' ? (
                        <BarChart data={data} margin={{ top: 10, right: 15, left: -15, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9'} />
                            <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: textColor }} />
                            <YAxis tick={{ fontSize: 11, fill: textColor }} />
                            <Tooltip contentStyle={tooltipStyle} />
                            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 6 }} />
                            {(spec.bars ?? [{ key: 'value', name: '수치', color: '#0ea5e9' }]).map((b, idx) => (
                                <Bar
                                    key={b.key || idx}
                                    dataKey={b.key}
                                    name={b.name || b.key}
                                    fill={b.color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length]}
                                    radius={[4, 4, 0, 0]}
                                />
                            ))}
                        </BarChart>
                    ) : type === 'line' ? (
                        <LineChart data={data} margin={{ top: 10, right: 15, left: -15, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9'} />
                            <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: textColor }} />
                            <YAxis tick={{ fontSize: 11, fill: textColor }} />
                            <Tooltip contentStyle={tooltipStyle} />
                            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 6 }} />
                            {(spec.lines ?? [{ key: 'value', name: '수치', color: '#0ea5e9' }]).map((l, idx) => (
                                <Line
                                    key={l.key || idx}
                                    type="monotone"
                                    dataKey={l.key}
                                    name={l.name || l.key}
                                    stroke={l.color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length]}
                                    strokeWidth={2.5}
                                    dot={{ r: 4 }}
                                />
                            ))}
                        </LineChart>
                    ) : type === 'radar' ? (
                        <RadarChart data={data} margin={{ top: 10, right: 25, bottom: 10, left: 25 }}>
                            <PolarGrid stroke={isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'} />
                            <PolarAngleAxis dataKey={spec.axisKey || 'axis'} tick={{ fontSize: 11, fill: textColor }} />
                            <PolarRadiusAxis tick={{ fontSize: 9, fill: textColor }} />
                            <Tooltip contentStyle={tooltipStyle} />
                            <Legend wrapperStyle={{ fontSize: 12 }} />
                            {(spec.series ?? [{ key: 'value', name: '평가점수', color: '#0ea5e9' }]).map((s, idx) => (
                                <Radar
                                    key={s.key || idx}
                                    name={s.name || '평가'}
                                    dataKey={s.key}
                                    stroke={s.color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length]}
                                    fill={s.color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length]}
                                    fillOpacity={0.25}
                                />
                            ))}
                        </RadarChart>
                    ) : (
                        <PieChart>
                            <Pie
                                data={data}
                                dataKey={spec.valueKey || 'value'}
                                nameKey={spec.nameKey || 'name'}
                                cx="50%"
                                cy="50%"
                                outerRadius={90}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                labelLine={false}
                            >
                                {data.map((_, i) => (
                                    <Cell key={i} fill={(spec.colors || DEFAULT_COLORS)[i % DEFAULT_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={tooltipStyle} />
                            <Legend wrapperStyle={{ fontSize: 12 }} />
                        </PieChart>
                    )}
                </ResponsiveContainer>
            </div>
        </div>
    );
}
