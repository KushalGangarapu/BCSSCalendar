import { format, isSameMonth, isSameDay, startOfWeek, endOfWeek, endOfMonth, startOfMonth, addDays, parseISO } from 'date-fns';
import { Trash2 } from 'lucide-react';
import { isEventOnDay } from '../../utils/timeUtils';

export const MonthView = ({
    month, events, hovered, setHovered, onEventClick, isAdmin, handleDeleteEvent, getEventStyle
}: any) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const mStart = startOfMonth(month);

    const buildCells = () => {
        const start = startOfWeek(mStart);
        const end = endOfWeek(endOfMonth(mStart));
        const cells: React.ReactElement[] = [];
        let day = start;

        while (day <= end) {
            const d = day;
            const isThisMonth = isSameMonth(d, mStart);
            const isToday = isSameDay(d, new Date());
            const dateMatch = events.filter((ev: any) => isEventOnDay(ev, d));

            cells.push(
                <div key={d.toString()} style={{
                    minHeight: '120px', padding: '6px 8px',
                    borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
                    background: isThisMonth ? '#fff' : 'var(--gray-50)',
                    transition: 'background 0.15s ease',
                }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '6px' }}>
                        <span style={{
                            width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            borderRadius: '50%', fontSize: '0.8rem', fontWeight: 700, fontFamily: 'var(--font-display)',
                            ...(isToday
                                ? { background: 'var(--red)', color: '#fff', boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)' }
                                : { color: isThisMonth ? 'var(--gray-800)' : 'var(--gray-400)' }),
                        }}>
                            {format(d, 'd')}
                        </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        {dateMatch.map((ev: any) => {
                            return (
                                <div key={ev.id} onClick={() => onEventClick(ev)} style={{
                                    position: 'relative', borderRadius: '4px',
                                    padding: '4px 8px', fontSize: '0.72rem', fontWeight: 700,
                                    cursor: 'pointer', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                    display: 'flex', alignItems: 'center', gap: '4px',
                                    fontFamily: 'var(--font-display)', letterSpacing: '0.01em',
                                    transition: 'transform 0.15s ease', ...getEventStyle(ev)
                                }}
                                    onMouseEnter={() => setHovered(ev)}
                                    onMouseLeave={() => setHovered(null)}
                                >
                                    {ev.title}
                                    {ev.endDate && !isSameDay(parseISO(ev.date), parseISO(ev.endDate)) && (
                                        <span style={{ fontSize: '0.6rem', opacity: 0.8, marginLeft: '2px', whiteSpace: 'nowrap' }}>→ {format(parseISO(ev.endDate), 'MMMM d')}</span>
                                    )}

                                    {isAdmin && hovered?.id === ev.id && (
                                        <button onClick={(e) => { e.stopPropagation(); handleDeleteEvent(ev); }} style={{
                                            position: 'absolute', right: '4px', top: '50%', transform: 'translateY(-50%)',
                                            background: 'var(--red-dark)', border: 'none', borderRadius: '4px',
                                            padding: '2px 4px', color: '#fff', cursor: 'pointer', display: 'flex',
                                            zIndex: 2,
                                        }}>
                                            <Trash2 size={11} />
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            );
            day = addDays(day, 1);
        }
        return cells;
    };

    return (
        <div className="card" style={{ overflow: 'hidden', animation: 'fadeUp 0.4s ease 0.1s both' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid var(--border)', background: 'var(--gray-50)' }}>
                {days.map(d => (
                    <div key={d} style={{
                        textAlign: 'center', padding: '12px 0', fontSize: '0.75rem',
                        fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em',
                        color: 'var(--text-muted)', fontFamily: 'var(--font-display)',
                    }}>
                        {d}
                    </div>
                ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
                {buildCells()}
            </div>
        </div>
    );
};
