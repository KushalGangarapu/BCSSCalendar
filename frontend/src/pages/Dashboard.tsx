import { useEffect, useState } from 'react';
import { Eye, Calendar, Users, ArrowRight, Heart, Star, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { isEventLive, isAllDayEvent, formatEventTime } from '../utils/timeUtils';
import { endOfDay } from 'date-fns';
import { SkeletonClubCard, SkeletonEventItem } from '../components/Skeleton';
import { useIsMobile } from '../hooks/useIsMobile';
import { usePageTitle } from '../hooks/usePageTitle';
import { useAppData } from '../context/DataContext';
import { filterRecurringEvents } from '../utils/recurringUtils';

export const Dashboard = () => {
    usePageTitle('Dashboard');
    const { events, clubs, categories, metrics, loading } = useAppData();
    const [followedOnly, setFollowedOnly] = useState(false);
    const [followedClubIds, setFollowedClubIds] = useState<string[]>([]);
    const navigate = useNavigate();
    const isMobile = useIsMobile();

    useEffect(() => {
        const followed = JSON.parse(localStorage.getItem('bcss_followed_clubs') || '[]');
        setFollowedClubIds(followed);
    }, []);

    const now = new Date();
    const upcomingEvents = filterRecurringEvents(events).filter(e => {
        const start = new Date(e.date);
        const end = e.endDate ? new Date(e.endDate) : null;
        if (end) {
            return end >= now;
        } else if (isAllDayEvent(start, null)) {
            // All-day events stay "upcoming" for their entire day
            return endOfDay(start) >= now;
        } else {
            const oneHourLater = new Date(start.getTime() + 60 * 60 * 1000);
            return oneHourLater >= now;
        }
    });

    const getCategoryColor = (catName: string) => {
        if (!catName) return 'var(--bcss-red)';
        const matched = categories.find(c => c.name.toLowerCase().trim() === catName.toLowerCase().trim());
        return matched?.color || 'var(--bcss-red)';
    };

    const getEventCategoryColor = (event: any) => {
        if (event.tags && event.tags.length > 0) {
            for (const tag of event.tags) {
                if (tag.toLowerCase().trim() === 'school event') continue;
                const matchedColor = getCategoryColor(tag);
                if (matchedColor) return matchedColor;
            }
        }
        const clubCat = event.club?.category;
        if (clubCat && clubCat !== 'School Event') {
            return getCategoryColor(clubCat);
        }
        return '#0F172A';
    };

    const filteredEvents = followedOnly
        ? upcomingEvents.filter(e => e.clubId && followedClubIds.includes(e.clubId))
        : upcomingEvents;

    const displayEvents = filteredEvents.slice(0, 6);
    const nextLiveEvent = upcomingEvents.find(e => isEventLive(e.date, e.endDate)) || upcomingEvents[0];

    return (
        <div style={{ animation: 'fadeUp 0.4s ease both' }}>
            <Helmet>
                <title>Dashboard | BCSS Calendar</title>
            </Helmet>

            {/* Clean Harmonized Hero Billboard Section */}
            <div className="card" style={{
                background: '#FFFFFF',
                borderRadius: 'var(--radius-xl)',
                padding: isMobile ? '32px 24px' : '44px 48px',
                marginBottom: '32px',
                color: 'var(--text-main)',
                boxShadow: 'var(--shadow-sm)',
                border: '1px solid var(--border-strong)',
            }}>
                <div style={{ display: 'grid', gridTemplateColumns: nextLiveEvent && !isMobile ? '1.3fr 1fr' : '1fr', gap: '32px', alignItems: 'center' }}>
                    {/* Left Column */}
                    <div>
                        <h1 style={{
                            fontSize: 'clamp(1.8rem, 4vw, 3.1rem)',
                            fontWeight: 900,
                            color: 'var(--text-main)',
                            fontFamily: 'var(--font-display)',
                            marginBottom: '14px',
                            lineHeight: 1.1,
                            letterSpacing: '-0.03em'
                        }}>
                            Welcome to <br />
                            the <span style={{ color: 'var(--bcss-red)' }}>Wildcat Calendar</span>
                        </h1>

                        <p style={{
                            color: 'var(--text-secondary)',
                            fontSize: 'clamp(0.95rem, 1.2vw, 1.08rem)',
                            lineHeight: 1.6,
                            marginBottom: '28px',
                            maxWidth: '640px'
                        }}>
                            Your central portal for active Burnaby Central student clubs and student activities.
                        </p>

                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            <button onClick={() => navigate('/clubs')} className="btn btn-red" style={{ padding: '14px 28px', fontWeight: 800 }}>
                                <Users size={18} /> Explore Student Clubs
                            </button>
                            <button onClick={() => navigate('/calendar')} className="btn btn-outline" style={{ padding: '14px 28px', fontWeight: 800 }}>
                                <Calendar size={18} /> View Master Calendar
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Live Event Spotlight (Only rendered if an event exists) */}
                    {nextLiveEvent && (
                        <div 
                            onClick={() => navigate(`/events/${nextLiveEvent.id}`)}
                            className="card card-hover"
                            style={{
                                background: 'var(--bg-secondary)',
                                borderRadius: 'var(--radius-xl)',
                                padding: '24px',
                                cursor: 'pointer',
                                color: 'var(--text-main)',
                                border: '1px solid var(--border-strong)',
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                {isEventLive(nextLiveEvent.date, nextLiveEvent.endDate) ? (
                                    <span className="pill" style={{ fontSize: '0.72rem', background: 'var(--bcss-red)', color: '#FFF', border: 'none' }}>
                                        Happening Now
                                    </span>
                                ) : (
                                    <span className="pill pill-red" style={{ fontSize: '0.72rem' }}>
                                        Next Event
                                    </span>
                                )}
                            </div>

                            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, fontFamily: 'var(--font-display)', color: 'var(--text-main)', marginBottom: '8px', lineHeight: 1.25 }}>
                                {nextLiveEvent.title}
                            </h3>

                            <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                <Clock size={16} style={{ color: 'var(--bcss-red)' }} />
                                {`${new Date(nextLiveEvent.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} · ${formatEventTime(nextLiveEvent.date, nextLiveEvent.endDate)}`}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '14px', borderTop: '1px solid var(--border)' }}>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                                    {nextLiveEvent.club?.name || 'Burnaby Central'}
                                </span>
                                <span style={{ color: 'var(--bcss-red)', fontWeight: 800, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    Event Details <ArrowRight size={15} />
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Stat Cards Horizon */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '20px', marginBottom: '36px' }}>
                <div className="card card-hover" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '18px' }}>
                    <div style={{ width: '52px', height: '52px', borderRadius: 'var(--radius-md)', background: 'var(--bcss-red-soft)', color: 'var(--bcss-red)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Eye size={26} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>Unique Visits</div>
                        <div style={{ fontSize: 'clamp(1.65rem, 2.4vw, 2.1rem)', fontWeight: 900, color: 'var(--text-main)', fontFamily: 'var(--font-display)' }}>{metrics.pageVisits ? metrics.pageVisits.toLocaleString() : '0'}</div>
                    </div>
                </div>

                <div className="card card-hover" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '18px' }}>
                    <div style={{ width: '52px', height: '52px', borderRadius: 'var(--radius-md)', background: 'var(--bcss-red-soft)', color: 'var(--bcss-red)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Users size={26} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>Active Student Clubs</div>
                        <div style={{ fontSize: 'clamp(1.65rem, 2.4vw, 2.1rem)', fontWeight: 900, color: 'var(--text-main)', fontFamily: 'var(--font-display)' }}>{metrics.clubCount || 0}</div>
                    </div>
                </div>

                <div className="card card-hover" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '18px' }}>
                    <div style={{ width: '52px', height: '52px', borderRadius: 'var(--radius-md)', background: 'var(--bcss-red-soft)', color: 'var(--bcss-red)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Calendar size={26} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>Upcoming Events</div>
                        <div style={{ fontSize: 'clamp(1.65rem, 2.4vw, 2.1rem)', fontWeight: 900, color: 'var(--text-main)', fontFamily: 'var(--font-display)' }}>{metrics.eventCount || 0}</div>
                    </div>
                </div>
            </div>

            {/* Split Main Content Area */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '32px' }}>
                
                {/* Left Side: Featured Clubs */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                        <h2 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)' }}>
                            <Star size={22} fill="currentColor" style={{ color: 'var(--bcss-red)' }} />
                            Featured Student Clubs
                        </h2>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {loading ? (
                            Array.from({ length: 3 }).map((_, i) => <SkeletonClubCard key={i} />)
                        ) : (() => {
                            const featuredClubs = clubs.filter(c => c.isFeatured);
                            const displayClubs = featuredClubs.length > 0 ? featuredClubs : clubs.slice(0, 5);
                            return displayClubs.length > 0 ? (
                                displayClubs.map(club => {
                                    const catColor = getCategoryColor(club.category);
                                    return (
                                        <div 
                                            key={club.id} 
                                            className="card card-hover" 
                                            onClick={() => navigate(`/clubs/${club.id}`)} 
                                            style={{ 
                                                padding: '18px 22px', 
                                                display: 'flex', 
                                                justifyContent: 'space-between', 
                                                alignItems: 'center', 
                                                cursor: 'pointer', 
                                                gap: '16px' 
                                            }}
                                        >
                                        <div style={{ flex: '1 1 auto', minWidth: 0 }}>
                                            <span style={{ 
                                                fontSize: '0.72rem', 
                                                padding: '4px 12px', 
                                                background: catColor, 
                                                color: '#FFFFFF', 
                                                fontWeight: 800, 
                                                borderRadius: 'var(--radius-pill)', 
                                                display: 'inline-block',
                                                marginBottom: '6px',
                                                fontFamily: 'var(--font-display)',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.03em'
                                            }}>
                                                {club.category}
                                            </span>
                                            <div style={{ 
                                                fontWeight: 800, 
                                                fontSize: '1.1rem', 
                                                fontFamily: 'var(--font-display)', 
                                                color: 'var(--text-main)',
                                                whiteSpace: 'nowrap', 
                                                overflow: 'hidden', 
                                                textOverflow: 'ellipsis' 
                                            }}>
                                                {club.name}
                                            </div>
                                        </div>
                                        <button className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '0.82rem', whiteSpace: 'nowrap', flexShrink: 0 }}>
                                            View Club
                                        </button>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="card" style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>No clubs registered yet</div>
                        );
                    })()}
                    </div>

                    <button onClick={() => navigate('/clubs')} className="btn btn-outline" style={{ marginTop: '20px', width: '100%' }}>
                        View All Registered Clubs ({metrics.clubCount || clubs.length}) &rarr;
                    </button>
                </div>

                {/* Right Side: Upcoming Events */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                        <h2 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)' }}>
                            <Calendar size={22} style={{ color: 'var(--bcss-red)' }} />
                            Upcoming Events
                        </h2>
                        <button
                            onClick={() => setFollowedOnly(!followedOnly)}
                            className={`pill ${followedOnly ? 'pill-red' : 'pill-dark'}`}
                            style={{ cursor: 'pointer', padding: '6px 14px', fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                            <Heart size={14} fill={followedOnly ? 'currentColor' : 'none'} />
                            Followed Clubs
                        </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
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
                                    <div 
                                        key={event.id || idx} 
                                        className="card card-hover"
                                        onClick={() => navigate(`/events/${event.id}`)} 
                                        style={{
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: '16px', 
                                            padding: '16px 20px', 
                                            cursor: 'pointer',
                                            borderLeft: `5px solid ${categoryColor}`,
                                        }}
                                    >
                                        <div style={{
                                            minWidth: '54px', 
                                            height: '54px', 
                                            borderRadius: 'var(--radius-md)',
                                            background: 'var(--bg-secondary)', 
                                            border: '1px solid var(--border)',
                                            color: 'var(--text-main)', 
                                            display: 'flex', 
                                            flexDirection: 'column',
                                            alignItems: 'center', 
                                            justifyContent: 'center', 
                                            fontFamily: 'var(--font-display)',
                                            flexShrink: 0
                                        }}>
                                            <span style={{ fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.1em', color: categoryColor }}>{month}</span>
                                            <span style={{ fontSize: '1.3rem', fontWeight: 900, lineHeight: 1 }}>{day}</span>
                                        </div>

                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{
                                                fontWeight: 800, 
                                                fontSize: '1.02rem', 
                                                fontFamily: 'var(--font-display)',
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                gap: '8px', 
                                                flexWrap: 'wrap',
                                                color: 'var(--text-main)'
                                            }}>
                                                {isLive && <span className="glowing-dot" />}
                                                <span style={{ wordBreak: 'break-word' }}>{event.title}</span>
                                                {isLive && (
                                                    <span style={{ fontSize: '0.62rem', color: '#FFF', background: 'var(--bcss-red)', padding: '2px 8px', borderRadius: '4px', fontWeight: 900 }}>
                                                        LIVE
                                                    </span>
                                                )}
                                            </div>
                                            <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                                {formatEventTime(event.date, event.endDate)} · <span style={{ color: 'var(--text-main)', fontWeight: 700 }}>{event.club?.name || 'Burnaby Central'}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="card" style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                No upcoming events scheduled
                            </div>
                        )}
                    </div>

                    <button onClick={() => navigate('/calendar')} className="btn btn-outline" style={{ marginTop: '20px', width: '100%' }}>
                        View Interactive Master Calendar &rarr;
                    </button>
                </div>

            </div>
        </div>
    );
};
