import type { LucideIcon } from 'lucide-react';

export interface Category {
    name: string;
    color: string;
}

export interface Club {
    id: string;
    name: string;
    category: string;
    description: string;
    instagram?: string | null;
    discord?: string | null;
    imageUrl?: string | null;
    events?: Event[];
}

export interface Event {
    id: string;
    title: string;
    date: string;
    endDate?: string | null;
    description?: string | null;
    clubId?: string;
    club?: { id: string; name: string; category: string } | null;
    recurring?: string | null;
    tags?: string[];
}

export type CalendarView = 'month' | 'week' | 'day' | 'agenda';

export type CalendarEventStyle = (event: Event) => React.CSSProperties;

export interface CalendarViewProps {
    month: Date;
    events: Event[];
    hovered: Event | null;
    setHovered: (event: Event | null) => void;
    onEventClick: (event: Event) => void;
    isAdmin: boolean;
    handleDeleteEvent: (event: Event) => void | Promise<void>;
    getEventStyle: CalendarEventStyle;
    isMobile?: boolean;
}

export interface CalendarAgendaViewProps extends Omit<CalendarViewProps, 'month' | 'isMobile'> {}

export type IconType = LucideIcon;
