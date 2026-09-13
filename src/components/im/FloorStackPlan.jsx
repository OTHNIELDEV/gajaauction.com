import React, { useMemo } from 'react';
import { useTheme } from '../../context/ThemeContext';

export default function FloorStackPlan({ raw, floors: propFloors }) {
    const { isDark } = useTheme();

    const floors = useMemo(() => {
        if (propFloors && Array.isArray(propFloors)) return propFloors;
        if (raw) {
            try {
                const parsed = typeof raw === 'string' ? JSON.parse(raw.trim()) : raw;
                if (Array.isArray(parsed)) return parsed;
                if (parsed.floors && Array.isArray(parsed.floors)) return parsed.floors;
            } catch (e) {
                console.warn('[FloorStackPlan] Parse error:', e);
            }
        }
        return [];
    }, [raw, propFloors]);

    if (!floors || floors.length === 0) return null;

    const cardBorder = isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0';
    const cardBg = isDark ? 'rgba(15, 23, 42, 0.75)' : '#ffffff';
    const subCardBorder = isDark ? 'rgba(255, 255, 255, 0.06)' : '#e2e8f0';

    return (
        <div style={{
            margin: '20px 0',
            border: `1px solid ${cardBorder}`,
            borderRadius: '16px',
            overflow: 'hidden',
            background: cardBg,
            boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.35)' : '0 8px 24px rgba(0,0,0,0.06)'
        }}>
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
                <span style={{ color: '#0ea5e9' }}>🏢</span>
                <span>층별 공간 및 테넌트 배치도 (Stacking Plan)</span>
            </div>

            <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {floors.map((item, idx) => (
                    <div key={idx} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: `1px solid ${subCardBorder}`,
                        background: isDark ? 'rgba(255, 255, 255, 0.02)' : '#f8fafc'
                    }}>
                        <div style={{
                            minWidth: '70px',
                            fontWeight: '800',
                            fontSize: '0.85rem',
                            color: '#0ea5e9',
                            fontFamily: 'monospace'
                        }}>
                            {item.floor || item.level}
                        </div>
                        <div style={{ flex: 1, fontSize: '0.86rem', color: isDark ? '#f1f5f9' : '#1e293b', fontWeight: '600' }}>
                            {item.use || item.title || item.tenant}
                        </div>
                        {(item.note || item.area) && (
                            <div style={{ fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                                {item.note || item.area}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
