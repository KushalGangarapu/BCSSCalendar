import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
    format, addMonths, subMonths, addDays, parseISO, startOfMonth, endOfMonth
} from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Heart, List, Map, Calendar as CalIcon, LayoutGrid, Printer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { MonthView } from '../components/calendar/MonthView';
import { WeekView } from '../components/calendar/WeekView';
import { DayView } from '../components/calendar/DayView';
import { AgendaView } from '../components/calendar/AgendaView';
import { EventDetailModal } from '../components/calendar/EventDetailModal';
import { MobileFilterDropdown } from '../components/MobileFilterDropdown';
import { PrintSchedule } from '../components/calendar/PrintSchedule';

interface Event {
    id: string; title: string; date: string; endDate?: string | null; description?: string;
    clubId?: string;
    club?: { name: string; category: string };
    recurring?: string | null;
    tags?: string[];
}

const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 1200);
    useEffect(() => {
        const handler = () => setIsMobile(window.innerWidth <= 1200);
        window.addEventListener('resize', handler);
        return () => window.removeEventListener('resize', handler);
    }, []);
    return isMobile;
};

// Color-coding for event types
const getEventStyle = (clubName: string, categoryColor?: string | null): React.CSSProperties => {
    if (categoryColor) {
        return { background: categoryColor, color: '#fff' };
    }
    const hash = Array.from(clubName).reduce((h, c) => c.charCodeAt(0) + ((h << 5) - h), 0);
    const styles: React.CSSProperties[] = [
        { background: 'var(--red)', color: '#fff' },
        { background: 'var(--black)', color: '#fff' },
        { background: 'var(--gray-800)', color: '#fff' },
    ];
    return styles[Math.abs(hash) % styles.length];
};

export const MasterCalendar = () => {
    const [view, setView] = useState<'month' | 'week' | 'day' | 'agenda'>('month');
    const [month, setMonth] = useState(new Date());
    const [events, setEvents] = useState<Event[]>([]);
    const [categories, setCategories] = useState<{ name: string, color: string }[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [hovered, setHovered] = useState<Event | null>(null);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [followedOnly, setFollowedOnly] = useState(false);
    const [followedClubIds, setFollowedClubIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const isMobile = useIsMobile();

    useEffect(() => {
        Promise.all([
            fetch(`${import.meta.env.VITE_API_URL}/api/events`).then(r => r.json()).then(setEvents),
            fetch(`${import.meta.env.VITE_API_URL}/api/categories`).then(r => r.json()).then(setCategories),
            fetch(`${import.meta.env.VITE_API_URL}/api/auth/verify`, { credentials: 'include' })
                .then(r => setIsAdmin(r.ok)).catch(() => setIsAdmin(false))
        ])
        .catch(console.error)
        .finally(() => setLoading(false));

        const followed = JSON.parse(localStorage.getItem('bcss_followed_clubs') || '[]');
        setFollowedClubIds(followed);
    }, []);

    const handleDelete = async (event: Event) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this event?');
        if (!confirmDelete) return;

        let allFuture = false;
        if (event.recurring) {
            allFuture = window.confirm('This is a recurring event series.\n\nClick OK to ALSO delete ALL FUTURE occurrences.\nClick Cancel to ONLY delete this specific date.');
        }

        const r = await fetch(`${import.meta.env.VITE_API_URL}/api/events/${event.id}?allFuture=${allFuture}`, { method: 'DELETE', credentials: 'include' });
        if (r.ok) {
            if (allFuture) {
                setLoading(true);
                fetch(`${import.meta.env.VITE_API_URL}/api/events`)
                    .then(r => r.json())
                    .then(setEvents)
                    .catch(console.error)
                    .finally(() => setLoading(false));
            } else {
                setEvents(events.filter(e => e.id !== event.id));
            }
        }
    };

    const displayEvents = events.filter(ev => {
        let categoryMatch = false;
        if (selectedCategories.length === 0) {
            categoryMatch = true;
        } else {
            const hasMatchingTag = ev.tags && ev.tags.some(tag => selectedCategories.includes(tag));
            const hasMatchingClubCategory = ev.club?.category && selectedCategories.includes(ev.club.category);
            categoryMatch = Boolean(hasMatchingTag || hasMatchingClubCategory);
        }
        const followMatch = !followedOnly || (ev.clubId && followedClubIds.includes(ev.clubId));
        return categoryMatch && followMatch;
    });

    const resolveEventStyle = (ev: Event) => {
        let primaryColor = null;
        if (ev.tags && ev.tags.length > 0) {
            for (const tag of ev.tags) {
                const matchedCategory = categories.find(c => c.name === tag);
                if (matchedCategory) {
                    primaryColor = matchedCategory.color;
                    break;
                }
            }
        }
        if (!primaryColor) {
            primaryColor = categories.find(c => c.name === ev.club?.category)?.color || null;
        }
        return getEventStyle(ev.club?.name || 'School Event', primaryColor);
    };

    const toggleCategory = (catName: string) => {
        if (selectedCategories.includes(catName)) {
            setSelectedCategories(selectedCategories.filter(c => c !== catName));
        } else {
            setSelectedCategories([...selectedCategories, catName]);
        }
    };

    // Build filter options for mobile dropdown
    const filterOptions = [
        { name: 'Followed Clubs', color: undefined, selected: followedOnly },
        ...categories.map(cat => ({ name: cat.name, color: cat.color, selected: selectedCategories.includes(cat.name) })),
    ];

    const handleFilterToggle = (name: string) => {
        if (name === 'Followed Clubs') {
            setFollowedOnly(!followedOnly);
        } else {
            toggleCategory(name);
        }
    };

    return (
        <div style={{ animation: 'fadeUp 0.4s ease both' }}>
            <Helmet>
                <title>Calendar | Wildcat Calendar</title>
            </Helmet>
            {/* Header */}
            <div style={{ position: 'relative', zIndex: 100, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '2.4rem', fontFamily: 'var(--font-display)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                        {view === 'agenda' ? 'Agenda' : format(month, 'MMMM yyyy')}
                    </h1>
                    {isMobile ? (
                        <div style={{ marginTop: '12px' }}>
                            <MobileFilterDropdown options={filterOptions} onToggle={handleFilterToggle} />
                        </div>
                    ) : (
                        <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                            <button
                                onClick={() => setFollowedOnly(!followedOnly)}
                                className="pill"
                                style={{
                                    cursor: 'pointer', border: 'none', padding: '6px 14px', fontSize: '0.75rem',
                                    background: followedOnly ? 'var(--red)' : 'var(--white)',
                                    color: followedOnly ? '#fff' : 'var(--gray-700)',
                                    boxShadow: followedOnly ? 'none' : '0 0 0 1px var(--gray-300)',
                                    transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: '6px'
                                }}
                            >
                                <Heart size={14} fill={followedOnly ? 'currentColor' : 'none'} />
                                Your Followed Clubs
                            </button>
                            <div style={{ width: '1px', background: 'var(--gray-300)', margin: '0 4px' }} />
                            {categories.map(cat => (
                                <button
                                    key={cat.name}
                                    onClick={() => toggleCategory(cat.name)}
                                    className="pill"
                                    style={{
                                        cursor: 'pointer', border: 'none', padding: '6px 14px', fontSize: '0.75rem',
                                        background: selectedCategories.includes(cat.name) ? cat.color : 'var(--white)',
                                        color: selectedCategories.includes(cat.name) ? '#fff' : 'var(--gray-700)',
                                        boxShadow: selectedCategories.includes(cat.name) ? 'none' : '0 0 0 1px var(--gray-300)',
                                        transition: 'all 0.2s ease',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    {!selectedCategories.includes(cat.name) && (
                                        <span style={{ 
                                            display: 'inline-block', 
                                            width: '8px', 
                                            height: '8px', 
                                            borderRadius: '50%', 
                                            background: cat.color,
                                            flexShrink: 0
                                        }} />
                                    )}
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div style={{
                    display: 'flex', gap: isMobile ? '6px' : '12px', alignItems: 'center',
                    background: 'var(--white)', padding: '6px', borderRadius: 'var(--radius-pill)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid var(--border)',
                    overflowX: 'auto', maxWidth: '100%', flexShrink: 0,
                }}>
                    <div style={{ display: 'flex', gap: '2px', flexShrink: 0 }}>
                        <button onClick={() => setView('month')} className="btn btn-ghost" style={{ padding: '8px', background: view === 'month' ? 'var(--gray-100)' : 'transparent', color: view === 'month' ? 'var(--red)' : 'var(--text-muted)' }} title="Month"><LayoutGrid size={18} /></button>
                        <button onClick={() => setView('week')} className="btn btn-ghost" style={{ padding: '8px', background: view === 'week' ? 'var(--gray-100)' : 'transparent', color: view === 'week' ? 'var(--red)' : 'var(--text-muted)' }} title="Week"><CalIcon size={18} /></button>
                        <button onClick={() => setView('day')} className="btn btn-ghost" style={{ padding: '8px', background: view === 'day' ? 'var(--gray-100)' : 'transparent', color: view === 'day' ? 'var(--red)' : 'var(--text-muted)' }} title="Day"><Map size={18} /></button>
                        <button onClick={() => setView('agenda')} className="btn btn-ghost" style={{ padding: '8px', background: view === 'agenda' ? 'var(--gray-100)' : 'transparent', color: view === 'agenda' ? 'var(--red)' : 'var(--text-muted)' }} title="Agenda"><List size={18} /></button>
                    </div>

                    <div style={{ height: '24px', width: '1px', background: 'var(--border)', flexShrink: 0 }} />
                    <div style={{ display: 'flex', gap: isMobile ? '4px' : '10px', alignItems: 'center', flexShrink: 0 }}>
                        <button 
                            onClick={() => window.print()} 
                            className="btn btn-outline" 
                            style={{ 
                                height: '36px', 
                                padding: '0 12px', 
                                gap: '6px', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center' 
                            }} 
                            title="Export PDF Schedule"
                        >
                            <Printer size={16} /> {!isMobile && 'Export PDF'}
                        </button>
                        {isAdmin && (
                            <button onClick={() => navigate('/admin/dashboard')} className="btn btn-red" style={{ height: '36px', padding: '0 12px', gap: '6px' }}>
                                <Plus size={16} />
                            </button>
                        )}
                        <button onClick={() => setMonth(view === 'month' || view === 'agenda' ? subMonths(month, 1) : addDays(month, view === 'week' ? -7 : -1))} className="btn btn-ghost" style={{
                            width: '36px', height: '36px', borderRadius: '50%', border: '1px solid var(--border)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, color: 'var(--text)',
                        }}>
                            <ChevronLeft size={20} />
                        </button>
                        <button onClick={() => setMonth(new Date())} className="btn btn-outline" style={{ height: '36px', padding: '0 12px', fontSize: '0.82rem' }}>
                            Today
                        </button>
                        <button onClick={() => setMonth(view === 'month' || view === 'agenda' ? addMonths(month, 1) : addDays(month, view === 'week' ? 7 : 1))} className="btn btn-ghost" style={{
                            width: '36px', height: '36px', borderRadius: '50%', border: '1px solid var(--border)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, color: 'var(--text)',
                        }}>
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Calendar Views */}
            <div style={{ minHeight: '500px' }}>
                {loading ? (
                    <div style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        padding: '100px 20px', textAlign: 'center', animation: 'fadeUp 0.4s ease both',
                        background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)'
                    }}>
                        <div style={{
                            width: '80px', height: '80px', borderRadius: '50%', background: 'var(--gray-200)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px',
                        }}>
                            <div className="loading-spinner" />
                        </div>
                        <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '8px' }}>
                            Loading Calendar...
                        </h3>
                    </div>
                ) : displayEvents.length === 0 ? (
                    <div style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        padding: '100px 20px', textAlign: 'center', animation: 'fadeUp 0.4s ease both',
                        background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)'
                    }}>
                        <div style={{
                            width: '80px', height: '80px', borderRadius: '50%', background: 'var(--gray-200)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px',
                        }}>
                            <CalIcon size={32} style={{ color: 'var(--gray-400)' }} />
                        </div>
                        <h3 style={{ fontSize: '1.3rem', fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '8px' }}>
                            {selectedCategories.length > 0 || followedOnly ? 'No matching events' : 'No events scheduled'}
                        </h3>
                        <p style={{ color: 'var(--text-muted)', maxWidth: '360px', margin: '0 auto', fontSize: '0.92rem' }}>
                            {selectedCategories.length > 0 || followedOnly 
                                ? 'Try adjusting your filters above to see more events.' 
                                : 'There are no events scheduled on the calendar right now.'}
                        </p>
                    </div>
                ) : (
                    <>
                        {view === 'month' && <MonthView month={month} events={displayEvents} hovered={hovered} setHovered={setHovered} onEventClick={setSelectedEvent} isAdmin={isAdmin} handleDeleteEvent={handleDelete} getEventStyle={resolveEventStyle} isMobile={isMobile} />}
                        {view === 'week' && <WeekView month={month} events={displayEvents} hovered={hovered} setHovered={setHovered} onEventClick={setSelectedEvent} isAdmin={isAdmin} handleDeleteEvent={handleDelete} getEventStyle={resolveEventStyle} isMobile={isMobile} />}
                        {view === 'day' && <DayView month={month} events={displayEvents} hovered={hovered} setHovered={setHovered} onEventClick={setSelectedEvent} isAdmin={isAdmin} handleDeleteEvent={handleDelete} getEventStyle={resolveEventStyle} />}
                        {view === 'agenda' && <AgendaView events={displayEvents} hovered={hovered} setHovered={setHovered} onEventClick={setSelectedEvent} isAdmin={isAdmin} handleDeleteEvent={handleDelete} getEventStyle={resolveEventStyle} />}
                    </>
                )}
            </div>

            {/* Event Details Modal */}
            <EventDetailModal
                event={selectedEvent}
                onClose={() => setSelectedEvent(null)}
                categories={categories}
                categoryColor={selectedEvent ? categories.find(c => c.name === selectedEvent.club?.category)?.color : undefined}
            />

            {createPortal(
                <PrintSchedule 
                    events={displayEvents.filter(ev => {
                        try {
                            const evStart = typeof ev.date === 'string' ? parseISO(ev.date) : new Date(ev.date);
                            const evEnd = ev.endDate ? (typeof ev.endDate === 'string' ? parseISO(ev.endDate) : new Date(ev.endDate)) : evStart;
                            const mStart = startOfMonth(month);
                            const mEnd = endOfMonth(month);
                            return evStart <= mEnd && evEnd >= mStart;
                        } catch {
                            return false;
                        }
                    })} 
                    title={format(month, 'MMMM yyyy')} 
                />,
                document.body
            )}
        </div>
    );
};
