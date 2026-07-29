import { format, isSameDay, startOfWeek, endOfWeek, addDays, parseISO } from 'date-fns';
import { Trash2, Clock } from 'lucide-react';
import { isEventOnDay } from '../../utils/timeUtils';

export const WeekView = ({
    month, events, hovered, setHovered, onEventClick, isAdmin, handleDeleteEvent, getEventStyle, isMobile
}: any) => {
    const start = startOfWeek(month);
    const end = endOfWeek(month);
    const days = [];
    let d = start;
    while (d <= end) {
        days.push(d);
        d = addDays(d, 1);
    }

    return (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'fadeUp 0.4s ease 0.1s both' }}>
            <div className="calendar-table-wrapper">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', borderBottom: '1px solid var(--border)', background: 'var(--gray-50)', width: '100%' }}>
                    {days.map((day, i) => {
                        const isToday = isSameDay(day, new Date());
                        return (
                            <div key={i} style={{
                                textAlign: 'center', padding: isMobile ? '10px 4px' : '16px 8px', borderRight: i < 6 ? '1px solid var(--border)' : 'none', minWidth: 0,
                            }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', fontFamily: 'var(--font-display)', marginBottom: '8px' }}>
                                    {format(day, 'EEE')}
                                </div>
                                <div style={{
                                    width: '32px', height: '32px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    borderRadius: '50%', fontSize: '1.1rem', fontWeight: 800, fontFamily: 'var(--font-display)',
                                    ...(isToday ? { background: 'var(--red)', color: '#fff', boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)' } : { color: 'var(--gray-800)' }),
                                }}>
                                    {format(day, 'd')}
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', minHeight: '400px', width: '100%' }}>
                    {days.map((day, i) => {
                        const dateMatch = events.filter((ev: any) => isEventOnDay(ev, day));
                        return (
                            <div key={i} style={{
                                padding: isMobile ? '8px 4px' : '12px 8px', borderRight: i < 6 ? '1px solid var(--border)' : 'none',
                                display: 'flex', flexDirection: 'column', gap: '8px', background: '#fff', minWidth: 0, overflow: 'hidden'
                            }}>
                                {dateMatch.map((ev: any) => {
                                    return (
                                        <div key={ev.id} onClick={() => onEventClick(ev)} style={{
                                            position: 'relative', borderRadius: 'var(--radius-md)',
                                            padding: isMobile ? '4px 6px' : '10px', fontSize: isMobile ? '0.65rem' : '0.8rem', fontWeight: 600,
                                            cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: isMobile ? '2px' : '6px',
                                            fontFamily: 'var(--font)', transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                                            minWidth: 0, maxWidth: '100%', boxSizing: 'border-box', overflow: 'hidden',
                                            ...getEventStyle(ev)
                                        }}
                                            onMouseEnter={() => setHovered(ev)}
                                            onMouseLeave={() => setHovered(null)}
                                            className="card-hover"
                                            title={ev.title}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '4px', minWidth: 0 }}>
                                                <span style={{
                                                    fontWeight: 800, fontFamily: 'var(--font-display)', lineHeight: 1.3,
                                                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: isMobile ? 'nowrap' : 'normal',
                                                    display: 'block', minWidth: 0, flex: 1
                                                }}>
                                                    {ev.title}
                                                    {ev.endDate && !isSameDay(parseISO(ev.date), parseISO(ev.endDate)) && (
                                                        <span style={{ opacity: 0.88, fontWeight: 600, marginLeft: '4px', fontSize: '0.85em' }}>
                                                            ({format(parseISO(ev.date), 'MMM d')} – {format(parseISO(ev.endDate), 'MMM d')})
                                                        </span>
                                                    )}
                                                </span>
                                            </div>
                                            {!isMobile && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', opacity: 0.9, whiteSpace: 'nowrap' }}>
                                                    <Clock size={12} />
                                                    {format(parseISO(ev.date), 'h:mm a')}{ev.endDate ? (isSameDay(parseISO(ev.date), parseISO(ev.endDate)) ? ` – ${format(parseISO(ev.endDate), 'h:mm a')}` : ` – ${format(parseISO(ev.endDate), 'MMM d, h:mm a')}`) : ''}
                                                </div>
                                            )}

                                            {isAdmin && hovered?.id === ev.id && (
                                                <button onClick={(e) => { e.stopPropagation(); handleDeleteEvent(ev); }} style={{
                                                    position: 'absolute', right: '6px', bottom: '6px',
                                                    background: 'var(--red-dark)', border: 'none', borderRadius: '4px',
                                                    padding: '4px', color: '#fff', cursor: 'pointer', display: 'flex', zIndex: 2,
                                                }}>
                                                    <Trash2 size={12} />
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
