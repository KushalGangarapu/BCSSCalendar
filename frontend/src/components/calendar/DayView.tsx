import { format, isSameDay, parseISO } from 'date-fns';
import { Trash2, Clock } from 'lucide-react';
import { isEventOnDay } from '../../utils/timeUtils';

export const DayView = ({
    month, events, hovered, setHovered, onEventClick, isAdmin, handleDeleteEvent, getEventStyle
}: any) => {
    // We treat the `month` state as the selected day in DayView for simplicity, 
    // or the MasterCalendar can have a `selectedDate` state. We will use `month` as the day.
    const selectedDay = month;
    const dateMatch = events.filter((ev: any) => isEventOnDay(ev, selectedDay));

    return (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'fadeUp 0.4s ease 0.1s both' }}>
            <div style={{ textAlign: 'center', padding: '24px', borderBottom: '1px solid var(--border)', background: 'var(--gray-50)' }}>
                <div style={{ fontSize: '1rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', fontFamily: 'var(--font-display)', marginBottom: '8px' }}>
                    {format(selectedDay, 'EEEE')}
                </div>
                <div style={{
                    width: '48px', height: '48px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: '50%', fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-display)',
                    ...(isSameDay(selectedDay, new Date()) ? { background: 'var(--red)', color: '#fff', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)' } : { color: 'var(--gray-800)', background: '#fff', border: '1px solid var(--border)' }),
                }}>
                    {format(selectedDay, 'd')}
                </div>
            </div>

            <div style={{ padding: '24px', minHeight: '400px', display: 'flex', flexDirection: 'column', gap: '16px', background: '#fff' }}>
                {dateMatch.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '40px' }}>
                        No events scheduled for this day
                    </div>
                ) : (
                    dateMatch.map((ev: any) => {
                        return (
                            <div key={ev.id} onClick={() => onEventClick(ev)} style={{
                                position: 'relative', borderRadius: 'var(--radius-md)',
                                padding: '16px 20px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '8px',
                                fontFamily: 'var(--font)', transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                                borderLeft: '4px solid transparent',
                                ...getEventStyle(ev),
                                // Make DayView events look more like horizontal cards
                                background: 'var(--gray-50)', color: 'var(--text)', border: '1px solid var(--border)',
                                borderLeftColor: getEventStyle(ev).background,
                            }}
                                onMouseEnter={() => setHovered(ev)}
                                onMouseLeave={() => setHovered(null)}
                                className="card-hover"
                            >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                            <span style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
                                                {ev.title}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Clock size={14} />
                                                {format(parseISO(ev.date), 'h:mm a')}{ev.endDate ? (isSameDay(parseISO(ev.date), parseISO(ev.endDate)) ? ` – ${format(parseISO(ev.endDate), 'h:mm a')}` : ` – ${format(parseISO(ev.endDate), 'MMM d, h:mm a')}`) : ''}
                                            </div>
                                            <span>&bull;</span>
                                            <span style={{ fontWeight: 600 }}>{ev.club?.name || 'School Event'}</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span className="pill" style={{ background: getEventStyle(ev).background, color: '#fff', border: 'none' }}>
                                            {ev.club?.category || 'School Event'}
                                        </span>
                                    </div>
                                </div>
                                {ev.description && (
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                        {ev.description}
                                    </div>
                                )}

                                {isAdmin && hovered?.id === ev.id && (
                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteEvent(ev); }} style={{
                                        position: 'absolute', right: '12px', bottom: '12px',
                                        background: 'var(--red-dark)', border: 'none', borderRadius: '6px',
                                        padding: '6px', color: '#fff', cursor: 'pointer', display: 'flex', zIndex: 2,
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
