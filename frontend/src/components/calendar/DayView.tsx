import { format, isSameDay, parseISO } from 'date-fns';
import { Trash2, Clock } from 'lucide-react';
import { isEventOnDay } from '../../utils/timeUtils';

export const DayView = ({
    month, events, hovered, setHovered, onEventClick, isAdmin, handleDeleteEvent, getEventStyle
}: any) => {
    const selectedDay = month;
    const dateMatch = events.filter((ev: any) => isEventOnDay(ev, selectedDay));

    return (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)', animation: 'fadeUp 0.4s ease 0.1s both' }}>
            <div style={{ textAlign: 'center', padding: '24px 20px', borderBottom: '1px solid var(--border)', background: '#F8FAFC' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', fontFamily: 'var(--font-display)', marginBottom: '8px' }}>
                    {format(selectedDay, 'EEEE, MMMM d')}
                </div>
                <div style={{
                    width: '48px', height: '48px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: '50%', fontSize: '1.4rem', fontWeight: 900, fontFamily: 'var(--font-display)',
                    ...(isSameDay(selectedDay, new Date()) ? { background: 'var(--bcss-red)', color: '#fff', boxShadow: '0 4px 14px rgba(217,4,41,0.35)' } : { color: 'var(--text-main)', background: '#FFFFFF', border: '1px solid var(--border)' }),
                }}>
                    {format(selectedDay, 'd')}
                </div>
            </div>

            <div style={{ padding: '24px', minHeight: '360px', display: 'flex', flexDirection: 'column', gap: '14px', background: '#FFFFFF' }}>
                {dateMatch.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '50px', fontSize: '1rem', fontWeight: 600 }}>
                        No Burnaby Central events scheduled for this day
                    </div>
                ) : (
                    dateMatch.map((ev: any) => {
                        const style = getEventStyle(ev);
                        return (
                            <div 
                                key={ev.id} 
                                onClick={() => onEventClick(ev)} 
                                style={{
                                    position: 'relative', 
                                    borderRadius: 'var(--radius-lg)',
                                    padding: '18px 22px', 
                                    cursor: 'pointer', 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    gap: '8px',
                                    fontFamily: 'var(--font)', 
                                    transition: 'all 0.2s ease',
                                    background: 'var(--bg-secondary)', 
                                    color: 'var(--text-main)', 
                                    border: '1px solid var(--border)',
                                    borderLeft: `5px solid ${style.background || 'var(--bcss-red)'}`,
                                    boxShadow: 'var(--shadow-sm)',
                                }}
                                onMouseEnter={() => setHovered(ev)}
                                onMouseLeave={() => setHovered(null)}
                                className="card-hover"
                            >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                            <span style={{ fontSize: '1.18rem', fontWeight: 900, fontFamily: 'var(--font-display)', color: 'var(--text-main)' }}>
                                                {ev.title}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <Clock size={14} style={{ color: 'var(--bcss-red)' }} />
                                                {format(parseISO(ev.date), 'h:mm a')}{ev.endDate ? (isSameDay(parseISO(ev.date), parseISO(ev.endDate)) ? ` – ${format(parseISO(ev.endDate), 'h:mm a')}` : ` – ${format(parseISO(ev.endDate), 'MMM d, h:mm a')}`) : ''}
                                            </div>
                                            <span>&bull;</span>
                                            <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{ev.club?.name || 'Burnaby Central'}</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span className="pill" style={{ background: style.background || 'var(--bcss-red)', color: '#fff', border: 'none', padding: '5px 12px', fontSize: '0.75rem', fontWeight: 800 }}>
                                            {ev.club?.category || 'School Event'}
                                        </span>
                                    </div>
                                </div>

                                {ev.description && (
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.5 }}>
                                        {ev.description}
                                    </div>
                                )}

                                {isAdmin && hovered?.id === ev.id && (
                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteEvent(ev); }} style={{
                                        position: 'absolute', right: '14px', bottom: '14px',
                                        background: 'var(--bcss-red)', border: 'none', borderRadius: '6px',
                                        padding: '7px', color: '#fff', cursor: 'pointer', display: 'flex', zIndex: 2,
                                    }}>
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};
