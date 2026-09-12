import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Calendar } from 'lucide-react';
import { useIsMobile } from '../hooks/useIsMobile';

export const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const isMobile = useIsMobile();

    const navItems = [
        { to: '/', icon: LayoutDashboard, label: isMobile ? 'Home' : 'Dashboard', end: true },
        { to: '/clubs', icon: Users, label: 'Clubs' },
        { to: '/calendar', icon: Calendar, label: isMobile ? 'Calendar' : 'Master Calendar' },
    ];

    return (
        <header style={{ 
            width: '100%', 
            position: 'sticky', 
            top: 0, 
            zIndex: 1000, 
            boxShadow: 'var(--shadow-md)', 
            background: '#FFFFFF', 
            borderBottom: '3px solid var(--bcss-red)',
            boxSizing: 'border-box',
            overflow: 'hidden'
        }}>
            <div style={{
                maxWidth: '1360px',
                margin: '0 auto',
                paddingTop: isMobile ? '10px' : '14px',
                paddingBottom: isMobile ? '10px' : '14px',
                paddingLeft: isMobile ? 'max(12px, env(safe-area-inset-left))' : 'max(32px, env(safe-area-inset-left))',
                paddingRight: isMobile ? 'max(12px, env(safe-area-inset-right))' : 'max(32px, env(safe-area-inset-right))',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: isMobile ? '8px' : '20px',
                boxSizing: 'border-box',
                width: '100%',
                overflow: 'hidden'
            }}>
                {/* Brand Logo & Mascot Badge (Left) */}
                <div 
                    onClick={() => navigate('/')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: isMobile ? '8px' : '12px',
                        cursor: 'pointer',
                        userSelect: 'none',
                        flexShrink: 0,
                    }}
                >
                    <div style={{
                        width: isMobile ? '36px' : '42px',
                        height: isMobile ? '36px' : '42px',
                        borderRadius: '50%',
                        background: 'var(--bcss-red)',
                        padding: '2px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: 'var(--shadow-sm)',
                        flexShrink: 0,
                    }}>
                        <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <img 
                                src="/cropped-wildcat-logo.png" 
                                alt="BCSS Wildcats" 
                                style={{ width: isMobile ? '22px' : '28px', height: isMobile ? '22px' : '28px', objectFit: 'contain' }} 
                            />
                        </div>
                    </div>
                    <div className="navbar-brand-text">
                        <div style={{ 
                            fontSize: isMobile ? '1.05rem' : '1.3rem', 
                            fontWeight: 900, 
                            fontFamily: 'var(--font-display)', 
                            letterSpacing: '-0.02em', 
                            color: 'var(--text-main)',
                            lineHeight: 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px'
                        }}>
                            BCSS {!isMobile && <span style={{ color: '#FFFFFF', fontSize: '0.72rem', padding: '2px 6px', background: 'var(--bcss-red)', borderRadius: 'var(--radius-pill)', fontWeight: 800 }}>WILDCATS</span>}
                        </div>
                        {!isMobile && (
                            <div style={{ 
                                fontSize: '0.62rem', 
                                color: 'var(--text-secondary)', 
                                letterSpacing: '0.1em', 
                                textTransform: 'uppercase', 
                                fontWeight: 800,
                                marginTop: '3px'
                            }}>
                                Burnaby Central Secondary School
                            </div>
                        )}
                    </div>
                </div>

                {/* Integrated Single-Row Navigation Pill Track (Right) — scrolls instead of clipping on narrow screens */}
                <nav className="swipe-pill-track" style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: isMobile ? '4px' : '6px',
                    background: 'var(--bg-secondary)',
                    padding: isMobile ? '4px' : '5px',
                    borderRadius: 'var(--radius-pill)',
                    border: '1px solid var(--border)',
                    flexShrink: 1,
                    minWidth: 0,
                    maxWidth: '100%',
                    width: 'fit-content',
                    boxSizing: 'border-box'
                }}>
                    {navItems.map(({ to, icon: Icon, label, end }) => {
                        const isActive = end ? location.pathname === to : location.pathname.startsWith(to);
                        return (
                            <NavLink 
                                key={to} 
                                to={to} 
                                className={`nav-pill-link ${isActive ? 'active' : ''}`}
                                style={{
                                    display: 'inline-flex', 
                                    alignItems: 'center', 
                                    gap: isMobile ? '4px' : '7px',
                                    padding: isMobile ? '7px 10px' : '9px 22px', 
                                    borderRadius: 'var(--radius-pill)',
                                    color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                                    background: isActive ? 'var(--bcss-red)' : 'transparent',
                                    boxShadow: isActive ? '0 4px 12px rgba(217, 4, 41, 0.25)' : 'none',
                                    fontWeight: isActive ? 800 : 700, 
                                    fontSize: isMobile ? '0.8rem' : '0.92rem', 
                                    fontFamily: 'var(--font-display)',
                                    textDecoration: 'none', 
                                    transition: 'all 0.2s ease',
                                    whiteSpace: 'nowrap',
                                    flexShrink: 0,
                                    boxSizing: 'border-box',
                                    lineHeight: 1
                                }}
                            >
                                <Icon size={isMobile ? 14 : 17} style={{ color: isActive ? '#FFFFFF' : 'var(--bcss-red)', flexShrink: 0 }} />
                                <span>{label}</span>
                            </NavLink>
                        );
                    })}
                </nav>
            </div>
        </header>
    );
};
