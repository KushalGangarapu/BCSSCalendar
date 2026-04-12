import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, Calendar, ArrowLeft, ExternalLink, MessageSquare } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export const ClubPage = () => {
    const params = useParams();
    const navigate = useNavigate();
    const [club, setClub] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!params.id) return;
        fetch(`${import.meta.env.VITE_API_URL}/api/clubs/${params.id}`)
            .then(res => res.json())
            .then(data => {
                setClub(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [params.id]);

    if (loading) return <div className="main" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}><div className="loading-spinner" /></div>;
    if (!club || club.error) return <div className="main" style={{ padding: '40px', textAlign: 'center' }}><h2>Club not found</h2><button onClick={() => navigate('/clubs')} className="btn btn-ghost">Back to Directory</button></div>;

    return (
        <main className="main" style={{ animation: 'fadeUp 0.4s ease both' }}>
            <div style={{ maxWidth: '900px', margin: '0 auto', width: '100%' }}>
                <button onClick={() => navigate('/clubs')} className="btn btn-ghost" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: 0 }}>
                    <ArrowLeft size={18} /> Back to Directory
                </button>

                <div className="card" style={{ padding: '40px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <span style={{
                            background: 'rgba(239, 68, 68, 0.1)', color: 'var(--red)',
                            padding: '6px 14px', borderRadius: 'var(--radius-pill)',
                            fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase',
                        }}>{club.category}</span>
                    </div>

                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: '16px', lineHeight: 1.1 }}>
                        {club.name}
                    </h1>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '32px', paddingBottom: '32px', borderBottom: '1px solid var(--border)' }}>
                        {club.instagram && (
                            <a href={club.instagram.startsWith('http') ? club.instagram : `https://${club.instagram}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text)', textDecoration: 'none', fontWeight: 600, background: 'var(--gray-100)', padding: '8px 16px', borderRadius: 'var(--radius-md)' }}>
                                <ExternalLink size={18} className="text-red" /> Instagram
                            </a>
                        )}
                        {club.discord && (
                            <a href={club.discord.startsWith('http') ? club.discord : `https://${club.discord}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text)', textDecoration: 'none', fontWeight: 600, background: 'var(--gray-100)', padding: '8px 16px', borderRadius: 'var(--radius-md)' }}>
                                <MessageSquare size={18} className="text-red" /> Discord
                            </a>
                        )}
                    </div>

                    <div style={{ marginBottom: '40px' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Users size={20} className="text-red" /> About {club.name}
                        </h3>
                        <p style={{ fontSize: '1.05rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
                            {club.description}
                        </p>
                    </div>

                    <div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Calendar size={20} className="text-red" /> Upcoming Events
                        </h3>

                        {club.events && club.events.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {club.events.map((ev: any) => (
                                    <div key={ev.id} onClick={() => navigate(`/events/${ev.id}`)} style={{
                                        padding: '16px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)',
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        cursor: 'pointer', background: 'var(--surface)',
                                        transition: 'all 0.2s ease',
                                    }}
                                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--red)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}
                                    >
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '4px' }}>{ev.title}</div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                                {format(parseISO(ev.date), 'EEEE, MMM do • h:mm a')}
                                            </div>
                                        </div>
                                        <div style={{ color: 'var(--red)', fontWeight: 600, fontSize: '0.85rem' }}>View Details &rarr;</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ padding: '32px', textAlign: 'center', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border)' }}>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>There are no upcoming events scheduled for this club.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
};
