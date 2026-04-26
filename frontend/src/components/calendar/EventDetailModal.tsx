import { format, parseISO } from 'date-fns';
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
            background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)',
            zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '24px', opacity: 1, transition: 'all 0.3s ease'
        }} onClick={onClose}>
            <div className="card" onClick={e => e.stopPropagation()} style={{
                width: '100%', maxWidth: '460px', background: 'var(--bg)',
                padding: '36px', borderRadius: '24px',
                position: 'relative', animation: 'scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) both',
                boxShadow: `0 24px 48px rgba(0,0,0,0.12), 0 0 0 1px var(--border), 0 8px 32px ${categoryColor ? categoryColor + '33' : 'rgba(0,0,0,0.05)'}`,
                overflow: 'hidden'
            }}>
                {categoryColor && (
                    <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, height: '6px',
                        background: categoryColor
                    }} />
                )}
                <button onClick={onClose} className="btn btn-ghost" style={{
                    position: 'absolute', top: '20px', right: '20px', padding: '8px',
                    borderRadius: '50%', background: 'var(--gray-50)', color: 'var(--gray-500)'
                }}>
                    <X size={20} />
                </button>

                <div style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
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
                        <span className="pill" style={{
                            background: 'var(--gray-100)', color: 'var(--gray-800)', border: 'none', fontWeight: 600
                        }}>
                            {event.club?.name || 'Burnaby Central'}
                        </span>
                    </div>
                    <h2 style={{
                        fontSize: '2rem', fontFamily: 'var(--font-display)',
                        fontWeight: 800, lineHeight: 1.15, margin: '16px 0 16px', letterSpacing: '-0.02em'
                    }}>
                        {event.title}
                    </h2>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gray-600)', fontSize: '0.95rem', fontWeight: 500 }}>
                        <Clock size={18} style={{ color: categoryColor || 'var(--red)' }} />
                        {format(parseISO(event.date), 'EEEE, MMMM do, yyyy \u00B7 h:mm a')}
                    </div>
                </div>

                {event.description && (
                    <div style={{
                        paddingTop: '24px', marginTop: '8px', borderTop: '1px solid var(--border)',
                        color: 'var(--gray-700)', lineHeight: 1.6, fontSize: '1rem', whiteSpace: 'pre-wrap'
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
