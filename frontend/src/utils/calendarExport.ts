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

export const getAppleCalendarUrl = (event: CalendarEvent): string => {
    // Navigating directly to the backend .ics file served inline will open the native Calendar app
    // directly on iOS and macOS, avoiding the standard browser "downloads" dialog.
    return `${import.meta.env.VITE_API_URL}/api/events/${event.id}/ics`;
};
