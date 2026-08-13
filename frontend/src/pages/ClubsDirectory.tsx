import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Heart, Filter, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { SkeletonClubCard } from '../components/Skeleton';
import { useIsMobile } from '../hooks/useIsMobile';
import { usePageTitle } from '../hooks/usePageTitle';
import { useAppData } from '../context/DataContext';

export const ClubsDirectory = () => {
    usePageTitle('Clubs Directory');
    const { clubs, categories, loading } = useAppData();
    const [activeCategory, setActiveCategory] = useState<string>('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [followedClubIds, setFollowedClubIds] = useState<string[]>([]);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const isMobile = useIsMobile();

    useEffect(() => {
        const followed = JSON.parse(localStorage.getItem('bcss_followed_clubs') || '[]');
        setFollowedClubIds(followed);
    }, []);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent | TouchEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, []);

    const toggleFollow = (e: React.MouseEvent, clubId: string) => {
        e.stopPropagation();
        let updated;
        if (followedClubIds.includes(clubId)) {
            updated = followedClubIds.filter(id => id !== clubId);
        } else {
            updated = [...followedClubIds, clubId];
        }
        setFollowedClubIds(updated);
        localStorage.setItem('bcss_followed_clubs', JSON.stringify(updated));
    };

    const filteredClubs = [...clubs]
        .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))
        .filter(club => {
            const matchesCategory = activeCategory === 'All' || club.category === activeCategory;
            const matchesSearch = club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (club.description || '').toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });

    return (
        <div style={{ animation: 'fadeUp 0.4s ease both' }}>
            <Helmet>
                <title>Clubs Directory | BCSS Calendar</title>
            </Helmet>

            {/* Header Banner */}
            <div style={{ marginBottom: '28px' }}>
                <h1 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', fontWeight: 900, fontFamily: 'var(--font-display)', marginBottom: '8px', color: 'var(--text-main)' }}>
                    Student Clubs Directory
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
                    Discover active Burnaby Central student clubs.
                </p>
            </div>

            {/* Search & Filter Control Hub */}
            <div className="card" style={{ padding: isMobile ? '12px 14px' : '16px 20px', marginBottom: isMobile ? '20px' : '28px', background: '#FFFFFF', position: 'relative', zIndex: 50 }}>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                    {/* Search Input */}
                    <div style={{ flex: 1, minWidth: isMobile ? '100%' : '260px', position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            className="input"
                            type="text"
                            placeholder="Search by club name or keyword..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            style={{ paddingLeft: '44px', height: '42px' }}
                        />
                    </div>

                    {/* Category Dropdown Filter matching exact UI design */}
                    <div ref={dropdownRef} style={{ position: 'relative', width: isMobile ? '100%' : 'auto' }}>
                        <button
                            type="button"
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="btn btn-outline"
                            style={{
                                height: '42px',
                                padding: '0 16px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '10px',
                                borderRadius: '10px',
                                border: '1px solid var(--border-strong)',
                                background: activeCategory !== 'All' ? 'var(--bcss-red-soft)' : '#FFFFFF',
                                color: activeCategory !== 'All' ? 'var(--bcss-red)' : 'var(--text-main)',
                                fontWeight: 800,
                                fontSize: '0.9rem',
                                fontFamily: 'var(--font-display)',
                                cursor: 'pointer',
                                boxShadow: 'var(--shadow-sm)',
                                width: isMobile ? '100%' : 'auto',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Filter size={16} />
                                <span>{activeCategory === 'All' ? 'Category' : activeCategory}</span>
                            </div>
                            {dropdownOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>

                        {/* Dropdown Menu Popup */}
                        {dropdownOpen && (
                            <div
                                style={{
                                    position: 'absolute',
                                    top: 'calc(100% + 6px)',
                                    left: 0,
                                    right: isMobile ? 0 : 'auto',
                                    zIndex: 1000,
                                    background: '#FFFFFF',
                                    border: '1px solid var(--border)',
                                    borderRadius: '12px',
                                    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.12)',
                                    minWidth: '250px',
                                    maxHeight: '380px',
                                    overflowY: 'auto',
                                    padding: '6px 0',
                                    animation: 'fadeUp 0.15s ease both',
                                }}
                            >
                                {/* Option: All */}
                                <div
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => { setActiveCategory('All'); setDropdownOpen(false); }}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '10px 18px',
                                        cursor: 'pointer',
                                        fontSize: '0.92rem',
                                        fontWeight: 800,
                                        fontFamily: 'var(--font-display)',
                                        color: activeCategory === 'All' ? 'var(--text-main)' : '#475569',
                                        background: activeCategory === 'All' ? '#F8FAFC' : 'transparent',
                                        transition: 'background 0.15s ease',
                                        userSelect: 'none',
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = '#F1F5F9')}
                                    onMouseLeave={(e) => (e.currentTarget.style.background = activeCategory === 'All' ? '#F8FAFC' : 'transparent')}
                                >
                                    <div style={{
                                        width: '18px',
                                        height: '18px',
                                        borderRadius: '4px',
                                        border: activeCategory === 'All' ? 'none' : '1.5px solid #CBD5E1',
                                        background: activeCategory === 'All' ? 'var(--bcss-red)' : '#FFFFFF',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                        transition: 'all 0.15s ease',
                                    }}>
                                        {activeCategory === 'All' && <Check size={12} strokeWidth={3.5} color="#FFFFFF" />}
                                    </div>
                                    <span>All</span>
                                </div>

                                {/* Category Options */}
                                {categories.map(cat => {
                                    const isSelected = activeCategory === cat.name;
                                    return (
                                        <div
                                            key={cat.name}
                                            role="button"
                                            tabIndex={0}
                                            onClick={() => { setActiveCategory(cat.name); setDropdownOpen(false); }}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px',
                                                padding: '10px 18px',
                                                cursor: 'pointer',
                                                fontSize: '0.92rem',
                                                fontWeight: 800,
                                                fontFamily: 'var(--font-display)',
                                                color: isSelected ? 'var(--text-main)' : '#475569',
                                                background: isSelected ? '#F8FAFC' : 'transparent',
                                                transition: 'background 0.15s ease',
                                                userSelect: 'none',
                                            }}
                                            onMouseEnter={(e) => (e.currentTarget.style.background = '#F1F5F9')}
                                            onMouseLeave={(e) => (e.currentTarget.style.background = isSelected ? '#F8FAFC' : 'transparent')}
                                        >
                                            <div style={{
                                                width: '18px',
                                                height: '18px',
                                                borderRadius: '4px',
                                                border: isSelected ? 'none' : '1.5px solid #CBD5E1',
                                                background: isSelected ? 'var(--bcss-red)' : '#FFFFFF',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0,
                                                transition: 'all 0.15s ease',
                                            }}>
                                                {isSelected && <Check size={12} strokeWidth={3.5} color="#FFFFFF" />}
                                            </div>
                                            <span>{cat.name}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Club Grid View */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(280px, 28vw, 360px), 1fr))', 
                gap: 'clamp(16px, 2.5vw, 24px)' 
            }}>
                {loading ? (
                    Array.from({ length: 6 }).map((_, i) => <SkeletonClubCard key={i} />)
                ) : filteredClubs.length > 0 ? (
                    filteredClubs.map(club => {
                        const isFollowed = followedClubIds.includes(club.id);

                        return (
                            <div
                                key={club.id}
                                className="card card-hover"
                                onClick={() => navigate(`/clubs/${club.id}`)}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    cursor: 'pointer',
                                    overflow: 'hidden',
                                    background: '#FFFFFF',
                                }}
                            >
                                {/* Card Image Area: Fits within and completely fills the given area */}
                                <div style={{ 
                                    position: 'relative', 
                                    width: '100%', 
                                    aspectRatio: '21 / 9', 
                                    overflow: 'hidden',
                                    background: 'var(--bg-secondary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
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
                                                display: 'block',
                                                transition: 'transform 0.35s ease',
                                            }}
                                        />
                                    ) : (
                                        <div style={{
                                            width: '100%',
                                            height: '100%',
                                            background: '#E2E8F0',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            padding: '20px',
                                            textAlign: 'center',
                                        }}>
                                            <span style={{
                                                fontSize: '1.2rem',
                                                fontWeight: 900,
                                                fontFamily: 'var(--font-display)',
                                                color: '#334155',
                                                lineHeight: 1.25,
                                                letterSpacing: '-0.01em',
                                            }}>
                                                {club.name}
                                            </span>
                                        </div>
                                    )}

                                    {/* Follow Button Floating Overlay */}
                                    <button
                                        onClick={(e) => toggleFollow(e, club.id)}
                                        style={{
                                            position: 'absolute',
                                            top: '12px',
                                            right: '12px',
                                            zIndex: 2,
                                            background: 'rgba(255, 255, 255, 0.95)',
                                            backdropFilter: 'blur(8px)',
                                            border: 'none',
                                            borderRadius: '50%',
                                            width: '36px',
                                            height: '36px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            color: isFollowed ? 'var(--bcss-red)' : 'var(--text-muted)',
                                            boxShadow: 'var(--shadow-sm)',
                                        }}
                                        title={isFollowed ? 'Unfollow Club' : 'Follow Club'}
                                    >
                                        <Heart size={18} fill={isFollowed ? 'currentColor' : 'none'} />
                                    </button>
                                </div>

                                {/* Club Details Content */}
                                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                    <div>
                                        <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-main)', fontFamily: 'var(--font-display)', marginBottom: '8px', lineHeight: 1.25 }}>
                                            {club.name}
                                        </h3>

                                        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                            {club.description}
                                        </p>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '14px', borderTop: '1px solid var(--border)' }}>
                                        <span style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--bcss-red)' }}>
                                            View Club Profile &rarr;
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="card" style={{ gridColumn: '1 / -1', padding: '60px 24px', textAlign: 'center', background: '#FFFFFF' }}>
                        <h3 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-display)', fontWeight: 800, marginBottom: '8px', color: 'var(--text-main)' }}>
                            No clubs found
                        </h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                            Try searching for another keyword or selecting a different category filter.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
