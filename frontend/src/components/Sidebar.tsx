import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Calendar, ShieldCheck, Sparkles } from 'lucide-react';

const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/clubs', icon: Users, label: 'Directory' },
    { to: '/calendar', icon: Calendar, label: 'Calendar' },
];

export const Sidebar = () => {
    const location = useLocation();

    return (
        <aside className="sidebar">
            {/* Header Brand */}
            <div style={{
                padding: '24px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                borderBottom: '1px solid var(--border)',
                background: 'rgba(255, 255, 255, 0.02)',
            }}>
                <div style={{
                    position: 'relative',
                    width: '46px',
                    height: '46px',
                    borderRadius: 'var(--radius-md)',
                    background: 'radial-gradient(circle at 30% 30%, rgba(255,46,84,0.3) 0%, rgba(10,12,19,0.9) 100%)',
                    border: '1px solid rgba(255, 46, 84, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 15px rgba(255, 46, 84, 0.25)',
                    flexShrink: 0,
                }}>
                    <img 
                        src="/cropped-wildcat-logo.png" 
                        alt="BCSS Wildcats" 
                        style={{ width: '34px', height: '34px', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} 
                    />
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ 
                        fontSize: '1.2rem', 
                        fontWeight: 900, 
                        fontFamily: 'var(--font-display)', 
                        letterSpacing: '-0.02em', 
                        color: '#FFF',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}>
                        BCSS <span style={{ color: 'var(--red)', fontSize: '0.75rem', padding: '2px 6px', background: 'var(--red-soft)', borderRadius: '4px', border: '1px solid rgba(255,46,84,0.3)' }}>HUB</span>
                    </div>
                    <div style={{ 
                        fontSize: '0.65rem', 
                        color: 'var(--text-muted)', 
                        letterSpacing: '0.12em', 
                        textTransform: 'uppercase', 
                        fontWeight: 700 
                    }}>
                        Burnaby Central
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav style={{ flex: 1, padding: '20px 14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ 
                    fontSize: '0.68rem', 
                    color: 'var(--text-muted)', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.1em', 
                    fontWeight: 800, 
                    padding: '0 12px 6px 12px',
                    fontFamily: 'var(--font-display)' 
                }}>
                    Navigation
                </div>
                {navItems.map(({ to, icon: Icon, label, end }) => {
                    const isActive = end ? location.pathname === to : location.pathname.startsWith(to);
                    return (
                        <NavLink key={to} to={to} style={{
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '14px',
                            padding: '12px 16px', 
                            borderRadius: 'var(--radius-md)',
                            color: isActive ? '#fff' : 'var(--text-secondary)',
                            background: isActive 
                                ? 'linear-gradient(135deg, rgba(255,46,84,0.2) 0%, rgba(255,46,84,0.08) 100%)' 
                                : 'transparent',
                            border: isActive ? '1px solid rgba(255, 46, 84, 0.35)' : '1px solid transparent',
                            boxShadow: isActive ? '0 4px 16px rgba(255, 46, 84, 0.15)' : 'none',
                            fontWeight: isActive ? 700 : 500, 
                            fontSize: '0.92rem', 
                            fontFamily: 'var(--font-display)',
                            textDecoration: 'none', 
                            transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                            position: 'relative',
                        }}>
                            <Icon size={19} style={{ 
                                color: isActive ? 'var(--red)' : 'var(--text-muted)',
                                transition: 'color 0.2s ease'
                            }} />
                            <span>{label}</span>
                            {isActive && (
                                <Sparkles size={14} style={{ marginLeft: 'auto', color: 'var(--red)', opacity: 0.8 }} />
                            )}
                        </NavLink>
                    );
                })}
            </nav>

            {/* Admin Access Footer */}
            <div style={{ padding: '16px 14px', borderTop: '1px solid var(--border)' }}>
                <NavLink to="/admin" style={{
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px',
                    padding: '12px 16px', 
                    borderRadius: 'var(--radius-md)',
                    color: location.pathname.startsWith('/admin') ? '#fff' : 'var(--text-secondary)',
                    background: location.pathname.startsWith('/admin') 
                        ? 'linear-gradient(135deg, rgba(255,46,84,0.25) 0%, rgba(255,46,84,0.1) 100%)' 
                        : 'rgba(255, 255, 255, 0.03)',
                    border: location.pathname.startsWith('/admin') 
                        ? '1px solid rgba(255, 46, 84, 0.4)' 
                        : '1px solid var(--border)',
                    fontWeight: 600, 
                    fontSize: '0.86rem', 
                    fontFamily: 'var(--font-display)',
                    textDecoration: 'none', 
                    transition: 'all 0.25s ease',
                }}>
                    <ShieldCheck size={18} style={{ color: location.pathname.startsWith('/admin') ? 'var(--red)' : 'var(--text-muted)' }} />
                    <span>Admin Portal</span>
                </NavLink>
            </div>
        </aside>
    );
};
