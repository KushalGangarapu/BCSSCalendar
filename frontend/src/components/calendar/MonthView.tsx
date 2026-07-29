import { format, isSameMonth, isSameDay, startOfWeek, endOfWeek, endOfMonth, startOfMonth, addDays, parseISO } from 'date-fns';
import { Trash2, Edit3 } from 'lucide-react';
import { isEventOnDay } from '../../utils/timeUtils';

export const MonthView = ({
    month, events, hovered, setHovered, onEventClick, isAdmin, handleDeleteEvent, handleEditEvent, getEventStyle, isMobile
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
                    minHeight: isMobile ? '70px' : '110px',
                    padding: isMobile ? '3px' : '6px 8px',
                    borderRight: d.getDay() === 6 ? 'none' : '1px solid var(--border)',
                    borderBottom: '1px solid var(--border)',
                    background: isThisMonth ? '#fff' : 'var(--gray-50)',
                    transition: 'background 0.15s ease',
                    minWidth: 0,
                    maxWidth: '100%',
                    boxSizing: 'border-box',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '4px', flexShrink: 0 }}>
                        <span style={{
                            width: isMobile ? '22px' : '28px',
                            height: isMobile ? '22px' : '28px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            borderRadius: '50%',
                            fontSize: isMobile ? '0.72rem' : '0.8rem',
                            fontWeight: 700,
                            fontFamily: 'var(--font-display)',
                            ...(isToday
                                ? { background: 'var(--red)', color: '#fff', boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)' }
                                : { color: isThisMonth ? 'var(--gray-800)' : 'var(--gray-400)' }),
                        }}>
                            {format(d, 'd')}
                        </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', minWidth: 0, overflow: 'hidden', flex: 1 }}>
                        {dateMatch.map((ev: any) => {
                            const style = getEventStyle(ev);
                            return (
                                <div key={ev.id} onClick={() => onEventClick(ev)} style={{
                                    position: 'relative',
                                    borderRadius: '4px',
                                    padding: isMobile ? '2px 4px' : '3px 6px',
                                    fontSize: isMobile ? '0.62rem' : '0.72rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    fontFamily: 'var(--font-display)',
                                    letterSpacing: '0.01em',
                                    width: '100%',
                                    maxWidth: '100%',
                                    minWidth: 0,
                                    boxSizing: 'border-box',
                                    overflow: 'hidden',
                                    transition: 'transform 0.15s ease, filter 0.15s ease',
                                    ...style
                                }}
                                    onMouseEnter={() => setHovered(ev)}
                                    onMouseLeave={() => setHovered(null)}
                                    title={ev.title}
                                >
                                    <span style={{
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        display: 'block',
                                        minWidth: 0,
                                        flex: 1,
                                        lineHeight: 1.3
                                    }}>
                                        {ev.title}
                                        {ev.endDate && !isSameDay(parseISO(ev.date), parseISO(ev.endDate)) && (
                                            <span style={{ opacity: 0.88, fontWeight: 600, marginLeft: '4px', fontSize: '0.9em' }}>
                                                ({format(parseISO(ev.date), 'MMM d')} – {format(parseISO(ev.endDate), 'MMM d')})
                                            </span>
                                        )}
                                    </span>

                                    {isAdmin && hovered?.id === ev.id && (
                                        <div style={{
                                            position: 'absolute', right: '2px', top: '50%', transform: 'translateY(-50%)',
                                            display: 'flex', gap: '2px', zIndex: 2, flexShrink: 0
                                        }}>
                                            {handleEditEvent && (
                                                <button onClick={(e) => { e.stopPropagation(); handleEditEvent(ev); }} style={{
                                                    background: 'var(--black)', border: 'none', borderRadius: '4px',
                                                    padding: '2px 4px', color: '#fff', cursor: 'pointer', display: 'flex',
                                                }} title="Edit Event">
                                                    <Edit3 size={11} />
                                                </button>
                                            )}
                                            <button onClick={(e) => { e.stopPropagation(); handleDeleteEvent(ev); }} style={{
                                                background: 'var(--red-dark)', border: 'none', borderRadius: '4px',
                                                padding: '2px 4px', color: '#fff', cursor: 'pointer', display: 'flex',
                                            }} title="Delete Event">
                                                <Trash2 size={11} />
                                            </button>
                                        </div>
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
            <div className="calendar-table-wrapper">
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
                    borderBottom: '1px solid var(--border)',
                    background: 'var(--gray-50)',
                    width: '100%',
                }}>
                    {days.map(d => (
                        <div key={d} style={{
                            textAlign: 'center', padding: isMobile ? '8px 2px' : '12px 0', fontSize: isMobile ? '0.68rem' : '0.75rem',
                            fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
                            color: 'var(--text-muted)', fontFamily: 'var(--font-display)',
                        }}>
                            {d}
                        </div>
                    ))}
                </div>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
                    width: '100%',
                }}>
                    {buildCells()}
                </div>
            </div>
        </div>
    );
};

