import { format, parseISO, isSameDay } from 'date-fns';
import { X, Clock, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface EventDetailModalProps {
    event: any;
    onClose: () => void;
    categories?: { name: string, color: string }[];
    categoryColor?: string;
}

export const EventDetailModal = ({ event, onClose, categories = [], categoryColor }: EventDetailModalProps) => {
    const navigate = useNavigate();

    if (!event) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'transparent',
            zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '24px'
        }} onClick={onClose}>
            <div className="card" onClick={e => e.stopPropagation()} style={{
                width: '100%', maxWidth: '440px', background: 'var(--white)',
                padding: '32px', borderRadius: 'var(--radius-xl)',
                position: 'relative', animation: 'scaleUp 0.3s ease both',
                border: '1px solid rgba(211, 47, 47, 0.4)',
                boxShadow: '0 8px 32px rgba(211, 47, 47, 0.15)'
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

                <div style={{ marginTop: '32px', display: 'flex', gap: '12px' }}>
                    <button onClick={() => navigate(`/events/${event.id}`)} className="btn" style={{
                        flex: 1, background: categoryColor || 'var(--red)', color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                    }}>
                        View Full Event <ExternalLink size={16} />
                    </button>
                    {event.clubId && (
                        <button onClick={() => navigate(`/clubs/${event.clubId}`)} className="btn btn-outline" style={{ flex: 1 }}>
                            View Club
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
