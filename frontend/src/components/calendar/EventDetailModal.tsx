import { useState } from 'react';
import { format, parseISO, isSameDay } from 'date-fns';
import { X, Clock, ExternalLink, Calendar, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { generateGoogleCalendarUrl, getAppleCalendarUrl } from '../../utils/calendarExport';
import { useAppData } from '../../context/DataContext';
import { isAllDayEvent } from '../../utils/timeUtils';
import { RichDescription } from '../common/RichDescription';
import { useIsMobile } from '../../hooks/useIsMobile';

interface EventDetailModalProps {
    event: any;
    onClose: () => void;
    categories?: { name: string, color: string }[];
    categoryColor?: string;
    isAdmin?: boolean;
    onEditEvent?: (event: any) => void;
}

export const EventDetailModal = ({ event, onClose, categories = [], categoryColor, isAdmin, onEditEvent }: EventDetailModalProps) => {
    const navigate = useNavigate();
    const { events: allEvents } = useAppData();
    const isMobile = useIsMobile();
    const [showExportDropdown, setShowExportDropdown] = useState(false);

    if (!event) return null;

    const startDt = typeof event.date === 'string' ? parseISO(event.date) : new Date(event.date);
    const endDt = event.endDate ? (typeof event.endDate === 'string' ? parseISO(event.endDate) : new Date(event.endDate)) : null;

    const recurrenceEndDate = event.recurrenceEndDate || (() => {
        if (!event.recurring || !Array.isArray(allEvents)) return null;
        const series = allEvents
            .filter(e => e.title?.trim().toLowerCase() === event.title?.trim().toLowerCase() && (e.clubId || null) === (event.clubId || null) && e.recurring)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const lastInSeries = series[series.length - 1];
        return lastInSeries ? (lastInSeries.endDate || lastInSeries.date) : null;
    })();

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()} style={{
                maxWidth: '480px',
                padding: isMobile ? '24px 20px calc(env(safe-area-inset-bottom, 0px) + 24px)' : '36px',
                position: 'relative',
                background: '#FFFFFF',
                borderRadius: 'var(--radius-xl)',
                boxShadow: 'var(--shadow-xl)',
                border: '1px solid var(--border-strong)',
            }}>
                <button onClick={onClose} className="btn btn-ghost" style={{
                    position: 'absolute', top: '18px', right: '18px', padding: '8px', color: 'var(--text-muted)'
                }}>
                    <X size={20} />
                </button>

                <div style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px', paddingRight: '24px' }}>
                        {event.tags && event.tags.length > 0 ? (
                            event.tags.map((tag: string) => {
                                const catColor = categories.find(c => c.name.toLowerCase().trim() === tag.toLowerCase().trim())?.color || 'var(--bcss-red)';
                                return (
                                    <span key={tag} className="pill" style={{
                                        background: catColor,
                                        color: '#fff', 
                                        border: 'none', 
                                        fontWeight: 800,
                                        fontFamily: 'var(--font-display)',
                                        textTransform: 'uppercase',
                                        fontSize: '0.72rem',
                                        padding: '4px 12px',
                                    }}>
                                        {tag}
                                    </span>
                                );
                            })
                        ) : (
                            <span className="pill" style={{
                                background: '#0F172A',
                                color: '#FFFFFF', 
                                border: 'none', 
                                fontWeight: 800,
                                fontFamily: 'var(--font-display)',
                                textTransform: 'uppercase',
                                fontSize: '0.72rem',
                                padding: '4px 12px',
                            }}>
                                {event.club?.category || 'School Event'}
                            </span>
                        )}
                        <span 
                            className="pill" 
                            onClick={event.clubId ? () => navigate(`/clubs/${event.clubId}`) : undefined}
                            style={{
                                background: 'var(--bg-secondary)',
                                color: 'var(--text-main)',
                                border: '1px solid var(--border-strong)',
                                fontWeight: 800,
                                fontSize: '0.72rem',
                                padding: '4px 12px',
                                textTransform: 'uppercase',
                                cursor: event.clubId ? 'pointer' : 'default',
                            }}
                        >
                            {event.club?.name || 'Burnaby Central'}
                        </span>
                    </div>

                    <h2 style={{
                        fontSize: '2rem', 
                        fontFamily: 'var(--font-display)',
                        fontWeight: 900, 
                        lineHeight: 1.2, 
                        margin: '8px 0 16px', 
                        wordWrap: 'break-word', 
                        overflowWrap: 'break-word',
                        color: 'var(--text-main)',
                    }}>
                        {event.title}
                    </h2>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: 600 }}>
                        <Clock size={16} style={{ color: categoryColor || 'var(--bcss-red)' }} />
                        {isAllDayEvent(event.date, event.endDate) ? (
                            endDt && !isSameDay(startDt, endDt)
                                ? `${format(startDt, 'EEEE, MMMM do, yyyy')} – ${format(endDt, 'EEEE, MMMM do, yyyy')} · All Day`
                                : `${format(startDt, 'EEEE, MMMM do, yyyy')} · All Day`
                        ) : (
                            <>
                                {format(startDt, 'EEEE, MMMM do, yyyy · h:mm a')}
                                {endDt && (isSameDay(startDt, endDt) ? ` – ${format(endDt, 'h:mm a')}` : ` – ${format(endDt, 'EEEE, MMMM do · h:mm a')}`)}
                            </>
                        )}
                    </div>
                </div>

                {event.description && (
                    <div style={{
                        paddingTop: '20px', 
                        borderTop: '1px solid var(--border)',
                        color: 'var(--text-secondary)', 
                        lineHeight: 1.6, 
                        fontSize: '0.98rem', 
                    }}>
                        <RichDescription content={event.description} />
                    </div>
                )}

                <div style={{ marginTop: '28px', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : (isAdmin ? '1fr 1fr' : (event.clubId ? '1fr 1fr' : '1fr')), gap: '12px' }}>
                    <button 
                        onClick={() => navigate(`/events/${event.id}`)} 
                        className="btn btn-red" 
                        style={{
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            gap: '8px', 
                            fontWeight: 800,
                            height: '46px',
                            borderRadius: 'var(--radius-pill)',
                            whiteSpace: 'nowrap',
                            fontSize: '0.9rem'
                        }}
                    >
                        View Full Event <ExternalLink size={16} />
                    </button>
                    {isAdmin && onEditEvent ? (
                        <button 
                            onClick={() => { onClose(); onEditEvent(event); }} 
                            className="btn btn-outline" 
                            style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                gap: '6px', 
                                fontWeight: 800,
                                height: '46px',
                                borderRadius: 'var(--radius-pill)',
                                whiteSpace: 'nowrap',
                                fontSize: '0.9rem'
                            }}
                        >
                            Edit Event
                        </button>
                    ) : event.clubId ? (
                        <button 
                            onClick={() => navigate(`/clubs/${event.clubId}`)} 
                            className="btn btn-outline" 
                            style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                fontWeight: 800,
                                height: '46px',
                                borderRadius: 'var(--radius-pill)',
                                whiteSpace: 'nowrap',
                                fontSize: '0.9rem'
                            }}
                        >
                            View Club
                        </button>
                    ) : null}
                </div>

                <div style={{ marginTop: '12px' }}>
                    <button 
                        onClick={() => setShowExportDropdown(!showExportDropdown)} 
                        className="btn btn-outline" 
                        style={{ 
                            width: '100%', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            gap: '8px',
                            fontWeight: 800,
                            height: '46px',
                            background: showExportDropdown ? 'var(--bcss-red-soft)' : '#FFFFFF',
                            borderColor: showExportDropdown ? 'var(--bcss-red)' : 'var(--border-strong)',
                            color: showExportDropdown ? 'var(--bcss-red)' : 'var(--text-main)',
                            borderRadius: showExportDropdown ? 'var(--radius-md) var(--radius-md) 0 0' : 'var(--radius-pill)',
                            whiteSpace: 'nowrap',
                            fontSize: '0.9rem',
                        }}
                    >
                        <Calendar size={16} style={{ color: 'var(--bcss-red)' }} /> Add to Calendar <ChevronDown size={14} style={{ transform: showExportDropdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
                    </button>
                    {showExportDropdown && (
                        <div style={{
                            border: '1px solid var(--border-strong)',
                            borderTop: 'none',
                            borderRadius: '0 0 var(--radius-md) var(--radius-md)',
                            overflow: 'hidden',
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
                                    background: '#FFFFFF',
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bcss-red-soft)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = '#FFFFFF'}
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
                                    background: '#FFFFFF',
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bcss-red-soft)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = '#FFFFFF'}
                            >
                                Apple Calendar (iCal / iOS)
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
