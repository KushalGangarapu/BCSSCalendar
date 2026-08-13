import React from 'react';

interface SkeletonProps {
    width?: string | number;
    height?: string | number;
    borderRadius?: string | number;
    style?: React.CSSProperties;
}

export const SkeletonLine = ({ width = '100%', height = '16px', borderRadius = '6px', style }: SkeletonProps) => (
    <div
        className="shimmer-bg"
        style={{
            width,
            height,
            borderRadius,
            ...style
        }}
    />
);

export const SkeletonClubCard = () => (
    <div className="card" style={{ padding: '18px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
        <div style={{ flex: '1 1 auto', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <SkeletonLine width="60%" height="22px" />
            <SkeletonLine width="40%" height="14px" />
        </div>
        <SkeletonLine width="72px" height="34px" borderRadius="var(--radius-md)" />
    </div>
);

export const SkeletonClubDetail = () => (
    <div className="card" style={{ padding: '40px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <SkeletonLine width="90px" height="26px" borderRadius="var(--radius-pill)" />
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
                <SkeletonLine width="45%" height="36px" />
                <SkeletonLine width="130px" height="40px" borderRadius="var(--radius-pill)" />
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <SkeletonLine width="120px" height="38px" borderRadius="var(--radius-md)" />
                <SkeletonLine width="120px" height="38px" borderRadius="var(--radius-md)" />
            </div>
            <div style={{ borderBottom: '1px solid var(--border)', margin: '16px 0' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <SkeletonLine width="180px" height="22px" />
                <SkeletonLine width="100%" height="16px" />
                <SkeletonLine width="95%" height="16px" />
                <SkeletonLine width="75%" height="16px" />
            </div>
        </div>
    </div>
);

export const SkeletonEventItem = () => (
    <div className="card" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '14px 18px',
        borderLeft: '4px solid rgba(255,255,255,0.1)',
    }}>
        <SkeletonLine width="52px" height="52px" borderRadius="var(--radius-md)" />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <SkeletonLine width="60%" height="18px" />
            <SkeletonLine width="40%" height="14px" />
        </div>
    </div>
);
