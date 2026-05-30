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

    // Don't count "All" as an active filter
    const activeCount = options.filter(o => o.selected && o.name !== 'All').length;

    return (
        <div ref={containerRef} style={{ position: 'relative' }}>
            <button
                onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
                className="btn"
                style={{
                    height: '40px', padding: '0 14px', gap: '6px', fontSize: '0.82rem',
                    borderColor: activeCount > 0 ? 'var(--red)' : 'var(--border)',
                    borderStyle: 'solid', borderWidth: '2px',
                    backgroundColor: 'transparent',
                    color: activeCount > 0 ? 'var(--red)' : 'var(--text)',
                    fontWeight: 600,
                }}
            >
                <Filter size={15} />
                {label}
                {activeCount > 0 && (
                    <span style={{
                        background: 'var(--red)', color: '#fff', borderRadius: '50%',
                        width: '18px', height: '18px', fontSize: '0.65rem', fontWeight: 800,
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
                    background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-lg)', minWidth: '200px', padding: '8px 0',
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
                                padding: '10px 16px', cursor: 'pointer', fontSize: '0.88rem',
                                fontWeight: 600, fontFamily: 'var(--font-display)',
                                color: opt.selected ? 'var(--text)' : 'var(--text-secondary)',
                                background: opt.selected ? 'var(--gray-50)' : 'transparent',
                                transition: 'background 0.15s',
                                userSelect: 'none',
                                WebkitTapHighlightColor: 'transparent',
                            }}
                        >
                            <span style={{
                                width: '18px', height: '18px', borderRadius: '4px', flexShrink: 0,
                                border: opt.selected ? 'none' : '2px solid var(--gray-300)',
                                background: opt.selected ? (opt.color || 'var(--red)') : 'transparent',
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
                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: opt.color, flexShrink: 0 }} />
                            )}
                            {opt.name}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
