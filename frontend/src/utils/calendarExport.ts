export interface CalendarEvent {
    id: string;
    title: string;
    date: string;
    endDate?: string | null;
    description?: string | null;
    club?: { name: string } | null;
}

const formatToUtcBasic = (dateString: string): string => {
    const d = new Date(dateString);
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    const h = String(d.getUTCHours()).padStart(2, '0');
    const min = String(d.getUTCMinutes()).padStart(2, '0');
    const s = String(d.getUTCSeconds()).padStart(2, '0');
    return `${y}${m}${day}T${h}${min}${s}Z`;
};

const getFallbackEndDate = (startDateString: string): string => {
    const d = new Date(startDateString);
    d.setUTCHours(d.getUTCHours() + 1);
    return d.toISOString();
};

export const generateGoogleCalendarUrl = (event: CalendarEvent): string => {
    const start = formatToUtcBasic(event.date);
    const end = formatToUtcBasic(event.endDate || getFallbackEndDate(event.date));
    const details = encodeURIComponent(
        `${event.description || ''}\n\nHosted by: ${event.club?.name || 'School Event'}`
    );
    const text = encodeURIComponent(event.title);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${start}/${end}&details=${details}`;
};

export const downloadIcsFile = (event: CalendarEvent): void => {
    const start = formatToUtcBasic(event.date);
    const end = formatToUtcBasic(event.endDate || getFallbackEndDate(event.date));
    const stamp = formatToUtcBasic(new Date().toISOString());
    const cleanTitle = event.title.replace(/[,;]/g, '\\$&');
    const cleanDesc = (event.description || '').replace(/\n/g, '\\n').replace(/[,;]/g, '\\$&') + `\\n\\nHosted by: ${event.club?.name || 'School Event'}`;

    const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//BCSS Calendar//Event//EN',
        'BEGIN:VEVENT',
        `UID:${event.id || Math.random().toString(36).substring(2)}`,
        `DTSTAMP:${stamp}`,
        `DTSTART:${start}`,
        `DTEND:${end}`,
        `SUMMARY:${cleanTitle}`,
        `DESCRIPTION:${cleanDesc}`,
        'END:VEVENT',
        'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};
