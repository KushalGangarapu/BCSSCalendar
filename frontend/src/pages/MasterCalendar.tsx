import { useState, useEffect } from 'react';
import {
    format, addMonths, subMonths, startOfMonth, endOfMonth,
    startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays, parseISO
} from 'date-fns';
import { ChevronLeft, ChevronRight, Clock, Trash2, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Event {
    id: string; title: string; date: string; description?: string;
    club: { name: string; category: string };
}

// Color-coding for event types
const getEventStyle = (clubName: string): React.CSSProperties => {
    const hash = Array.from(clubName).reduce((h, c) => c.charCodeAt(0) + ((h << 5) - h), 0);
    const styles: React.CSSProperties[] = [
        { background: 'var(--red)', color: '#fff' },
        { background: 'var(--black)', color: '#fff' },
        { background: 'var(--gray-800)', color: '#fff' },
    ];
    return styles[Math.abs(hash) % styles.length];
};

export const MasterCalendar = () => {
    const [month, setMonth] = useState(new Date());
    const [events, setEvents] = useState<Event[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [hovered, setHovered] = useState<Event | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetch('http://localhost:3001/api/events').then(r => r.json()).then(setEvents).catch(console.error);
        fetch('http://localhost:3001/api/categories').then(r => r.json()).then(setCategories).catch(console.error);
        fetch('http://localhost:3001/api/auth/verify', { credentials: 'include' })
            .then(r => setIsAdmin(r.ok)).catch(() => setIsAdmin(false));
    }, []);

    const handleDelete = async (id: string) => {
        if (!window.confirm('Delete this event?')) return;
        const r = await fetch(`http://localhost:3001/api/events/${id}`, { method: 'DELETE', credentials: 'include' });
        if (r.ok) setEvents(events.filter(e => e.id !== id));
    };

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const mStart = startOfMonth(month);

    // Build calendar rows
    const buildCells = () => {
        const start = startOfWeek(mStart);
        const end = endOfWeek(endOfMonth(mStart));
        const cells: React.ReactElement[] = [];
        let day = start;

        while (day <= end) {
            const d = day; // capture
            const isThisMonth = isSameMonth(d, mStart);
            const isToday = isSameDay(d, new Date());
            const dayEvents = events.filter(e => {
                if (!isSameDay(parseISO(e.date), d)) return false;
                if (selectedCategory !== 'All' && e.club.category !== selectedCategory) return false;
                return true;
            });

            cells.push(
                <div key={d.toString()} style={{
                    minHeight: '110px', padding: '6px 8px',
                    borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
                    background: isThisMonth ? '#fff' : 'var(--gray-50)',
                    transition: 'background 0.15s ease',
                }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '4px' }}>
                        <span style={{
                            width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            borderRadius: '50%', fontSize: '0.8rem', fontWeight: 700, fontFamily: 'var(--font-display)',
                            ...(isToday
                                ? { background: 'var(--red)', color: '#fff' }
                                : { color: isThisMonth ? 'var(--gray-800)' : 'var(--gray-400)' }),
                        }}>
                            {format(d, 'd')}
                        </span>
                    </div>
                    {dayEvents.map((ev, i) => (
                        <div key={i} onClick={() => navigate(`/events/${ev.id}`)} style={{
                            position: 'relative', marginBottom: '3px', borderRadius: '4px',
                            padding: '3px 8px', fontSize: '0.7rem', fontWeight: 700,
                            cursor: 'pointer', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            fontFamily: 'var(--font-display)', letterSpacing: '0.01em',
                            transition: 'transform 0.15s', ...getEventStyle(ev.club.name),
                        }}
                            onMouseEnter={() => setHovered(ev)}
                            onMouseLeave={() => setHovered(null)}
                        >
                            {ev.title}

                            {/* Tooltip */}
                            {hovered?.id === ev.id && (
                                <div style={{
                                    position: 'absolute', zIndex: 100, bottom: 'calc(100% + 8px)',
                                    left: '50%', transform: 'translateX(-50%)', width: '260px',
                                    background: '#fff', color: 'var(--text)', padding: '16px',
                                    borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)',
                                    border: '1px solid var(--border)', pointerEvents: 'none',
                                    whiteSpace: 'normal', animation: 'fadeUp 0.2s ease both',
                                }}>
                                    <div style={{
                                        position: 'absolute', bottom: '-6px', left: '50%', transform: 'translateX(-50%) rotate(45deg)',
                                        width: '12px', height: '12px', background: '#fff', border: '1px solid var(--border)',
                                        borderTop: 'none', borderLeft: 'none',
                                    }} />
                                    <h4 style={{ fontWeight: 700, fontFamily: 'var(--font-display)', fontSize: '1rem', marginBottom: '4px' }}>
                                        {ev.title}
                                    </h4>
                                    <span className="pill pill-red" style={{ marginBottom: '10px', display: 'inline-flex' }}>{ev.club.name}</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '8px' }}>
                                        <Clock size={13} />
                                        {format(parseISO(ev.date), 'EEEE, MMM do, h:mm a')}
                                    </div>
                                    {ev.description && (
                                        <p style={{ marginTop: '10px', fontSize: '0.83rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border)', paddingTop: '10px', lineHeight: 1.5 }}>
                                            {ev.description}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Admin Delete */}
                            {isAdmin && hovered?.id === ev.id && (
                                <button onClick={(e) => { e.stopPropagation(); handleDelete(ev.id); }} style={{
                                    position: 'absolute', right: '4px', top: '50%', transform: 'translateY(-50%)',
                                    background: 'var(--red-dark)', border: 'none', borderRadius: '4px',
                                    padding: '2px 4px', color: '#fff', cursor: 'pointer', display: 'flex',
                                }}>
                                    <Trash2 size={11} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            );
            day = addDays(day, 1);
        }
        return cells;
    };

    return (
        <div style={{ animation: 'fadeUp 0.4s ease both' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                <div>
                    <h1 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-display)', fontWeight: 800, letterSpacing: '-0.03em' }}>
                        {format(month, 'MMMM yyyy')}
                    </h1>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="input"
                        style={{ height: '40px', minWidth: '150px', padding: '0 32px 0 16px', marginRight: '8px', fontSize: '0.9rem' }}
                    >
                        <option value="All">All Categories</option>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>

                    {isAdmin && (
                        <button onClick={() => navigate('/admin/dashboard')} className="btn btn-red" style={{ marginRight: '8px', height: '40px' }}>
                            <Plus size={16} /> Add Event
                        </button>
                    )}
                    <button onClick={() => setMonth(subMonths(month, 1))} className="btn btn-ghost" style={{
                        width: '40px', height: '40px', borderRadius: '50%', border: '1px solid var(--border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, color: 'var(--text)',
                    }}>
                        <ChevronLeft size={20} />
                    </button>
                    <button onClick={() => setMonth(addMonths(month, 1))} className="btn btn-ghost" style={{
                        width: '40px', height: '40px', borderRadius: '50%', border: '1px solid var(--border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, color: 'var(--text)',
                    }}>
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="card" style={{ overflow: 'hidden', animation: 'fadeUp 0.4s ease 0.1s both' }}>
                {/* Day headers */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid var(--border)' }}>
                    {days.map(d => (
                        <div key={d} style={{
                            textAlign: 'center', padding: '12px 0', fontSize: '0.72rem',
                            fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em',
                            color: 'var(--text-muted)', fontFamily: 'var(--font-display)',
                        }}>
                            {d}
                        </div>
                    ))}
                </div>
                {/* Cells */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
                    {buildCells()}
                </div>
            </div>
        </div>
    );
};
