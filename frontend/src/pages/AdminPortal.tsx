import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ShieldAlert, ShieldCheck } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { usePageTitle } from '../hooks/usePageTitle';

export const AdminPortal = () => {
    usePageTitle('Admin Portal');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_URL}/api/auth/verify`, { credentials: 'include' })
            .then(r => {
                if (r.ok) navigate('/admin/dashboard');
            })
            .catch(() => { });
    }, [navigate]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                credentials: 'include', body: JSON.stringify({ username, password }),
            });
            if (!res.ok) throw new Error('Invalid credentials');
            navigate('/admin/dashboard');
        } catch (err: any) {
            setError(err.message || 'Login failed');
        } finally { setLoading(false); }
    };

    return (
        <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 160px)',
            animation: 'fadeUp 0.4s ease both',
        }}>
            <Helmet>
                <title>Admin Portal | BCSS Calendar</title>
            </Helmet>

            <div className="card" style={{ width: '100%', maxWidth: '440px', overflow: 'hidden', background: '#FFFFFF', border: '1px solid var(--border-strong)', boxShadow: 'var(--shadow-lg)' }}>
                {/* Header */}
                <div style={{
                    background: '#0F172A',
                    borderBottom: '2px solid var(--bcss-red)',
                    padding: '36px 32px', textAlign: 'center', color: '#fff',
                    position: 'relative'
                }}>
                    <div style={{
                        width: '60px', height: '60px', borderRadius: '50%',
                        background: '#FFFFFF', color: '#0F172A',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 16px',
                        boxShadow: 'var(--shadow-sm)'
                    }}>
                        <Lock size={26} />
                    </div>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: 900, fontFamily: 'var(--font-display)', margin: 0, color: '#FFF' }}>
                        Admin Portal Login
                    </h2>
                </div>

                {/* Form */}
                <div style={{ padding: '36px 32px' }}>
                    {error && (
                        <div style={{
                            background: 'var(--bcss-red-soft)', border: '1px solid var(--bcss-red)', borderRadius: 'var(--radius-md)',
                            padding: '12px 16px', marginBottom: '22px', display: 'flex', alignItems: 'center', gap: '10px',
                            color: 'var(--bcss-red)', fontSize: '0.88rem', fontWeight: 700,
                        }}>
                            <ShieldAlert size={18} /> {error}
                        </div>
                    )}
                    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <label className="label">Username</label>
                            <input className="input" placeholder="admin" value={username} onChange={e => setUsername(e.target.value)} required />
                        </div>
                        <div>
                            <label className="label">Password</label>
                            <input className="input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                        </div>
                        <button type="submit" disabled={loading} className="btn btn-blue" style={{ width: '100%', padding: '14px', fontSize: '1rem', marginTop: '6px', gap: '8px' }}>
                            <ShieldCheck size={18} />
                            {loading ? 'Authenticating...' : 'Sign In'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
