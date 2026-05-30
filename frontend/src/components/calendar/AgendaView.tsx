import { format, parseISO, isSameDay, startOfDay } from 'date-fns';
import { Trash2, Clock, Calendar } from 'lucide-react';

export const AgendaView = ({
    events, hovered, setHovered, onEventClick, isAdmin, handleDeleteEvent, getEventStyle
}: any) => {

    // Group events by date
    const grouped: { [dateStr: string]: any[] } = {};

    // Sort events by date
    const sortedEvents = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');

    sortedEvents.forEach((ev: any) => {
        const start = parseISO(ev.date);
        const dStr = format(start, 'yyyy-MM-dd');
        if (!grouped[dStr]) grouped[dStr] = [];
        grouped[dStr].push(ev);

        // Also add to today if it's an ongoing multi-day event
        if (ev.endDate && !isSameDay(start, parseISO(ev.endDate))) {
            const end = parseISO(ev.endDate);
            if (dStr !== todayStr && startOfDay(today) >= startOfDay(start) && startOfDay(today) <= startOfDay(end)) {
                if (!grouped[todayStr]) grouped[todayStr] = [];
                if (!grouped[todayStr].some((e: any) => e.id === ev.id)) {
                    grouped[todayStr].push(ev);
                }
            }
        }
    });

    const dates = Object.keys(grouped).filter(d => d >= todayStr).sort();

    return (
        <div className="card" style={{ overflow: 'hidden', animation: 'fadeUp 0.4s ease 0.1s both' }}>
            <div style={{ padding: '24px', background: 'var(--gray-50)', borderBottom: '1px solid var(--border)' }}>
                <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={20} className="text-red" /> Upcoming Agenda
                </h3>
            </div>

            <div style={{ padding: '24px', minHeight: '400px', display: 'flex', flexDirection: 'column', gap: '32px', background: '#fff' }}>
                {dates.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '40px' }}>
                        No upcoming events to display
                    </div>
                ) : (
                    dates.map(dateStr => {
                        const dayEvents = grouped[dateStr];
                        const dateObj = parseISO(dateStr);

                        return (
                            <div key={dateStr} style={{ display: 'flex', gap: '24px' }}>
                                {/* Date Column */}
                                <div style={{
                                    width: '60px', flexShrink: 0, textAlign: 'center', display: 'flex', flexDirection: 'column',
                                }}>
                                    <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--red)' }}>
                                        {format(dateObj, 'MMM')}
                                    </span>
                                    <span style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-display)', lineHeight: 1 }}>
                                        {format(dateObj, 'dd')}
                                    </span>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                        {format(dateObj, 'EEE')}
                                    </span>
                                </div>

                                {/* Events Column */}
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {dayEvents.map((ev: any) => {
                                        const style = getEventStyle(ev);
                                        return (
                                            <div key={ev.id} onClick={() => onEventClick(ev)} style={{
                                                position: 'relative', borderRadius: 'var(--radius-md)',
                                                padding: '16px 20px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '8px',
                                                fontFamily: 'var(--font)', transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                                                borderLeft: `4px solid ${style.background}`,
                                                background: 'var(--gray-50)', color: 'var(--text)', borderTop: '1px solid var(--border)', borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
                                            }}
                                                onMouseEnter={() => setHovered(ev)}
                                                onMouseLeave={() => setHovered(null)}
                                                className="card-hover"
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                                                    <div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                            <span style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
                                                                {ev.title}
                                                            </span>
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                <Clock size={14} />
                                                                {format(parseISO(ev.date), 'h:mm a')}{ev.endDate ? (isSameDay(parseISO(ev.date), parseISO(ev.endDate)) ? ` – ${format(parseISO(ev.endDate), 'h:mm a')}` : ` – ${format(parseISO(ev.endDate), 'MMM d, h:mm a')}`) : ''}
                                                            </div>
                                                            <span>&bull;</span>
                                                            <span style={{ fontWeight: 600 }}>{ev.club?.name || 'School Event'}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {isAdmin && hovered?.id === ev.id && (
                                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteEvent(ev); }} style={{
                                                        position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                                                        background: 'var(--red-dark)', border: 'none', borderRadius: '6px',
                                                        padding: '6px', color: '#fff', cursor: 'pointer', display: 'flex', zIndex: 2,
                                                    }}>
                                                        <Trash2 size={14} />
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
