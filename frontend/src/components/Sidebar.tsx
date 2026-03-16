import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Calendar, LogIn } from 'lucide-react';

const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/clubs', icon: Users, label: 'Directory' },
    { to: '/calendar', icon: Calendar, label: 'Calendar' },
];

export const Sidebar = () => {
    const location = useLocation();

    return (
        <aside className="sidebar">
            {/* Logo */}
            <div style={{ padding: '28px 24px', display: 'flex', alignItems: 'center', gap: '14px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <img src="/wildcat-logo.png" alt="BCSS Wildcats" style={{ width: '44px', height: '44px', objectFit: 'contain' }} />
                <div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>BCSS</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--gray-500)', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600 }}>Wildcats</div>
                </div>
            </div>

            {/* Navigation */}
            <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {navItems.map(({ to, icon: Icon, label, end }) => {
                    const isActive = end ? location.pathname === to : location.pathname.startsWith(to);
                    return (
                        <NavLink key={to} to={to} style={{
                            display: 'flex', alignItems: 'center', gap: '12px',
                            padding: '12px 16px', borderRadius: 'var(--radius-md)',
                            color: isActive ? '#fff' : 'rgba(255,255,255,0.55)',
                            background: isActive ? 'var(--red)' : 'transparent',
                            fontWeight: 600, fontSize: '0.9rem', fontFamily: 'var(--font-display)',
                            textDecoration: 'none', transition: 'all 0.2s ease',
                        }}>
                            <Icon size={19} style={{ opacity: isActive ? 1 : 0.7 }} />
                            {label}
                        </NavLink>
                    );
                })}
            </nav>

            {/* Admin Login */}
            <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <NavLink to="/admin" style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '12px 16px', borderRadius: 'var(--radius-md)',
                    color: location.pathname.startsWith('/admin') ? '#fff' : 'rgba(255,255,255,0.4)',
                    background: location.pathname.startsWith('/admin') ? 'var(--red)' : 'transparent',
                    fontWeight: 600, fontSize: '0.85rem', fontFamily: 'var(--font-display)',
                    textDecoration: 'none', transition: 'all 0.2s ease',
                }}>
                    <LogIn size={17} />
                    Admin Login
                </NavLink>
            </div>
        </aside>
    );
};
