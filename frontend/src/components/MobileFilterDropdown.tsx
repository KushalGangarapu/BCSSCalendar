import { useState, useRef, useEffect } from 'react';
import { Filter, ChevronDown } from 'lucide-react';

interface FilterOption {
    name: string;
    color?: string;
    selected: boolean;
}

interface MobileFilterDropdownProps {
    options: FilterOption[];
    onToggle: (name: string) => void;
    label?: string;
}

export const MobileFilterDropdown = ({ options, onToggle, label = 'Filters' }: MobileFilterDropdownProps) => {
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: Event) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, []);

    const activeCount = options.filter(o => o.selected && o.name !== 'All').length;

    return (
        <div ref={containerRef} style={{ position: 'relative' }}>
            <button
                onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
                className="btn btn-outline"
                style={{
                    height: '42px', 
                    padding: '0 16px', 
                    gap: '8px', 
                    fontSize: '0.86rem',
                    borderColor: activeCount > 0 ? 'var(--bcss-red)' : 'var(--border-strong)',
                    backgroundColor: activeCount > 0 ? 'var(--bcss-red-soft)' : '#FFFFFF',
                    color: activeCount > 0 ? 'var(--bcss-red)' : 'var(--text-main)',
                    fontWeight: 700,
                    borderRadius: 'var(--radius-pill)',
                    boxShadow: 'var(--shadow-sm)',
                }}
            >
                <Filter size={16} />
                {label}
                {activeCount > 0 && (
                    <span style={{
                        background: 'var(--bcss-red)', color: '#fff', borderRadius: '50%',
                        width: '20px', height: '20px', fontSize: '0.7rem', fontWeight: 900,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>{activeCount}</span>
                )}
                <ChevronDown size={14} style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }} />
            </button>

            {open && (
                <div style={{
                    position: 'absolute', top: 'calc(100% + 8px)', 
                    left: 0, 
                    zIndex: 999,
                    background: '#FFFFFF', 
                    border: '1px solid var(--border-strong)', 
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-lg)', 
                    minWidth: '240px', 
                    padding: '8px 0',
                    animation: 'fadeUp 0.15s ease both',
                }}>
                    {options.map(opt => (
                        <div
                            key={opt.name}
                            role="button"
                            tabIndex={0}
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggle(opt.name); }}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(opt.name); } }}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '10px',
                                padding: '12px 18px', cursor: 'pointer', fontSize: '0.88rem',
                                fontWeight: 700, fontFamily: 'var(--font-display)',
                                color: opt.selected ? 'var(--bcss-red)' : 'var(--text-main)',
                                background: opt.selected ? 'var(--bcss-red-soft)' : 'transparent',
                                transition: 'background 0.15s ease',
                                userSelect: 'none',
                                WebkitTapHighlightColor: 'transparent',
                            }}
                        >
                            <span style={{
                                width: '18px', height: '18px', borderRadius: '4px', flexShrink: 0,
                                border: opt.selected ? 'none' : '2px solid var(--border-strong)',
                                background: opt.selected ? (opt.color || 'var(--bcss-red)') : 'transparent',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'all 0.15s',
                            }}>
                                {opt.selected && (
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                )}
                            </span>
                            {opt.color && (
                                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: opt.color, flexShrink: 0 }} />
                            )}
                            {opt.name}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
