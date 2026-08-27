import { format, parseISO, isSameDay, startOfDay } from 'date-fns';
import { Trash2, Clock, Calendar } from 'lucide-react';
import { formatEventTime } from '../../utils/timeUtils';

export const AgendaView = ({
    events, hovered, setHovered, onEventClick, isAdmin, handleDeleteEvent, getEventStyle
}: any) => {

    const grouped: { [dateStr: string]: any[] } = {};

    const sortedEvents = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');

    sortedEvents.forEach((ev: any) => {
        const start = typeof ev.date === 'string' ? parseISO(ev.date) : new Date(ev.date);
        const dStr = format(start, 'yyyy-MM-dd');
        if (!grouped[dStr]) grouped[dStr] = [];
        grouped[dStr].push(ev);

        if (ev.endDate) {
            const end = typeof ev.endDate === 'string' ? parseISO(ev.endDate) : new Date(ev.endDate);
            if (!isSameDay(start, end)) {
                if (dStr !== todayStr && startOfDay(today) >= startOfDay(start) && startOfDay(today) <= startOfDay(end)) {
                    if (!grouped[todayStr]) grouped[todayStr] = [];
                    if (!grouped[todayStr].some((e: any) => e.id === ev.id)) {
                        grouped[todayStr].push(ev);
                    }
                }
            }
        }
    });

    const dates = Object.keys(grouped).filter(d => d >= todayStr).sort();

    return (
        <div className="card" style={{ overflow: 'hidden', background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)', animation: 'fadeUp 0.4s ease 0.1s both' }}>
            <div style={{ padding: '20px 24px', background: '#F8FAFC', borderBottom: '1px solid var(--border)' }}>
                <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)' }}>
                    <Calendar size={18} style={{ color: 'var(--bcss-red)' }} /> Upcoming School Agenda
                </h3>
            </div>

            <div style={{ padding: '24px', minHeight: '360px', display: 'flex', flexDirection: 'column', gap: '24px', background: '#FFFFFF' }}>
                {dates.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '50px', fontSize: '1rem', fontWeight: 600 }}>
                        No upcoming events to display on the agenda
                    </div>
                ) : (
                    dates.map(dateStr => {
                        const dayEvents = grouped[dateStr];
                        const dateObj = parseISO(dateStr);

                        return (
                            <div key={dateStr} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                                {/* Date Column Badge */}
                                <div style={{
                                    width: '60px', 
                                    flexShrink: 0, 
                                    textAlign: 'center', 
                                    display: 'flex', 
                                    flexDirection: 'column',
                                    padding: '10px 6px',
                                    borderRadius: 'var(--radius-md)',
                                    background: 'var(--bcss-red-soft)',
                                    border: '1px solid rgba(217, 4, 41, 0.2)',
                                    height: 'fit-content'
                                }}>
                                    <span style={{ fontSize: '0.76rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--bcss-red)' }}>
                                        {format(dateObj, 'EEE')}
                                    </span>
                                    <span style={{ fontSize: '1.45rem', fontWeight: 900, fontFamily: 'var(--font-display)', lineHeight: 1.1, color: 'var(--bcss-red)' }}>
                                        {format(dateObj, 'd')}
                                    </span>
                                    <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: '2px', fontWeight: 700, textTransform: 'uppercase' }}>
                                        {format(dateObj, 'MMM')}
                                    </span>
                                </div>

                                {/* Events List */}
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {dayEvents.map((ev: any) => {
                                        const style = getEventStyle(ev);
                                        return (
                                            <div 
                                                key={ev.id} 
                                                onClick={() => onEventClick(ev)} 
                                                style={{
                                                    position: 'relative', 
                                                    borderRadius: 'var(--radius-md)',
                                                    padding: '14px 18px', 
                                                    cursor: 'pointer', 
                                                    display: 'flex', 
                                                    flexDirection: 'column', 
                                                    gap: '6px',
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
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                                                    <div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                                                            <span style={{ fontSize: '1.05rem', fontWeight: 900, fontFamily: 'var(--font-display)', color: 'var(--text-main)' }}>
                                                                {ev.title}
                                                            </span>
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                                <Clock size={13} style={{ color: 'var(--bcss-red)' }} />
                                                                {formatEventTime(ev.date, ev.endDate)}
                                                            </div>
                                                            <span>&bull;</span>
                                                            <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{ev.club?.name || 'Burnaby Central'}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {isAdmin && hovered?.id === ev.id && (
                                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteEvent(ev); }} style={{
                                                        position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                                                        background: 'var(--bcss-red)', border: 'none', borderRadius: '6px',
                                                        padding: '6px', color: '#fff', cursor: 'pointer', display: 'flex', zIndex: 2,
                                                    }}>
                                                        <Trash2 size={13} />
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};
