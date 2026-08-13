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
        <div className="card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)', animation: 'fadeUp 0.4s ease 0.1s both' }}>
            <div className="calendar-table-wrapper" style={{ overflowX: 'auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', borderBottom: '1px solid var(--border)', background: '#F8FAFC', width: '100%' }}>
                    {days.map((day, i) => {
                        const isToday = isSameDay(day, new Date());
                        return (
                            <div key={i} style={{
                                textAlign: 'center', padding: isMobile ? '10px 4px' : '14px 8px', borderRight: i < 6 ? '1px solid var(--border)' : 'none', minWidth: 0,
                            }}>
                                <div style={{ fontSize: isMobile ? '0.68rem' : '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: isMobile ? '0.02em' : '0.08em', color: 'var(--text-muted)', fontFamily: 'var(--font-display)', marginBottom: '6px' }}>
                                    {format(day, 'EEE')}
                                </div>
                                <div style={{
                                    width: isMobile ? '28px' : '34px', height: isMobile ? '28px' : '34px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    borderRadius: '50%', fontSize: isMobile ? '0.85rem' : '1.05rem', fontWeight: 900, fontFamily: 'var(--font-display)',
                                    ...(isToday ? { background: 'var(--bcss-red)', color: '#FFFFFF', boxShadow: '0 4px 12px rgba(217,4,41,0.3)' } : { color: 'var(--text-main)' }),
                                }}>
                                    {format(day, 'd')}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', minHeight: isMobile ? '320px' : '420px', width: '100%' }}>
                    {days.map((day, i) => {
                        const isToday = isSameDay(day, new Date());
                        const dateMatch = events.filter((ev: any) => isEventOnDay(ev, day));
                        return (
                            <div key={i} style={{
                                padding: isMobile ? '6px 3px' : '12px 8px', 
                                borderRight: i < 6 ? '1px solid var(--border)' : 'none',
                                display: 'flex', 
                                flexDirection: 'column', 
                                gap: '6px', 
                                background: isToday ? 'var(--bcss-red-soft)' : '#FFFFFF', 
                                minWidth: 0, 
                                overflow: 'hidden'
                            }}>
                                {dateMatch.map((ev: any) => {
                                    return (
                                        <div key={ev.id} onClick={() => onEventClick(ev)} style={{
                                            position: 'relative', borderRadius: 'var(--radius-md)',
                                            padding: isMobile ? '6px 6px' : '10px 12px', fontSize: isMobile ? '0.68rem' : '0.82rem', fontWeight: 700,
                                            cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: isMobile ? '2px' : '4px',
                                            fontFamily: 'var(--font)', transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                                            minWidth: 0, maxWidth: '100%', boxSizing: 'border-box', overflow: 'hidden',
                                            boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                                            ...getEventStyle(ev)
                                        }}
                                            onMouseEnter={() => setHovered(ev)}
                                            onMouseLeave={() => setHovered(null)}
                                            className="card-hover"
                                            title={ev.title}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '4px', minWidth: 0 }}>
                                                <span style={{
                                                    fontWeight: 900, fontFamily: 'var(--font-display)', lineHeight: 1.25,
                                                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: isMobile ? 'nowrap' : 'normal',
                                                    display: 'block', minWidth: 0, flex: 1, color: '#FFFFFF'
                                                }}>
                                                    {ev.title}
                                                    {ev.endDate && !isSameDay(parseISO(ev.date), parseISO(ev.endDate)) && (
                                                        <span style={{ opacity: 0.9, fontWeight: 600, marginLeft: '4px', fontSize: '0.85em' }}>
                                                            ({format(parseISO(ev.date), 'MMM d')} – {format(parseISO(ev.endDate), 'MMM d')})
                                                        </span>
                                                    )}
                                                </span>
                                            </div>
                                            {!isMobile && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.74rem', opacity: 0.95, whiteSpace: 'nowrap', color: '#FFFFFF' }}>
                                                    <Clock size={12} />
                                                    {format(parseISO(ev.date), 'h:mm a')}{ev.endDate ? (isSameDay(parseISO(ev.date), parseISO(ev.endDate)) ? ` – ${format(parseISO(ev.endDate), 'h:mm a')}` : ` – ${format(parseISO(ev.endDate), 'MMM d, h:mm a')}`) : ''}
                                                </div>
                                            )}

                                            {isAdmin && hovered?.id === ev.id && (
                                                <button onClick={(e) => { e.stopPropagation(); handleDeleteEvent(ev); }} style={{
                                                    position: 'absolute', right: '4px', bottom: '4px',
                                                    background: 'rgba(0,0,0,0.4)', border: 'none', borderRadius: '4px',
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
