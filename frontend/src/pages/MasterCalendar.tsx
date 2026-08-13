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
import { EditEventModal } from '../components/calendar/EditEventModal';
import { MobileFilterDropdown } from '../components/MobileFilterDropdown';
import { PrintSchedule } from '../components/calendar/PrintSchedule';
import { usePageTitle } from '../hooks/usePageTitle';
import { useAppData } from '../context/DataContext';
import { filterRecurringEvents } from '../utils/recurringUtils';

interface Event {
    id: string; title: string; date: string; endDate?: string | null; description?: string;
    clubId?: string;
    club?: { name: string; category: string };
    recurring?: string | null;
    tags?: string[];
}

const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    useEffect(() => {
        const handler = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handler);
        return () => window.removeEventListener('resize', handler);
    }, []);
    return isMobile;
};

// Color-coding for event types
const getEventStyle = (_clubName?: string, categoryColor?: string | null): React.CSSProperties => {
    if (categoryColor) {
        return { background: categoryColor, color: '#FFFFFF', border: '1px solid rgba(0,0,0,0.06)' };
    }
    return { background: '#0F172A', color: '#FFFFFF', border: '1px solid rgba(0,0,0,0.1)' };
};

export const MasterCalendar = () => {
    usePageTitle('Master Calendar');
    const { events, clubs, categories, deleteOptimisticEvent, refreshData, loading } = useAppData();

    const [view, setView] = useState<'month' | 'week' | 'day' | 'agenda'>('month');
    const [month, setMonth] = useState(new Date());
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [hovered, setHovered] = useState<Event | null>(null);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [followedOnly, setFollowedOnly] = useState(false);
    const [followedClubIds] = useState<string[]>(() => {
        try {
            return JSON.parse(localStorage.getItem('bcss_followed_clubs') || '[]');
        } catch {
            return [];
        }
    });
    const navigate = useNavigate();
    const isMobile = useIsMobile();

    const refreshEvents = () => {
        refreshData('events');
    };

    const handleExportPDF = () => {
        const originalTitle = document.title;
        document.title = '';
        window.print();
        setTimeout(() => {
            document.title = originalTitle || 'Master Calendar | BCSS Calendar';
        }, 1000);
    };

    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_URL}/api/auth/verify`, { credentials: 'include' })
            .then(r => setIsAdmin(r.ok))
            .catch(() => setIsAdmin(false));
    }, []);

    const handleDelete = async (event: Event) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this event?');
        if (!confirmDelete) return;

        let allFuture = false;
        if (event.recurring) {
            allFuture = window.confirm('This is a recurring event series.\n\nClick OK to ALSO delete ALL FUTURE occurrences.\nClick Cancel to ONLY delete this specific date.');
        }

        deleteOptimisticEvent(event.id);

        const r = await fetch(`${import.meta.env.VITE_API_URL}/api/events/${event.id}?allFuture=${allFuture}`, { method: 'DELETE', credentials: 'include' });
        if (r.ok) {
            refreshData('events');
        } else {
            refreshData('events');
        }
    };

    const displayEvents = filterRecurringEvents(events).filter(ev => {
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

        // 1. If event has tags, match to the category color
        if (ev.tags && ev.tags.length > 0) {
            for (const tag of ev.tags) {
                if (tag.toLowerCase().trim() === 'school event') continue;
                const matchedCategory = categories.find(c => c.name.toLowerCase().trim() === tag.toLowerCase().trim());
                if (matchedCategory) {
                    primaryColor = matchedCategory.color;
                    break;
                }
            }
        }

        // 2. If no tag color matched, check club category
        if (!primaryColor && ev.club?.category && ev.club.category !== 'School Event') {
            primaryColor = categories.find(c => c.name.toLowerCase().trim() === ev.club?.category?.toLowerCase().trim())?.color || null;
        }

        // 3. Untagged events that say School Event only -> recolor to black (#0F172A)
        if (!primaryColor) {
            return { background: '#0F172A', color: '#FFFFFF', border: '1px solid rgba(0,0,0,0.1)' };
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

    const filterOptions = [
        { name: 'Followed Clubs', selected: followedOnly },
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
                <title>Master Calendar | BCSS Calendar</title>
            </Helmet>
            
            {/* Header Control Panel */}
            <div style={{ 
                position: 'relative', 
                zIndex: 100, 
                display: 'flex', 
                flexDirection: 'column',
                marginBottom: isMobile ? '20px' : '28px', 
                gap: '14px' 
            }}>
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: isMobile ? 'flex-start' : 'center',
                    flexWrap: 'wrap', 
                    gap: '12px' 
                }}>
                    <div>
                        <h1 style={{ fontSize: 'clamp(1.5rem, 3.2vw, 2.5rem)', fontFamily: 'var(--font-display)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1, color: 'var(--text-main)', margin: 0 }}>
                            {view === 'agenda' ? 'School Agenda' : format(month, 'MMMM yyyy')}
                        </h1>
                        {isMobile ? (
                            <div style={{ marginTop: '10px' }}>
                                <MobileFilterDropdown options={filterOptions} onToggle={handleFilterToggle} />
                            </div>
                        ) : (
                            <div style={{ display: 'flex', gap: '8px', marginTop: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
                                <button
                                    onClick={() => setFollowedOnly(!followedOnly)}
                                    className={`pill ${followedOnly ? 'pill-red' : 'pill-dark'}`}
                                    style={{
                                        cursor: 'pointer', 
                                        padding: '7px 16px', 
                                        fontSize: '0.78rem',
                                        transition: 'all 0.2s ease', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '6px'
                                    }}
                                >
                                    <Heart size={14} fill={followedOnly ? 'currentColor' : 'none'} />
                                    Your Followed Clubs
                                </button>
                                <div style={{ width: '1px', height: '20px', background: 'var(--border)', margin: '0 4px' }} />
                                {categories.map(cat => {
                                    const isSelected = selectedCategories.includes(cat.name);
                                    return (
                                        <button
                                            key={cat.name}
                                            onClick={() => toggleCategory(cat.name)}
                                            className={`pill ${isSelected ? 'pill-red' : 'pill-dark'}`}
                                            style={{
                                                cursor: 'pointer', 
                                                padding: '7px 16px', 
                                                fontSize: '0.78rem',
                                                transition: 'all 0.2s ease', 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                gap: '6px',
                                                background: isSelected ? cat.color : undefined,
                                                borderColor: isSelected ? 'transparent' : undefined,
                                                color: isSelected ? '#fff' : undefined,
                                            }}
                                        >
                                            {!isSelected && (
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
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Unified Responsive Toolbar (Zero Horizontal Scroll on all resolutions) */}
                <div style={{
                    display: 'flex', 
                    gap: '8px', 
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    width: isMobile ? '100%' : 'fit-content',
                    maxWidth: '100%',
                    boxSizing: 'border-box',
                }}>
                    {/* View Switcher Pill */}
                    <div style={{
                        display: 'flex',
                        gap: '3px',
                        alignItems: 'center',
                        background: '#FFFFFF',
                        padding: isMobile ? '4px 6px' : '6px 10px',
                        borderRadius: 'var(--radius-pill)',
                        boxShadow: 'var(--shadow-sm)',
                        border: '1px solid var(--border)',
                    }}>
                        <button 
                            onClick={() => setView('month')} 
                            className="btn btn-ghost" 
                            style={{ 
                                width: isMobile ? '32px' : '36px', height: isMobile ? '32px' : '36px', padding: 0,
                                borderRadius: '50%',
                                background: view === 'month' ? 'var(--bcss-red-soft)' : 'transparent', 
                                color: view === 'month' ? 'var(--bcss-red)' : 'var(--text-secondary)',
                                border: view === 'month' ? '1px solid rgba(217,4,41,0.3)' : '1px solid transparent',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }} 
                            title="Month View"
                        >
                            <LayoutGrid size={isMobile ? 15 : 16} />
                        </button>
                        <button 
                            onClick={() => setView('week')} 
                            className="btn btn-ghost" 
                            style={{ 
                                width: isMobile ? '32px' : '36px', height: isMobile ? '32px' : '36px', padding: 0,
                                borderRadius: '50%',
                                background: view === 'week' ? 'var(--bcss-red-soft)' : 'transparent', 
                                color: view === 'week' ? 'var(--bcss-red)' : 'var(--text-secondary)',
                                border: view === 'week' ? '1px solid rgba(217,4,41,0.3)' : '1px solid transparent',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }} 
                            title="Week View"
                        >
                            <CalIcon size={isMobile ? 15 : 16} />
                        </button>
                        <button 
                            onClick={() => setView('day')} 
                            className="btn btn-ghost" 
                            style={{ 
                                width: isMobile ? '32px' : '36px', height: isMobile ? '32px' : '36px', padding: 0,
                                borderRadius: '50%',
                                background: view === 'day' ? 'var(--bcss-red-soft)' : 'transparent', 
                                color: view === 'day' ? 'var(--bcss-red)' : 'var(--text-secondary)',
                                border: view === 'day' ? '1px solid rgba(217,4,41,0.3)' : '1px solid transparent',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }} 
                            title="Day View"
                        >
                            <Map size={isMobile ? 15 : 16} />
                        </button>
                        <button 
                            onClick={() => setView('agenda')} 
                            className="btn btn-ghost" 
                            style={{ 
                                width: isMobile ? '32px' : '36px', height: isMobile ? '32px' : '36px', padding: 0,
                                borderRadius: '50%',
                                background: view === 'agenda' ? 'var(--bcss-red-soft)' : 'transparent', 
                                color: view === 'agenda' ? 'var(--bcss-red)' : 'var(--text-secondary)',
                                border: view === 'agenda' ? '1px solid rgba(217,4,41,0.3)' : '1px solid transparent',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }} 
                            title="Agenda View"
                        >
                            <List size={isMobile ? 15 : 16} />
                        </button>
                    </div>

                    {/* Navigation & Action Controls Pill */}
                    <div style={{
                        display: 'flex', 
                        gap: isMobile ? '3px' : '6px', 
                        alignItems: 'center',
                        background: '#FFFFFF',
                        padding: isMobile ? '4px 6px' : '6px 10px',
                        borderRadius: 'var(--radius-pill)',
                        boxShadow: 'var(--shadow-sm)',
                        border: '1px solid var(--border)',
                    }}>
                        <button 
                            onClick={handleExportPDF} 
                            className="btn btn-outline" 
                            style={{ 
                                width: isMobile ? '30px' : '34px', 
                                height: isMobile ? '30px' : '34px', 
                                padding: 0, 
                                borderRadius: '50%',
                                color: 'var(--text-main)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: '#FFFFFF'
                            }} 
                            title="Export PDF Schedule"
                        >
                            <Printer size={14} />
                        </button>

                        {isAdmin && (
                            <button 
                                onClick={() => navigate('/admin/dashboard')} 
                                className="btn btn-red" 
                                style={{ 
                                    width: isMobile ? '30px' : '34px', 
                                    height: isMobile ? '30px' : '34px', 
                                    borderRadius: '50%', 
                                    padding: 0,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                                title="Create Event"
                            >
                                <Plus size={15} />
                            </button>
                        )}

                        <button 
                            onClick={() => setMonth(view === 'month' || view === 'agenda' ? subMonths(month, 1) : addDays(month, view === 'week' ? -7 : -1))} 
                            className="btn btn-outline" 
                            style={{ 
                                width: isMobile ? '30px' : '34px', 
                                height: isMobile ? '30px' : '34px', 
                                borderRadius: '50%', 
                                padding: 0, 
                                color: 'var(--text-main)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: '#FFFFFF'
                            }}
                            title="Previous"
                        >
                            <ChevronLeft size={15} />
                        </button>

                        <button 
                            onClick={() => setMonth(new Date())} 
                            className="btn btn-outline" 
                            style={{ 
                                height: isMobile ? '30px' : '34px', 
                                padding: isMobile ? '0 8px' : '0 12px', 
                                borderRadius: 'var(--radius-pill)', 
                                fontSize: isMobile ? '0.74rem' : '0.82rem', 
                                fontWeight: 800, 
                                color: 'var(--text-main)',
                                background: '#FFFFFF'
                            }}
                        >
                            Today
                        </button>

                        <button 
                            onClick={() => setMonth(view === 'month' || view === 'agenda' ? addMonths(month, 1) : addDays(month, view === 'week' ? 7 : 1))} 
                            className="btn btn-outline" 
                            style={{ 
                                width: isMobile ? '30px' : '34px', 
                                height: isMobile ? '30px' : '34px', 
                                borderRadius: '50%', 
                                padding: 0, 
                                color: 'var(--text-main)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: '#FFFFFF'
                            }}
                            title="Next"
                        >
                            <ChevronRight size={15} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Calendar Main Container */}
            <div style={{ minHeight: '520px' }}>
                {loading ? (
                    <div className="card" style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        padding: '100px 20px', textAlign: 'center', animation: 'fadeUp 0.4s ease both',
                    }}>
                        <div style={{
                            width: '70px', height: '70px', borderRadius: '50%', background: 'var(--red-soft)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px',
                        }}>
                            <div className="loading-spinner" />
                        </div>
                        <h3 style={{ fontSize: '1.3rem', fontFamily: 'var(--font-display)', fontWeight: 800, marginBottom: '8px', color: '#FFF' }}>
                            Loading Master Calendar...
                        </h3>
                    </div>
                ) : displayEvents.length === 0 ? (
                    <div className="card" style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        padding: '100px 20px', textAlign: 'center', animation: 'fadeUp 0.4s ease both',
                    }}>
                        <div style={{
                            width: '80px', height: '80px', borderRadius: '50%', background: 'var(--red-soft)',
                            border: '1px solid rgba(255,46,84,0.3)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px',
                        }}>
                            <CalIcon size={32} style={{ color: 'var(--red)' }} />
                        </div>
                        <h3 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-display)', fontWeight: 800, marginBottom: '8px', color: '#FFF' }}>
                            {selectedCategories.length > 0 || followedOnly ? 'No matching events found' : 'No events scheduled'}
                        </h3>
                        <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto', fontSize: '0.95rem' }}>
                            {selectedCategories.length > 0 || followedOnly 
                                ? 'Try adjusting your category or club filters above to reveal scheduled events.' 
                                : 'There are no events currently on the Burnaby Central master calendar for this period.'}
                        </p>
                    </div>
                ) : (
                    <>
                        {view === 'month' && <MonthView month={month} events={displayEvents} hovered={hovered} setHovered={setHovered} onEventClick={setSelectedEvent} isAdmin={isAdmin} handleDeleteEvent={handleDelete} handleEditEvent={setEditingEvent} getEventStyle={resolveEventStyle} isMobile={isMobile} />}
                        {view === 'week' && <WeekView month={month} events={displayEvents} hovered={hovered} setHovered={setHovered} onEventClick={setSelectedEvent} isAdmin={isAdmin} handleDeleteEvent={handleDelete} handleEditEvent={setEditingEvent} getEventStyle={resolveEventStyle} isMobile={isMobile} />}
                        {view === 'day' && <DayView month={month} events={displayEvents} hovered={hovered} setHovered={setHovered} onEventClick={setSelectedEvent} isAdmin={isAdmin} handleDeleteEvent={handleDelete} handleEditEvent={setEditingEvent} getEventStyle={resolveEventStyle} />}
                        {view === 'agenda' && <AgendaView events={displayEvents} hovered={hovered} setHovered={setHovered} onEventClick={setSelectedEvent} isAdmin={isAdmin} handleDeleteEvent={handleDelete} handleEditEvent={setEditingEvent} getEventStyle={resolveEventStyle} />}
                    </>
                )}
            </div>

            {/* Event Modals */}
            {createPortal(
                <>
                    <EventDetailModal
                        event={selectedEvent}
                        onClose={() => setSelectedEvent(null)}
                        categories={categories}
                        categoryColor={selectedEvent ? categories.find(c => c.name === selectedEvent.club?.category)?.color : undefined}
                        isAdmin={isAdmin}
                        onEditEvent={setEditingEvent}
                    />

                    {editingEvent && (
                        <EditEventModal
                            event={editingEvent}
                            onClose={() => setEditingEvent(null)}
                            onSaveSuccess={refreshEvents}
                            clubs={clubs}
                            categories={categories}
                        />
                    )}
                </>,
                document.body
            )}

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
                    categories={categories}
                />,
                document.body
            )}
        </div>
    );
};
