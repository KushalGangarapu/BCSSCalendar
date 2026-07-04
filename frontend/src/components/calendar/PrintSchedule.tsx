import { format, parseISO, isSameDay } from 'date-fns';

interface PrintScheduleProps {
    events: any[];
    title: string;
}

export const PrintSchedule = ({ events, title }: PrintScheduleProps) => {
    // Sort events by date ascending
    const sortedEvents = [...events].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return (
        <div id="print-schedule-section" style={{ fontFamily: 'var(--font)', padding: '20px', color: '#111' }}>
            {/* Branded Header */}
            <div style={{ display: 'flex', alignItems: 'center', borderBottom: '3px solid var(--red)', paddingBottom: '20px', marginBottom: '24px', gap: '20px' }}>
                <img 
                    src="/cropped-wildcat-logo.png" 
                    alt="Wildcats Logo" 
                    style={{ width: '80px', height: '80px', objectFit: 'contain' }} 
                />
                <div>
                    <h1 style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-display)', margin: 0, textTransform: 'uppercase', letterSpacing: '-0.02em', color: 'var(--black)' }}>
                        Burnaby Central Secondary School
                    </h1>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--red)', margin: '4px 0 0', fontFamily: 'var(--font-display)' }}>
                        Wildcat Club & Event Schedule — {title}
                    </h2>
                </div>
            </div>

            {/* Event Count / Meta Info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#555', marginBottom: '16px', fontWeight: 500 }}>
                <span>Report Generated: {new Date().toLocaleDateString(undefined, { dateStyle: 'full' })}</span>
                <span>Total Scheduled Events: {events.length}</span>
            </div>

            {/* Schedule Table */}
            {sortedEvents.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', border: '1px dashed #ccc', borderRadius: 'var(--radius-md)', color: '#666' }}>
                    No events scheduled for this period.
                </div>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                        <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                            <th style={{ textAlign: 'left', padding: '12px 10px', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.05em', color: '#444' }}>Date & Time</th>
                            <th style={{ textAlign: 'left', padding: '12px 10px', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.05em', color: '#444', width: '20%' }}>Event Title</th>
                            <th style={{ textAlign: 'left', padding: '12px 10px', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.05em', color: '#444' }}>Club</th>
                            <th style={{ textAlign: 'left', padding: '12px 10px', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.05em', color: '#444' }}>Category</th>
                            <th style={{ textAlign: 'left', padding: '12px 10px', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.05em', color: '#444', width: '35%' }}>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedEvents.map((event, idx) => {
                            const startDate = parseISO(event.date);
                            const endDate = event.endDate ? parseISO(event.endDate) : null;

                            let dateDisplay = '';
                            let timeDisplay = '';

                            if (endDate && !isSameDay(startDate, endDate)) {
                                dateDisplay = `${format(startDate, 'EEE, MMM d')} – ${format(endDate, 'EEE, MMM d')}`;
                                timeDisplay = 'Multi-day';
                            } else {
                                dateDisplay = format(startDate, 'EEE, MMM d');
                                const startTimeStr = format(startDate, 'h:mm a');
                                const endTimeStr = endDate ? ` - ${format(endDate, 'h:mm a')}` : '';
                                timeDisplay = `${startTimeStr}${endTimeStr}`;
                            }

                            return (
                                <tr key={event.id} style={{ borderBottom: '1px solid #eee', background: idx % 2 === 0 ? '#fafafa' : '#fff' }}>
                                    <td style={{ padding: '12px 10px', fontWeight: 600, verticalAlign: 'top', whiteSpace: 'nowrap' }}>
                                        <div>{dateDisplay}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#666', fontWeight: 500, marginTop: '2px' }}>{timeDisplay}</div>
                                    </td>
                                    <td style={{ padding: '12px 10px', fontWeight: 700, verticalAlign: 'top', color: '#000', fontSize: '0.9rem' }}>
                                        {event.title}
                                    </td>
                                    <td style={{ padding: '12px 10px', verticalAlign: 'top', color: '#333', fontWeight: 500 }}>
                                        {event.club?.name || 'School Event'}
                                    </td>
                                    <td style={{ padding: '12px 10px', verticalAlign: 'top' }}>
                                        <span style={{ 
                                            display: 'inline-block',
                                            padding: '2px 8px', 
                                            borderRadius: '4px', 
                                            fontSize: '0.72rem', 
                                            fontWeight: 700,
                                            border: '1px solid #ccc',
                                            background: '#f0f0f0',
                                            color: '#333'
                                        }}>
                                            {event.club?.category || 'General'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px 10px', verticalAlign: 'top', color: '#555', lineHeight: 1.4, fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>
                                        {event.description || <span style={{ color: '#aaa', fontStyle: 'italic' }}>No description.</span>}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}

            {/* Branded Footer */}
            <div style={{ marginTop: '40px', borderTop: '1px solid #ddd', paddingTop: '16px', textAlign: 'center', fontSize: '0.78rem', color: '#777', fontWeight: 500 }}>
                Burnaby Central Secondary School Club Calendar • Keep track of your student life!
            </div>
        </div>
    );
};
