import { useEffect, useState } from 'react';
import { Eye, Calendar, Users, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface StatCardProps {
    icon: any;
    label: string;
    value: number;
    delay: number;
}

const StatCard = ({ icon: Icon, label, value, delay }: StatCardProps) => (
    <div className="card" style={{
        padding: '24px 28px',
        display: 'flex', alignItems: 'center', gap: '20px',
        animation: `fadeUp 0.5s ease ${delay}s both`,
    }}>
        <div style={{
            width: '48px', height: '48px', borderRadius: 'var(--radius-md)',
            background: 'var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
            <Icon size={22} style={{ color: 'var(--red)' }} />
        </div>
        <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
                {label}
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--red)', fontFamily: 'var(--font-display)', lineHeight: 1.1, marginTop: '2px' }}>
                {value.toLocaleString()}
            </div>
        </div>
    </div>
);

export const Dashboard = () => {
    const [metrics, setMetrics] = useState({ pageVisits: 0, clubCount: 0, eventCount: 0 });
    const [events, setEvents] = useState<any[]>([]);
    const [clubs, setClubs] = useState<any[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_URL}/api/metrics`)
            .then(r => r.json())
            .then(data => { setMetrics(data); fetch(`${import.meta.env.VITE_API_URL}/api/metrics/visit`, { method: 'POST' }); })
            .catch(console.error);

        fetch(`${import.meta.env.VITE_API_URL}/api/events`)
            .then(r => r.json())
            .then(data => setEvents(data.slice(0, 5)))
            .catch(console.error);

        fetch(`${import.meta.env.VITE_API_URL}/api/clubs`)
            .then(r => r.json())
            .then(data => setClubs(data.slice(0, 3)))
            .catch(console.error);
    }, []);

    return (
        <div>
            {/* Hero Section — Dark with red accents */}
            <div style={{
                background: 'linear-gradient(135deg, var(--black) 0%, #1a1a2e 50%, var(--black) 100%)',
                borderRadius: 'var(--radius-xl)',
                padding: '48px 44px',
                marginBottom: '32px',
                position: 'relative',
                overflow: 'hidden',
                animation: 'fadeUp 0.4s ease both',
            }}>
                {/* Red glow accents */}
                <div style={{
                    position: 'absolute', top: '-80px', right: '-40px',
                    width: '300px', height: '300px', borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(211,47,47,0.15) 0%, transparent 70%)',
                    pointerEvents: 'none',
                }} />
                <div style={{
                    position: 'absolute', bottom: '-60px', left: '20%',
                    width: '200px', height: '200px', borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(211,47,47,0.1) 0%, transparent 70%)',
                    pointerEvents: 'none',
                }} />
                <h1 style={{
                    fontSize: '2.8rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)',
                    marginBottom: '8px', letterSpacing: '-0.03em', position: 'relative',
                }}>
                    Welcome <span style={{ color: 'var(--red)' }}>Wildcats</span>
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.1rem', position: 'relative', maxWidth: '500px' }}>
                    Your central hub for clubs, events, and everything BCSS.
                </p>
            </div>

            {/* Stat Cards — Page Visits, Upcoming Events, Number of Clubs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '40px' }}>
                <StatCard icon={Eye} label="Page Visits" value={metrics.pageVisits} delay={0.15} />
                <StatCard icon={Calendar} label="Upcoming Events" value={metrics.eventCount || events.length} delay={0.25} />
                <StatCard icon={Users} label="Number of Clubs" value={metrics.clubCount || clubs.length} delay={0.35} />
            </div>

            {/* Split Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', animation: 'fadeUp 0.5s ease 0.4s both' }}>
                {/* Featured Clubs */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h2 style={{ fontSize: '1.3rem', fontFamily: 'var(--font-display)' }}>Featured Clubs</h2>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {clubs.map(club => (
                            <div key={club.id} className="card" onClick={() => navigate(`/clubs/${club.id}`)} style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                                <div style={{ flex: 1, minWidth: 0, marginRight: '16px' }}>
                                    <div style={{ fontWeight: 700, fontSize: '1rem', fontFamily: 'var(--font-display)' }}>{club.name}</div>
                                    <div style={{
                                        fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px',
                                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                    }}>{club.description}</div>
                                </div>
                                <button className="btn btn-red" style={{ padding: '8px 20px', fontSize: '0.8rem', whiteSpace: 'nowrap', flexShrink: 0 }}>
                                    Join
                                </button>
                            </div>
                        ))}
                        {clubs.length === 0 && (
                            <div className="card" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>No clubs yet</div>
                        )}
                    </div>
                    <button onClick={() => navigate('/clubs')} className="btn btn-outline" style={{ marginTop: '16px', width: '100%' }}>
                        View All Clubs <ArrowRight size={16} />
                    </button>
                </div>

                {/* Upcoming Events */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h2 style={{ fontSize: '1.3rem', fontFamily: 'var(--font-display)' }}>Upcoming Events</h2>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                        {events.length > 0 ? events.map((event, idx) => {
                            const d = new Date(event.date);
                            const month = d.toLocaleString('en', { month: 'short' }).toUpperCase();
                            const day = d.getDate();
                            return (
                                <div key={idx} onClick={() => navigate(`/events/${event.id}`)} style={{
                                    display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 0', cursor: 'pointer',
                                    borderBottom: idx < events.length - 1 ? '1px solid var(--border)' : 'none',
                                }}>
                                    <div style={{
                                        minWidth: '52px', height: '52px', borderRadius: 'var(--radius-md)',
                                        background: 'var(--black)', color: '#fff', display: 'flex', flexDirection: 'column',
                                        alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)',
                                    }}>
                                        <span style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--red)' }}>{month}</span>
                                        <span style={{ fontSize: '1.2rem', fontWeight: 800, lineHeight: 1 }}>{day}</span>
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{
                                            fontWeight: 700, fontSize: '0.92rem', fontFamily: 'var(--font-display)',
                                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                        }}>{event.title}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                            {d.toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' })} · {event.club?.name || 'BCSS'}
                                        </div>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="card" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                No upcoming events
                            </div>
                        )}
                    </div>
                    <button onClick={() => navigate('/calendar')} className="btn btn-outline" style={{ marginTop: '16px', width: '100%' }}>
                        View Calendar <ArrowRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};
