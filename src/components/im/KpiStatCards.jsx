import React, { useMemo } from 'react';
import { useTheme } from '../../context/ThemeContext';

export default function KpiStatCards({ raw, items: propItems }) {
    const { isDark } = useTheme();

    const items = useMemo(() => {
        if (propItems && Array.isArray(propItems)) return propItems;
        if (raw) {
            try {
                const parsed = typeof raw === 'string' ? JSON.parse(raw.trim()) : raw;
                if (Array.isArray(parsed)) return parsed;
                if (parsed.items && Array.isArray(parsed.items)) return parsed.items;
                return Object.entries(parsed).map(([key, val]) => ({ label: key, value: String(val) }));
            } catch (e) {
                console.warn('[KpiStatCards] Parse error:', e);
            }
        }
        return [];
    }, [raw, propItems]);

    if (!items || items.length === 0) return null;

    const subCardBorder = isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0';
    const subCardBg = isDark ? 'rgba(15, 23, 42, 0.65)' : '#ffffff';

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '12px',
            margin: '16px 0'
        }}>
            {items.map((item, idx) => (
                <div key={idx} style={{
                    padding: '14px 16px',
                    borderRadius: '12px',
                    border: `1px solid ${subCardBorder}`,
                    background: subCardBg,
                    boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                }}>
                    <div style={{ fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#64748b', marginBottom: '6px', fontWeight: '600' }}>
                        {item.label || item.name}
                    </div>
                    <div style={{
                        fontSize: '1.15rem',
                        fontWeight: '800',
                        color: item.highlight ? '#0ea5e9' : (isDark ? '#ffffff' : '#0f172a'),
                        fontFamily: 'monospace'
                    }}>
                        {item.value}
                    </div>
                    {item.sub && (
                        <div style={{ fontSize: '0.68rem', color: isDark ? '#64748b' : '#94a3b8', marginTop: '4px' }}>
                            {item.sub}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
