import { isAllDayEvent } from './timeUtils';
import { addDays, parseISO } from 'date-fns';
import { MARKDOWN_LINK_REGEX } from './linkUtils';

export interface CalendarEvent {
    id: string;
    title: string;
    date: string;
    endDate?: string | null;
    description?: string | null;
    recurring?: string | null;
    recurrenceEndDate?: string | Date | null;
    club?: { name: string } | null;
}

const formatToUtcBasic = (dateString: string | Date): string => {
    const d = typeof dateString === 'string' ? new Date(dateString) : dateString;
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    const h = String(d.getUTCHours()).padStart(2, '0');
    const min = String(d.getUTCMinutes()).padStart(2, '0');
    const s = String(d.getUTCSeconds()).padStart(2, '0');
    return `${y}${m}${day}T${h}${min}${s}Z`;
};

const formatToLocalDateBasic = (dateString: string | Date): string => {
    const d = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}${m}${day}`;
};

const getFallbackEndDate = (startDateString: string): string => {
    const d = new Date(startDateString);
    d.setUTCHours(d.getUTCHours() + 1);
    return d.toISOString();
};

export const generateGoogleCalendarUrl = (event: CalendarEvent, recurrenceEndDateOverride?: string | Date | null): string => {
    const isAllDay = isAllDayEvent(event.date, event.endDate);
    let start = '';
    let end = '';

    if (isAllDay) {
        const startDate = typeof event.date === 'string' ? parseISO(event.date) : event.date;
        start = formatToLocalDateBasic(startDate);
        if (event.endDate) {
            const endDate = typeof event.endDate === 'string' ? parseISO(event.endDate) : event.endDate;
            end = formatToLocalDateBasic(addDays(endDate, 1));
        } else {
            end = formatToLocalDateBasic(addDays(startDate, 1));
        }
    } else {
        start = formatToUtcBasic(event.date);
        end = formatToUtcBasic(event.endDate || getFallbackEndDate(event.date));
    }

    const cleanDescription = (event.description || '').replace(
        new RegExp(MARKDOWN_LINK_REGEX.source, 'g'),
        '$1 ($2)'
    );

    const details = encodeURIComponent(
        `${cleanDescription}\n\nHosted by: ${event.club?.name || 'School Event'}`
    );
    const text = encodeURIComponent(event.title);

    let recurParam = '';
    if (event.recurring) {
        let freq = 'WEEKLY';
        let interval = '';
        if (event.recurring === 'weekly') {
            freq = 'WEEKLY';
        } else if (event.recurring === 'biweekly') {
            freq = 'WEEKLY';
            interval = ';INTERVAL=2';
        } else if (event.recurring === 'monthly') {
            freq = 'MONTHLY';
        }

        const recurrenceEnd = recurrenceEndDateOverride || event.recurrenceEndDate;
        let untilStr = '';
        if (recurrenceEnd) {
            untilStr = `;UNTIL=${isAllDay ? formatToLocalDateBasic(recurrenceEnd) : formatToUtcBasic(recurrenceEnd)}`;
        }
        recurParam = `&recur=${encodeURIComponent(`RRULE:FREQ=${freq}${interval}${untilStr}`)}`;
    }

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${start}/${end}&details=${details}${recurParam}`;
};

export const getAppleCalendarUrl = (event: CalendarEvent): string => {
    // Navigating directly to the backend .ics file served inline will open the native Calendar app
    // directly on iOS and macOS, avoiding the standard browser "downloads" dialog.
    return `${import.meta.env.VITE_API_URL}/api/events/${event.id}/ics`;
};
