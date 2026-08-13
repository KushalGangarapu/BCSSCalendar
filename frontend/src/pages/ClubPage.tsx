import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, Calendar, ArrowLeft, ExternalLink, MessageSquare, Heart, Sparkles } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Helmet } from 'react-helmet-async';
import { SkeletonClubDetail } from '../components/Skeleton';
import { useIsMobile } from '../hooks/useIsMobile';
import { usePageTitle } from '../hooks/usePageTitle';
import { useAppData } from '../context/DataContext';

export const ClubPage = () => {
    const params = useParams();
    const navigate = useNavigate();
    const isMobile = useIsMobile();
    const { clubs, categories: appCategories, loading: appLoading } = useAppData();

    const contextClub = clubs.find(c => c.id === params.id);
    const [club, setClub] = useState<any>(contextClub || null);
    usePageTitle(club?.name ? club.name : 'Club Details');
    const [categoryColor, setCategoryColor] = useState('var(--bcss-red)');
    const [loading, setLoading] = useState(!contextClub && appLoading);
    const [isFollowed, setIsFollowed] = useState(false);

    useEffect(() => {
        const followed = JSON.parse(localStorage.getItem('bcss_followed_clubs') || '[]');
        setIsFollowed(followed.includes(params.id));
    }, [params.id]);

    useEffect(() => {
        if (contextClub) {
            setClub(contextClub);
            setLoading(false);
            if (contextClub.category && appCategories) {
                const matched = appCategories.find(c => c.name.toLowerCase() === contextClub.category.toLowerCase());
                if (matched) setCategoryColor(matched.color);
            }
        }
    }, [contextClub, appCategories]);

    const toggleFollow = () => {
        const followed = JSON.parse(localStorage.getItem('bcss_followed_clubs') || '[]');
        let newFollowed;
        if (followed.includes(params.id)) {
            newFollowed = followed.filter((id: string) => id !== params.id);
            setIsFollowed(false);
        } else {
            newFollowed = [...followed, params.id];
            setIsFollowed(true);
        }
        localStorage.setItem('bcss_followed_clubs', JSON.stringify(newFollowed));
    };

    useEffect(() => {
        if (!params.id) return;
        const fetchDirect = async () => {
            try {
                const [clubRes, catRes] = await Promise.all([
                    fetch(`${import.meta.env.VITE_API_URL}/api/clubs/${params.id}`),
                    fetch(`${import.meta.env.VITE_API_URL}/api/categories`)
                ]);
                if (clubRes.ok) {
                    const clubData = await clubRes.json();
                    if (clubData && !clubData.error) {
                        setClub(clubData);
                        if (catRes.ok) {
                            const categoriesData = await catRes.json();
                            if (clubData?.category && Array.isArray(categoriesData)) {
                                const matched = categoriesData.find((c: any) => c.name.toLowerCase() === clubData.category.toLowerCase());
                                if (matched) setCategoryColor(matched.color);
                            }
                        }
                    }
                }
            } catch (err) {
                console.error('Error fetching club directly:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchDirect();

        return () => {
            document.title = 'BCSS Calendar';
        };
    }, [params.id]);

    if (loading) return (
        <div style={{ maxWidth: '900px', margin: '0 auto', width: '100%', padding: '24px 0' }}>
            <SkeletonClubDetail />
        </div>
    );
    if (!club || club.error) return (
        <div className="card" style={{ padding: '60px 24px', textAlign: 'center', maxWidth: '600px', margin: '40px auto', background: '#FFFFFF' }}>
            <h2 style={{ fontSize: '1.8rem', color: 'var(--text-main)', marginBottom: '12px' }}>Club Not Found</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>The requested Burnaby Central club page does not exist or has been removed.</p>
            <button onClick={() => navigate('/clubs')} className="btn btn-red">
                <ArrowLeft size={16} /> Back to Directory
            </button>
        </div>
    );

    return (
        <div style={{ animation: 'fadeUp 0.4s ease both' }}>
            <Helmet>
                <title>{club.name} | BCSS Calendar</title>
                <meta property="og:title" content={`${club.name} | BCSS`} />
                <meta property="og:description" content={club.description} />
                {club.imageUrl && <meta property="og:image" content={club.imageUrl} />}
                <meta name="twitter:title" content={`${club.name} | BCSS`} />
                <meta name="twitter:description" content={club.description} />
                {club.imageUrl && <meta name="twitter:image" content={club.imageUrl} />}
            </Helmet>

            <div style={{ maxWidth: '920px', margin: '0 auto', width: '100%' }}>
                <button onClick={() => navigate('/clubs')} className="btn btn-ghost" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: 0 }}>
                    <ArrowLeft size={18} /> Back to Directory
                </button>

                {/* Cover Media Banner */}
                <div style={{
                    borderRadius: 'var(--radius-xl)', 
                    overflow: 'hidden', 
                    marginBottom: '28px',
                    width: '100%',
                    aspectRatio: '21 / 9',
                    border: '1px solid var(--border)',
                    boxShadow: 'var(--shadow-sm)',
                    position: 'relative',
                    background: 'var(--bg-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                }}>
                    {club.imageUrl ? (
                        <img 
                            src={club.imageUrl} 
                            alt={club.name} 
                            loading="lazy" 
                            decoding="async" 
                            style={{
                                width: '100%', 
                                height: '100%',
                                objectFit: 'cover',
                                objectPosition: 'center',
                                display: 'block'
                            }} 
                        />
                    ) : (
                        <span style={{
                            fontSize: isMobile ? '1.8rem' : '2.4rem',
                            fontWeight: 900,
                            fontFamily: 'var(--font-display)',
                            color: '#334155',
                            textAlign: 'center',
                            lineHeight: 1.2,
                            letterSpacing: '-0.02em',
                            maxWidth: '90%',
                            padding: '36px 24px',
                        }}>
                            {club.name}
                        </span>
                    )}
                </div>

                <div className="card" style={{ padding: '40px', position: 'relative', background: '#FFFFFF' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <span className="pill" style={{ fontSize: '0.8rem', padding: '6px 16px', background: categoryColor, color: '#FFFFFF', fontWeight: 800 }}>
                            {club.category}
                        </span>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', gap: '16px' }}>
                        <h1 style={{ fontSize: 'clamp(1.75rem, 3.8vw, 2.75rem)', fontWeight: 900, fontFamily: 'var(--font-display)', margin: 0, lineHeight: 1.1, color: 'var(--text-main)' }}>
                            {club.name}
                        </h1>
                        <button
                            onClick={toggleFollow}
                            className={`btn ${isFollowed ? 'btn-red' : 'btn-outline'}`}
                            style={{ gap: '8px', paddingInline: '22px' }}
                        >
                            <Heart size={18} fill={isFollowed ? 'currentColor' : 'none'} />
                            {isFollowed ? 'Following Club' : 'Follow Club'}
                        </button>
                    </div>

                    {/* Social links */}
                    {(club.instagram || club.discord) && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginBottom: '36px', paddingBottom: '32px', borderBottom: '1px solid var(--border)' }}>
                            {club.instagram && (
                                <a 
                                    href={club.instagram.startsWith('http') ? club.instagram : `https://${club.instagram}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="btn btn-outline"
                                    style={{ padding: '10px 18px', fontSize: '0.9rem' }}
                                >
                                    <ExternalLink size={16} style={{ color: 'var(--bcss-red)' }} /> Instagram
                                </a>
                            )}
                            {club.discord && (
                                <a 
                                    href={club.discord.startsWith('http') ? club.discord : `https://${club.discord}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="btn btn-outline"
                                    style={{ padding: '10px 18px', fontSize: '0.9rem' }}
                                >
                                    <MessageSquare size={16} style={{ color: 'var(--bcss-red)' }} /> Discord Community
                                </a>
                            )}
                        </div>
                    )}

                    <div style={{ marginBottom: '44px' }}>
                        <h3 style={{ fontSize: '1.3rem', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)' }}>
                            <Users size={20} style={{ color: 'var(--bcss-red)' }} /> About {club.name}
                        </h3>
                        <p style={{ fontSize: '1.08rem', lineHeight: 1.7, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
                            {club.description}
                        </p>
                    </div>

                    <div>
                        <h3 style={{ fontSize: '1.3rem', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)' }}>
                            <Calendar size={20} style={{ color: 'var(--bcss-red)' }} /> Upcoming Club Events
                        </h3>

                        {club.events && club.events.length > 0 ? (() => {
                            const now = new Date();
                            const upcomingEvents = club.events.filter((ev: any) => {
                                const start = new Date(ev.date);
                                const end = ev.endDate ? new Date(ev.endDate) : null;
                                return start >= now || (end && end >= now);
                            }).filter((ev: any, index: number, self: any[]) =>
                                index === self.findIndex((t) => t.title === ev.title)
                            );
                            return upcomingEvents.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                    {upcomingEvents.map((ev: any) => (
                                        <div 
                                            key={ev.id} 
                                            className="card card-hover"
                                            onClick={() => navigate(`/events/${ev.id}`)} 
                                            style={{
                                                padding: '18px 24px', 
                                                display: 'flex', 
                                                justifyContent: 'space-between', 
                                                alignItems: 'center',
                                                cursor: 'pointer', 
                                                background: '#FFFFFF',
                                            }}
                                        >
                                            <div>
                                                <div style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '4px', color: 'var(--text-main)', fontFamily: 'var(--font-display)' }}>{ev.title}</div>
                                                <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                                                    {format(parseISO(ev.date), 'EEEE, MMM do • h:mm a')}{ev.endDate ? ` – ${format(parseISO(ev.endDate), 'h:mm a')}` : ''}
                                                </div>
                                            </div>
                                            <div style={{ color: 'var(--bcss-red)', fontWeight: 700, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                View Details <Sparkles size={14} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ padding: '36px', textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.98rem' }}>There are no upcoming events currently scheduled for this club.</p>
                                </div>
                            );
                        })() : (
                            <div style={{ padding: '36px', textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.98rem' }}>There are no upcoming events currently scheduled for this club.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
