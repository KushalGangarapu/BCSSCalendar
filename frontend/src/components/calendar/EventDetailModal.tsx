import { useState } from 'react';
import { format, parseISO, isSameDay } from 'date-fns';
import { X, Clock, ExternalLink, Calendar, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { generateGoogleCalendarUrl, getAppleCalendarUrl } from '../../utils/calendarExport';

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
    const [showExportDropdown, setShowExportDropdown] = useState(false);

    if (!event) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()} style={{
                maxWidth: '460px',
                padding: '32px',
                position: 'relative',
            }}>
                <button onClick={onClose} className="btn btn-ghost" style={{
                    position: 'absolute', top: '16px', right: '16px', padding: '8px'
                }}>
                    <X size={20} />
                </button>

                <div style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px', paddingRight: '24px' }}>
                        {event.tags && event.tags.length > 0 ? (
                            event.tags.map((tag: string) => {
                                const catColor = categories.find(c => c.name === tag)?.color || 'var(--gray-800)';
                                return (
                                    <span key={tag} className="pill" style={{
                                        background: catColor,
                                        color: '#fff', border: 'none', fontWeight: 700
                                    }}>
                                        {tag}
                                    </span>
                                );
                            })
                        ) : (
                            <span className="pill" style={{
                                background: categoryColor || 'var(--red)',
                                color: '#fff', border: 'none', fontWeight: 700
                            }}>
                                {event.club?.category || 'School Event'}
                            </span>
                        )}
                        <span className="pill pill-outline" style={{ background: 'var(--white)' }}>
                            {event.club?.name || 'Burnaby Central'}
                        </span>
                    </div>
                    <h2 style={{
                        fontSize: '1.8rem', fontFamily: 'var(--font-display)',
                        fontWeight: 800, lineHeight: 1.2, margin: '8px 0 16px', wordWrap: 'break-word', overflowWrap: 'break-word'
                    }}>
                        {event.title}
                    </h2>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                        <Clock size={16} style={{ color: categoryColor || 'var(--red)' }} />
                        {format(parseISO(event.date), 'EEEE, MMMM do, yyyy \u00B7 h:mm a')}
                        {event.endDate && (isSameDay(parseISO(event.date), parseISO(event.endDate)) ? ` \u2013 ${format(parseISO(event.endDate), 'h:mm a')}` : ` \u2013 ${format(parseISO(event.endDate), 'EEEE, MMMM do \u00B7 h:mm a')}`)}
                    </div>
                </div>

                {event.description && (
                    <div style={{
                        paddingTop: '20px', borderTop: '1px solid var(--border)',
                        color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.95rem', whiteSpace: 'pre-wrap'
                    }}>
                        {event.description}
                    </div>
                )}

                <div style={{ marginTop: '32px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <button onClick={() => navigate(`/events/${event.id}`)} className="btn" style={{
                        flex: 1, background: categoryColor || 'var(--red)', color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                    }}>
                        View Full Event <ExternalLink size={16} />
                    </button>
                    {isAdmin && onEditEvent && (
                        <button onClick={() => { onClose(); onEditEvent(event); }} className="btn btn-outline" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                            Edit Event
                        </button>
                    )}
                    {event.clubId && (
                        <button onClick={() => navigate(`/clubs/${event.clubId}`)} className="btn btn-outline" style={{ flex: 1 }}>
                            View Club
                        </button>
                    )}
                </div>

                <div style={{ marginTop: '12px', position: 'relative' }}>
                    <button 
                        onClick={() => setShowExportDropdown(!showExportDropdown)} 
                        className="btn btn-outline" 
                        style={{ 
                            width: '100%', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            gap: '8px',
                            background: showExportDropdown ? 'var(--gray-100)' : 'transparent',
                        }}
                    >
                        <Calendar size={16} /> Add to Calendar <ChevronDown size={14} style={{ transform: showExportDropdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
                    </button>
                    {showExportDropdown && (
                        <div style={{
                            position: 'absolute',
                            bottom: '100%',
                            left: 0,
                            right: 0,
                            marginBottom: '8px',
                            background: 'var(--surface)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-md)',
                            boxShadow: 'var(--shadow-md)',
                            zIndex: 10,
                            overflow: 'hidden',
                            animation: 'fadeUp 0.15s ease both',
                        }}>
                            <a 
                                href={generateGoogleCalendarUrl(event)} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                onClick={() => setShowExportDropdown(false)}
                                style={{
                                    display: 'block',
                                    padding: '10px 16px',
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
                                    padding: '10px 16px',
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
        </div>
    );
};
