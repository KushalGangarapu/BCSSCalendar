import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Tag, ChevronDown } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Helmet } from 'react-helmet-async';
import { generateGoogleCalendarUrl, getAppleCalendarUrl } from '../utils/calendarExport';

export const EventPage = () => {
    const params = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showExportDropdown, setShowExportDropdown] = useState(false);

    useEffect(() => {
        if (!params.id) return;
        fetch(`${import.meta.env.VITE_API_URL}/api/events/${params.id}`)
            .then(res => res.json())
            .then(data => {
                setEvent(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [params.id]);

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '100vh', width: '100%' }}><div className="loading-spinner" /></div>;
    if (!event || event.error) return <div style={{ padding: '40px', textAlign: 'center' }}><h2>Event not found</h2><button onClick={() => navigate('/calendar')} className="btn btn-ghost">Back to Calendar</button></div>;

    return (
        <div style={{ animation: 'fadeUp 0.4s ease both' }}>
            <Helmet>
                <title>{event.title} | Wildcat Calendar</title>
            </Helmet>
            <div style={{ maxWidth: '900px', margin: '0 auto', width: '100%' }}>
                <button onClick={() => navigate('/calendar')} className="btn btn-ghost" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: 0 }}>
                    <ArrowLeft size={18} /> Back to Calendar
                </button>

                <div className="card" style={{ padding: '40px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <span style={{
                            background: 'rgba(239, 68, 68, 0.1)', color: 'var(--red)',
                            padding: '6px 14px', borderRadius: 'var(--radius-pill)',
                            fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase',
                        }}>{event.club?.category || 'Event'}</span>
                    </div>

                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: '24px', lineHeight: 1.1, wordWrap: 'break-word', overflowWrap: 'break-word' }}>
                        {event.title}
                    </h1>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', marginBottom: '32px', paddingBottom: '32px', borderBottom: '1px solid var(--border)', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)' }}>
                                <Calendar size={20} className="text-red" />
                                <span style={{ fontWeight: 500 }}>{format(parseISO(event.date), 'EEEE, MMMM do, yyyy')}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)' }}>
                                <Clock size={20} className="text-red" />
                                <span style={{ fontWeight: 500 }}>
                                    {format(parseISO(event.date), 'h:mm a')}
                                    {event.endDate && ` – ${format(parseISO(event.endDate), 'h:mm a')}`}
                                </span>
                            </div>
                            {event.club && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)' }}>
                                    <Tag size={20} className="text-red" />
                                    <span style={{ fontWeight: 500 }}>Hosted by: <button onClick={() => navigate(`/clubs/${event.club.id}`)} style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', padding: 0, fontWeight: 700, fontSize: '1.05rem', fontFamily: 'var(--font)' }}>{event.club.name}</button></span>
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
                                    background: showExportDropdown ? 'var(--gray-100)' : 'transparent',
                                    padding: '8px 16px',
                                    fontSize: '0.88rem',
                                }}
                            >
                                <Calendar size={16} /> Add to Calendar <ChevronDown size={14} style={{ transform: showExportDropdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
                            </button>
                            {showExportDropdown && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    right: 0,
                                    marginTop: '8px',
                                    background: 'var(--surface)',
                                    border: '1px solid var(--border)',
                                    borderRadius: 'var(--radius-md)',
                                    boxShadow: 'var(--shadow-lg)',
                                    zIndex: 10,
                                    overflow: 'hidden',
                                    minWidth: '220px',
                                    animation: 'fadeUp 0.15s ease both',
                                }}>
                                    <a 
                                        href={generateGoogleCalendarUrl(event)} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        onClick={() => setShowExportDropdown(false)}
                                        style={{
                                            display: 'block',
                                            padding: '12px 16px',
                                            fontSize: '0.85rem',
                                            fontWeight: 600,
                                            color: 'var(--text)',
                                            textDecoration: 'none',
                                            transition: 'background 0.2s ease',
                                            cursor: 'pointer',
                                            borderBottom: '1px solid var(--border)',
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--gray-100)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        Google Calendar (App / Web)
                                    </a>
                                    <a 
                                        href={getAppleCalendarUrl(event)} 
                                        onClick={() => setShowExportDropdown(false)}
                                        style={{
                                            display: 'block',
                                            padding: '12px 16px',
                                            fontSize: '0.85rem',
                                            fontWeight: 600,
                                            color: 'var(--text)',
                                            textDecoration: 'none',
                                            transition: 'background 0.2s ease',
                                            cursor: 'pointer',
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--gray-100)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        Apple Calendar (App / OS)
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: '16px' }}>About this Event</h3>
                        {event.description ? (
                            <p style={{ fontSize: '1.05rem', lineHeight: 1.7, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>{event.description}</p>
                        ) : (
                            <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No additional details provided.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
