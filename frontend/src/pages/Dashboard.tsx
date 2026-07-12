import { useEffect, useState } from 'react';
import { Eye, Calendar, Users, ArrowRight, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { isEventLive } from '../utils/timeUtils';
import { SkeletonClubCard, SkeletonEventItem } from '../components/Skeleton';

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
            {value === null || value === undefined ? (
                <div style={{
                    width: '60px', height: '32px', marginTop: '2px', borderRadius: '4px',
                    background: 'var(--gray-200)',
                    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                }} />
            ) : (
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--red)', fontFamily: 'var(--font-display)', lineHeight: 1.1, marginTop: '2px' }}>
                    {value.toLocaleString()}
                </div>
            )}
        </div>
    </div>
);

export const Dashboard = () => {
    const [metrics, setMetrics] = useState<{ pageVisits?: number; clubCount?: number; eventCount?: number }>({});
    const [events, setEvents] = useState<any[]>([]);
    const [clubs, setClubs] = useState<any[]>([]);
    const [categories, setCategories] = useState<{ name: string, color: string }[]>([]);
    const [followedOnly, setFollowedOnly] = useState(false);
    const [followedClubIds, setFollowedClubIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        fetch(`${import.meta.env.VITE_API_URL}/api/dashboard`)
            .then(r => {
                if (!r.ok) throw new Error('Failed to fetch dashboard data');
                return r.json();
            })
            .then(data => {
                setMetrics(data.metrics || {});
                setEvents(data.events || []);
                setClubs(data.clubs || []);
                setCategories(data.categories || []);

                const visitKey = 'bcss_has_visited_v2';
                if (!localStorage.getItem(visitKey)) {
                    fetch(`${import.meta.env.VITE_API_URL}/api/metrics/visit`, { method: 'POST' }).catch(console.error);
                    localStorage.setItem(visitKey, 'true');
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));

        const followed = JSON.parse(localStorage.getItem('bcss_followed_clubs') || '[]');
        setFollowedClubIds(followed);
    }, []);

    const now = new Date();
    const upcomingEvents = events.filter(e => {
        const start = new Date(e.date);
        const end = e.endDate ? new Date(e.endDate) : null;
        if (end) {
            return end >= now;
        } else {
            // Live for 60 minutes after start
            const oneHourLater = new Date(start.getTime() + 60 * 60 * 1000);
            return oneHourLater >= now;
        }
    });

    const getEventCategoryColor = (event: any) => {
        const clubCat = event.club?.category;
        const matched = categories.find(c => c.name === clubCat);
        if (matched) return matched.color;

        if (event.tags && event.tags.length > 0) {
            for (const tag of event.tags) {
                const tagMatched = categories.find(c => c.name === tag);
                if (tagMatched) return tagMatched.color;
            }
        }
        return 'var(--red)';
    };

    const filteredEvents = followedOnly
        ? upcomingEvents.filter(e => followedClubIds.includes(e.clubId))
        : upcomingEvents;

    const displayEvents = filteredEvents.slice(0, 5);

    const isMobile = window.innerWidth <= 1200;

    return (
        <div>
            <Helmet>
                <title>Dashboard | Wildcat Calendar</title>
            </Helmet>
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
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '16px', marginBottom: '40px' }}>
                <StatCard icon={Eye} label="Unique Visits" value={metrics.pageVisits!} delay={0.15} />
                <StatCard icon={Calendar} label="Upcoming Events" value={metrics.eventCount!} delay={0.25} />
                <StatCard icon={Users} label="Number of Clubs" value={metrics.clubCount!} delay={0.35} />
            </div>

            {/* Split Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '24px', animation: 'fadeUp 0.5s ease 0.4s both' }}>
                {/* Featured Clubs */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h2 style={{ fontSize: '1.3rem', fontFamily: 'var(--font-display)' }}>Featured Clubs</h2>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {loading ? (
                            Array.from({ length: 3 }).map((_, i) => <SkeletonClubCard key={i} />)
                        ) : clubs.length > 0 ? (
                            clubs.map(club => (
                                <div key={club.id} className="card card-hover" onClick={() => navigate(`/clubs/${club.id}`)} style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', gap: '16px' }}>
                                    <div style={{ flex: '1 1 auto', minWidth: 0 }}>
                                        <div style={{ fontWeight: 700, fontSize: '1rem', fontFamily: 'var(--font-display)', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{club.name}</div>
                                        <div style={{
                                            fontSize: '0.82rem', color: 'var(--text-muted)',
                                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                        }}>{club.category}</div>
                                    </div>
                                    <button className="btn btn-red" style={{ padding: '6px 16px', fontSize: '0.8rem', whiteSpace: 'nowrap', flexShrink: 0 }}>
                                        View
                                    </button>
                                </div>
                            ))
                        ) : (
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
                        <button
                            onClick={() => setFollowedOnly(!followedOnly)}
                            className="btn btn-ghost"
                            style={{
                                fontSize: '0.75rem', padding: '6px 12px', gap: '6px',
                                background: followedOnly ? 'rgba(239,68,68,0.1)' : 'transparent',
                                color: followedOnly ? 'var(--red)' : 'var(--text-muted)'
                            }}
                        >
                            <Heart size={14} fill={followedOnly ? 'currentColor' : 'none'} />
                            Your Schedule
                        </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => <SkeletonEventItem key={i} />)
                        ) : displayEvents.length > 0 ? (
                            displayEvents.map((event, idx) => {
                                const isLive = isEventLive(event.date, event.endDate);
                                const d = new Date(event.date);
                                const month = d.toLocaleString('en', { month: 'short' }).toUpperCase();
                                const day = d.getDate();
                                const categoryColor = getEventCategoryColor(event);
                                return (
                                    <div key={event.id || idx} onClick={() => navigate(`/events/${event.id}`)} style={{
                                        display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 18px', cursor: 'pointer',
                                        borderLeft: `4px solid ${categoryColor}`,
                                        background: 'var(--surface)',
                                        borderRadius: 'var(--radius-md)',
                                        borderTop: '1px solid var(--border)',
                                        borderRight: '1px solid var(--border)',
                                        borderBottom: '1px solid var(--border)',
                                        transition: 'all 0.2s ease',
                                    }}
                                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                                    >
                                        <div style={{
                                            minWidth: '50px', height: '50px', borderRadius: 'var(--radius-md)',
                                            background: 'var(--black)', color: '#fff', display: 'flex', flexDirection: 'column',
                                            alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)',
                                        }}>
                                            <span style={{ fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.1em', color: categoryColor }}>{month}</span>
                                            <span style={{ fontSize: '1.15rem', fontWeight: 800, lineHeight: 1 }}>{day}</span>
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{
                                                fontWeight: 700, fontSize: '0.94rem', fontFamily: 'var(--font-display)',
                                                display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap'
                                            }}>
                                                {isLive && <span className="glowing-dot" />}
                                                <span style={{ wordBreak: 'break-word' }}>{event.title}</span>
                                                {isLive && <span style={{ fontSize: '0.62rem', color: '#fff', background: 'var(--red)', padding: '2px 8px', borderRadius: '4px', fontWeight: 800, letterSpacing: '0.05em' }}>LIVE</span>}
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                                {d.toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' })}{event.endDate ? (() => { const ed = new Date(event.endDate); return d.toDateString() === ed.toDateString() ? ` – ${ed.toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' })}` : ` – ${ed.toLocaleDateString('en', { month: 'long', day: 'numeric' })}`; })() : ''} · <span style={{ color: 'var(--text)', fontWeight: 600 }}>{event.club?.name || 'School Event'}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
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
