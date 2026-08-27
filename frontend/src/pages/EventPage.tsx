import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Tag, ChevronDown, Sparkles } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Helmet } from 'react-helmet-async';
import { generateGoogleCalendarUrl, getAppleCalendarUrl } from '../utils/calendarExport';
import { usePageTitle } from '../hooks/usePageTitle';
import { useAppData } from '../context/DataContext';
import { formatEventTime } from '../utils/timeUtils';

export const EventPage = () => {
    const params = useParams();
    const navigate = useNavigate();
    const { events, categories: appCategories, loading: appLoading } = useAppData();

    const contextEvent = events.find(e => e.id === params.id);
    const [event, setEvent] = useState<any>(contextEvent || null);
    usePageTitle(event?.title ? event.title : 'Event Details');
    const [categories, setCategories] = useState<{ name: string, color: string }[]>(appCategories || []);
    const [loading, setLoading] = useState(!contextEvent && appLoading);
    const [showExportDropdown, setShowExportDropdown] = useState(false);

    useEffect(() => {
        if (contextEvent) {
            setEvent(contextEvent);
            setLoading(false);
        }
        if (appCategories && appCategories.length > 0) {
            setCategories(appCategories);
        }
    }, [contextEvent, appCategories]);

    useEffect(() => {
        if (!params.id) return;
        const fetchDirect = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/events/${params.id}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data && !data.error) {
                        setEvent(data);
                    }
                }
            } catch (err) {
                console.error('Error fetching event directly:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchDirect();

        return () => {
            document.title = 'BCSS Calendar';
        };
    }, [params.id]);

    const recurrenceEndDate = event?.recurrenceEndDate || (() => {
        if (!event?.recurring || !Array.isArray(events)) return null;
        const series = events
            .filter(e => e.title?.trim().toLowerCase() === event.title?.trim().toLowerCase() && (e.clubId || null) === (event.clubId || null) && e.recurring)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const lastInSeries = series[series.length - 1];
        return lastInSeries ? (lastInSeries.endDate || lastInSeries.date) : null;
    })();

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', width: '100%' }}>
            <div className="loading-spinner" />
        </div>
    );
    if (!event || event.error) return (
        <div className="card" style={{ padding: '60px 24px', textAlign: 'center', maxWidth: '600px', margin: '40px auto', background: '#FFFFFF' }}>
            <h2 style={{ fontSize: '1.8rem', color: 'var(--text-main)', marginBottom: '12px' }}>Event Not Found</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>The requested Burnaby Central event page does not exist or has been removed.</p>
            <button onClick={() => navigate('/calendar')} className="btn btn-red">
                <ArrowLeft size={16} /> Back to Calendar
            </button>
        </div>
    );

    return (
        <div style={{ animation: 'fadeUp 0.4s ease both' }}>
            <Helmet>
                <title>{event.title} | BCSS Calendar</title>
            </Helmet>

            <div style={{ maxWidth: '920px', margin: '0 auto', width: '100%' }}>
                <button onClick={() => navigate('/calendar')} className="btn btn-ghost" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: 0 }}>
                    <ArrowLeft size={18} /> Back to Calendar
                </button>

                <div className="card" style={{ padding: '44px', position: 'relative', background: '#FFFFFF' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '18px' }}>
                        {event.tags && event.tags.length > 0 ? (
                            event.tags.map((tag: string) => {
                                const catColor = categories.find(c => c.name.toLowerCase().trim() === tag.toLowerCase().trim())?.color || '#0F172A';
                                return (
                                    <span key={tag} className="pill" style={{
                                        fontSize: '0.8rem',
                                        padding: '6px 16px',
                                        background: catColor,
                                        color: '#FFFFFF',
                                        fontWeight: 800,
                                        border: 'none',
                                        textTransform: 'uppercase',
                                    }}>
                                        {tag}
                                    </span>
                                );
                            })
                        ) : (
                            <span className="pill" style={{ 
                                fontSize: '0.8rem', 
                                padding: '6px 16px', 
                                background: categories.find(c => c.name.toLowerCase().trim() === (event.club?.category || '').toLowerCase().trim())?.color || '#0F172A',
                                color: '#FFFFFF',
                                fontWeight: 800,
                                border: 'none',
                                textTransform: 'uppercase',
                            }}>
                                {event.club?.category || 'School Event'}
                            </span>
                        )}
                    </div>

                    <h1 style={{ 
                        fontSize: 'clamp(1.75rem, 3.8vw, 2.75rem)', 
                        fontWeight: 900, 
                        fontFamily: 'var(--font-display)', 
                        marginBottom: '28px', 
                        lineHeight: 1.15, 
                        wordWrap: 'break-word', 
                        overflowWrap: 'break-word',
                        color: 'var(--text-main)' 
                    }}>
                        {event.title}
                    </h1>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', marginBottom: '36px', paddingBottom: '32px', borderBottom: '1px solid var(--border)', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)' }}>
                                <Calendar size={20} style={{ color: 'var(--bcss-blue)' }} />
                                <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{format(typeof event.date === 'string' ? parseISO(event.date) : new Date(event.date), 'EEEE, MMMM do, yyyy')}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)' }}>
                                <Clock size={20} style={{ color: 'var(--bcss-blue)' }} />
                                <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                                    {formatEventTime(event.date, event.endDate)}
                                </span>
                            </div>
                            {event.club && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)' }}>
                                    <Tag size={20} style={{ color: 'var(--bcss-red)' }} />
                                    <span style={{ fontWeight: 600 }}>Hosted by: <button onClick={() => navigate(`/clubs/${event.club.id}`)} style={{ background: 'none', border: 'none', color: 'var(--bcss-red)', cursor: 'pointer', padding: 0, fontWeight: 800, fontSize: '1.05rem', fontFamily: 'var(--font-display)' }}>{event.club.name}</button></span>
                                </div>
                            )}
                        </div>

                        <div style={{ position: 'relative' }}>
                            <button 
                                onClick={() => setShowExportDropdown(!showExportDropdown)}
                                className="btn btn-outline"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '10px 18px',
                                    fontSize: '0.9rem',
                                }}
                            >
                                <Calendar size={16} style={{ color: 'var(--bcss-red)' }} /> Add to Calendar <ChevronDown size={14} style={{ transform: showExportDropdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
                            </button>
                            {showExportDropdown && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    right: 0,
                                    marginTop: '8px',
                                    background: '#FFFFFF',
                                    border: '1px solid var(--border-strong)',
                                    borderRadius: 'var(--radius-md)',
                                    boxShadow: 'var(--shadow-lg)',
                                    zIndex: 10,
                                    overflow: 'hidden',
                                    minWidth: '220px',
                                    animation: 'fadeUp 0.15s ease both',
                                }}>
                                    <a 
                                        href={generateGoogleCalendarUrl(event, recurrenceEndDate)} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        onClick={() => setShowExportDropdown(false)}
                                        style={{
                                            display: 'block',
                                            padding: '12px 18px',
                                            fontSize: '0.88rem',
                                            fontWeight: 700,
                                            color: 'var(--text-main)',
                                            textDecoration: 'none',
                                            transition: 'background 0.2s ease',
                                            cursor: 'pointer',
                                            borderBottom: '1px solid var(--border)',
                                        }}
                                    >
                                        Google Calendar (App / Web)
                                    </a>
                                    <a 
                                        href={getAppleCalendarUrl(event)} 
                                        onClick={() => setShowExportDropdown(false)}
                                        style={{
                                            display: 'block',
                                            padding: '12px 18px',
                                            fontSize: '0.88rem',
                                            fontWeight: 700,
                                            color: 'var(--text-main)',
                                            textDecoration: 'none',
                                            transition: 'background 0.2s ease',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        Apple Calendar (iCal / iOS)
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <h3 style={{ fontSize: '1.3rem', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: '18px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Sparkles size={18} style={{ color: 'var(--bcss-blue)' }} /> About This Event
                        </h3>
                        {event.description ? (
                            <p style={{ fontSize: '1.08rem', lineHeight: 1.7, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>{event.description}</p>
                        ) : (
                            <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No additional details provided for this event.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
