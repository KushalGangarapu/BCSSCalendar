import { useState, useEffect } from 'react';
import { Search, X, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

interface Club {
    id: string; name: string; category: string; description: string;
    instagram?: string; discord?: string; imageUrl?: string;
}

export const ClubsDirectory = () => {
    const [clubs, setClubs] = useState<Club[]>([]);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [followedClubIds, setFollowedClubIds] = useState<string[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_URL}/api/clubs`)
            .then(r => r.json())
            .then(data => { setClubs(data); setLoading(false); })
            .catch(() => setLoading(false));

        const followed = JSON.parse(localStorage.getItem('bcss_followed_clubs') || '[]');
        setFollowedClubIds(followed);
    }, []);

    const categories = Array.from(new Set(clubs.map(c => c.category)));
    const filtered = clubs.filter(c => {
        const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase());
        return matchSearch && (!category || c.category === category);
    });


    return (
        <div style={{ animation: 'fadeUp 0.4s ease both' }}>
            <Helmet>
                <title>Directory | Wildcat Calendar</title>
            </Helmet>
            <style>
                {`
                .clubs-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 20px;
                }
                @media (max-width: 1024px) {
                    .clubs-grid { grid-template-columns: repeat(3, 1fr); }
                }
                @media (max-width: 768px) {
                    .clubs-grid { grid-template-columns: repeat(2, 1fr); }
                }
                @media (max-width: 480px) {
                    .clubs-grid { grid-template-columns: 1fr; }
                }
                `}
            </style>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-display)', fontWeight: 800, letterSpacing: '-0.03em' }}>
                    Clubs Directory
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '6px' }}>
                    Find your community at Burnaby Central.
                </p>
            </div>

            {/* Search & Filters */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '28px', animation: 'fadeUp 0.4s ease 0.1s both' }}>
                <div style={{ position: 'relative', width: '100%' }}>
                    <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)', pointerEvents: 'none' }} />
                    <input
                        className="input"
                        style={{ paddingLeft: '42px', width: '100%' }}
                        placeholder="Search clubs..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <button onClick={() => setCategory(null)} className="pill" style={{
                        cursor: 'pointer', border: 'none', padding: '8px 16px', fontSize: '0.78rem',
                        background: !category ? 'var(--black)' : 'var(--white)',
                        color: !category ? '#fff' : 'var(--gray-700)',
                        boxShadow: !category ? 'none' : '0 0 0 1.5px var(--gray-300)',
                        transition: 'all 0.2s ease',
                    }}>
                        All
                    </button>
                    {categories.map(cat => (
                        <button key={cat} onClick={() => setCategory(cat)} className="pill" style={{
                            cursor: 'pointer', border: 'none', padding: '8px 16px', fontSize: '0.78rem',
                            background: category === cat ? 'var(--black)' : 'var(--white)',
                            color: category === cat ? '#fff' : 'var(--gray-700)',
                            boxShadow: category === cat ? 'none' : '0 0 0 1.5px var(--gray-300)',
                            transition: 'all 0.2s ease',
                        }}>
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="clubs-grid">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                        <div key={i} style={{ height: '340px', borderRadius: 'var(--radius-lg)', background: 'var(--gray-200)' }} />
                    ))}
                </div>
            ) : filtered.length > 0 ? (
                <div className="clubs-grid" style={{ animation: 'fadeUp 0.4s ease 0.15s both' }}>
                    {filtered.map((club, idx) => (
                        <div key={club.id} className="card card-hover" onClick={() => navigate(`/clubs/${club.id}`)} style={{
                            display: 'flex', flexDirection: 'column',
                            animation: `fadeUp 0.4s ease ${0.1 + idx * 0.04}s both`, cursor: 'pointer', overflow: 'hidden'
                        }}>
                            {/* Card Thumbnail */}
                            <div style={{ aspectRatio: '21 / 9', overflow: 'hidden', flexShrink: 0 }}>
                                {club.imageUrl ? (
                                    <img src={club.imageUrl} alt={club.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{
                                        width: '100%', height: '100%',
                                        background: 'linear-gradient(135deg, var(--gray-100) 0%, var(--gray-200) 100%)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <span style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--gray-300)' }}>
                                            {club.name.charAt(0)}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div style={{ padding: '20px 24px 16px', flex: 1 }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginBottom: '10px', gap: '8px' }}>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-display)', lineHeight: 1.2 }}>
                                        {club.name}
                                    </h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                                        {followedClubIds.includes(club.id) && (
                                            <Heart size={16} fill="var(--red)" color="var(--red)" />
                                        )}
                                        <span className="pill pill-dark" style={{ flexShrink: 0 }}>
                                            {club.category}
                                        </span>
                                    </div>
                                </div>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', whiteSpace: 'normal', marginTop: '4px' }}>
                                    {club.description}
                                </p>
                            </div>
                            <div style={{ padding: '0 24px 24px' }}>
                                <button className="btn btn-outline" style={{ width: '100%', borderColor: 'transparent', background: 'var(--gray-100)' }}>
                                    View Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                /* Empty State */
                <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    padding: '80px 20px', textAlign: 'center', animation: 'fadeUp 0.4s ease both',
                }}>
                    <div style={{
                        width: '80px', height: '80px', borderRadius: '50%', background: 'var(--gray-200)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px',
                    }}>
                        <Search size={32} style={{ color: 'var(--gray-400)' }} />
                    </div>
                    <h3 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '8px' }}>
                        No clubs found
                    </h3>
                    <p style={{ color: 'var(--text-muted)', maxWidth: '360px', marginBottom: '24px' }}>
                        No clubs match "{search}" in this category.
                    </p>
                    <button onClick={() => { setSearch(''); setCategory(null); }} className="btn btn-red">
                        <X size={16} /> Clear Filters
                    </button>
                </div>
            )}
        </div>
    );
};
