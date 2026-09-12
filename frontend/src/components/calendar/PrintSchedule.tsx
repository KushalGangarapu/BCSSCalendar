import { format, parseISO, isSameDay } from 'date-fns';
import { formatEventTime, isAllDayEvent } from '../../utils/timeUtils';
import { RichDescription } from '../common/RichDescription';

interface PrintScheduleProps {
    events: any[];
    title: string;
    categories?: { name: string; color: string }[];
}

export const PrintSchedule = ({ events, title, categories = [] }: PrintScheduleProps) => {
    const toDate = (d: string | Date) => (typeof d === 'string' ? parseISO(d) : d);

    // Sort events by date ascending
    const sorted = [...events].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Group each recurring series into a single row that lists every occurrence date
    const seriesMap = new Map<string, any[]>();
    const singleEvents: any[] = [];
    for (const ev of sorted) {
        if (!ev.recurring) {
            singleEvents.push(ev);
            continue;
        }
        const key = `${(ev.title || '').trim().toLowerCase()}_${ev.clubId || 'none'}`;
        const list = seriesMap.get(key) || [];
        list.push(ev);
        seriesMap.set(key, list);
    }

    const sortedEvents = [
        ...singleEvents.map(ev => ({ event: ev, dates: [toDate(ev.date)] as Date[] })),
        ...[...seriesMap.values()].map(list => ({ event: list[0], dates: list.map(ev => toDate(ev.date)) as Date[] })),
    ].sort((a, b) => a.dates[0].getTime() - b.dates[0].getTime());

    const getCategoryColor = (catName: string) => {
        const matched = categories.find(c => c.name.toLowerCase().trim() === catName.toLowerCase().trim());
        if (matched) return matched.color;
        if (catName.toLowerCase().trim() === 'school event') return '#0F172A';
        return '#D90429';
    };

    return (
        <div id="print-schedule-section" style={{ fontFamily: 'var(--font)', color: '#111' }}>
            {/* Branded Header */}
            <div style={{ display: 'flex', alignItems: 'center', borderBottom: '3px solid var(--bcss-red)', paddingBottom: '20px', marginBottom: '24px', gap: '20px', pageBreakInside: 'avoid', breakInside: 'avoid', pageBreakAfter: 'avoid', breakAfter: 'avoid' }}>
                <img 
                    src="/cropped-wildcat-logo.png" 
                    alt="Wildcats Logo" 
                    style={{ width: '80px', height: '80px', objectFit: 'contain' }} 
                />
                <div>
                    <h1 style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-display)', margin: 0, textTransform: 'uppercase', letterSpacing: '-0.02em', color: '#0F172A' }}>
                        Burnaby Central Secondary School
                    </h1>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--bcss-red)', margin: '4px 0 0', fontFamily: 'var(--font-display)' }}>
                        Wildcat Club & Event Schedule — {title}
                    </h2>
                </div>
            </div>

            {/* Event Count / Meta Info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#555', marginBottom: '16px', fontWeight: 500, pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                <span>Report Generated: {new Date().toLocaleDateString(undefined, { dateStyle: 'full' })}</span>
                <span>Total Scheduled Events: {sortedEvents.length}</span>
            </div>

            {/* Schedule Table */}
            {sortedEvents.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', border: '1px dashed #ccc', borderRadius: 'var(--radius-md)', color: '#666' }}>
                    No events scheduled for this period.
                </div>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                            <th style={{ textAlign: 'left', padding: '12px 10px', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.05em', color: '#444' }}>Date & Time</th>
                            <th style={{ textAlign: 'left', padding: '12px 10px', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.05em', color: '#444', width: '22%' }}>Event Title</th>
                            <th style={{ textAlign: 'left', padding: '12px 10px', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.05em', color: '#444' }}>Club / Host</th>
                            <th style={{ textAlign: 'left', padding: '12px 10px', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.05em', color: '#444' }}>Category / Tags</th>
                            <th style={{ textAlign: 'left', padding: '12px 10px', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.05em', color: '#444', width: '35%' }}>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedEvents.map(({ event, dates }, idx) => {
                            const startDate = dates[0];
                            const endDate = event.endDate ? toDate(event.endDate) : null;

                            let dateDisplay = '';
                            let timeDisplay = '';

                            if (event.recurring) {
                                const uniqueDays = [...new Set(dates.map(d => format(d, 'yyyy-MM-dd')))].map(s => parseISO(s));
                                const sameMonth = uniqueDays.every(d => d.getMonth() === uniqueDays[0].getMonth() && d.getFullYear() === uniqueDays[0].getFullYear());
                                dateDisplay = sameMonth
                                    ? `${format(uniqueDays[0], 'MMM')} ${uniqueDays.map(d => format(d, 'd')).join(', ')}`
                                    : uniqueDays.map(d => format(d, 'MMM d')).join(', ');
                                timeDisplay = formatEventTime(startDate, endDate);
                            } else if (endDate && !isSameDay(startDate, endDate)) {
                                dateDisplay = `${format(startDate, 'EEE, MMM d')} – ${format(endDate, 'EEE, MMM d')}`;
                                timeDisplay = isAllDayEvent(startDate, endDate) ? 'All Day' : formatEventTime(startDate, endDate);
                            } else {
                                dateDisplay = format(startDate, 'EEE, MMM d');
                                timeDisplay = formatEventTime(startDate, endDate);
                            }

                            // Collect all distinct tags and category
                            const tagsToRender: string[] = [];
                            if (event.club?.category && event.club.category !== 'School Event') {
                                tagsToRender.push(event.club.category);
                            }
                            if (event.tags && event.tags.length > 0) {
                                event.tags.forEach((t: string) => {
                                    if (!tagsToRender.includes(t)) {
                                        tagsToRender.push(t);
                                    }
                                });
                            }
                            if (tagsToRender.length === 0) {
                                tagsToRender.push('School Event');
                            }

                            const primaryCatColor = getCategoryColor(tagsToRender[0]);

                            const recurrenceLabel = (() => {
                                const weekday = format(startDate, 'EEEE');
                                if (event.recurring === 'weekly') return `Repeats weekly on ${weekday}s`;
                                if (event.recurring === 'biweekly') return `Repeats every 2 weeks on ${weekday}s`;
                                if (event.recurring === 'monthly') return `Repeats monthly on the ${format(startDate, 'do')}`;
                                return null;
                            })();

                            return (
                                <tr key={event.id} style={{ 
                                    borderBottom: '1px solid #e2e8f0', 
                                    background: idx % 2 === 0 ? '#f8fafc' : '#ffffff', 
                                    borderLeft: `4px solid ${primaryCatColor}`,
                                    pageBreakInside: 'avoid', 
                                    breakInside: 'avoid' 
                                }}>
                                    <td style={{ padding: '12px 10px', fontWeight: 600, verticalAlign: 'top', whiteSpace: 'nowrap' }}>
                                        <div>{dateDisplay}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, marginTop: '2px' }}>{timeDisplay}</div>
                                    </td>
                                    <td style={{ padding: '12px 10px', fontWeight: 700, verticalAlign: 'top', color: '#0f172a', fontSize: '0.9rem' }}>
                                        {event.title}
                                        {recurrenceLabel && (
                                            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--bcss-red)', marginTop: '4px' }}>
                                                {recurrenceLabel}
                                            </div>
                                        )}
                                    </td>
                                    <td style={{ padding: '12px 10px', verticalAlign: 'top', color: '#334155', fontWeight: 600 }}>
                                        {event.club?.name || 'Burnaby Central'}
                                    </td>
                                    <td style={{ padding: '12px 10px', verticalAlign: 'top' }}>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                                            {tagsToRender.map((tag, tIdx) => {
                                                const catColor = getCategoryColor(tag);
                                                return (
                                                    <span key={tIdx} style={{ 
                                                        display: 'inline-block',
                                                        padding: '3px 10px', 
                                                        borderRadius: '999px', 
                                                        fontSize: '0.70rem', 
                                                        fontWeight: 800,
                                                        background: catColor,
                                                        color: '#FFFFFF',
                                                        WebkitPrintColorAdjust: 'exact',
                                                        printColorAdjust: 'exact',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.03em',
                                                        whiteSpace: 'nowrap'
                                                    }}>
                                                        {tag}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    </td>
                                    <td style={{ padding: '12px 10px', verticalAlign: 'top', color: '#475569', lineHeight: 1.4, fontSize: '0.8rem' }}>
                                        {event.description ? (
                                            <RichDescription 
                                                content={event.description} 
                                                style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.4 }} 
                                            />
                                        ) : (
                                            <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>No description.</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}

            {/* Branded Footer */}
            <div style={{ marginTop: '40px', borderTop: '1px solid #ddd', paddingTop: '16px', textAlign: 'center', fontSize: '0.78rem', color: '#777', fontWeight: 500, pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                Burnaby Central Secondary School Club Calendar • Keep track of your student life!
            </div>
        </div>
    );
};
