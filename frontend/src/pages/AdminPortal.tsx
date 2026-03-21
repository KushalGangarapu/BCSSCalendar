import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ShieldAlert } from 'lucide-react';

export const AdminPortal = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Auto-redirect if already logged in
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
            display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 80px)',
            animation: 'fadeUp 0.4s ease both',
        }}>
            <div className="card" style={{ width: '100%', maxWidth: '420px', overflow: 'hidden' }}>
                {/* Red Header */}
                <div style={{
                    background: 'linear-gradient(135deg, var(--red) 0%, var(--red-dark) 100%)',
                    padding: '32px', textAlign: 'center', color: '#fff',
                }}>
                    <div style={{
                        width: '56px', height: '56px', borderRadius: '50%',
                        background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 16px',
                    }}>
                        <Lock size={24} />
                    </div>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-display)', margin: 0 }}>
                        Admin Login
                    </h2>
                    <p style={{ opacity: 0.7, fontSize: '0.85rem', marginTop: '6px' }}>Authorized personnel only</p>
                </div>

                {/* Form */}
                <div style={{ padding: '32px' }}>
                    {error && (
                        <div style={{
                            background: '#FFF3F3', border: '1px solid #FECACA', borderRadius: 'var(--radius-md)',
                            padding: '12px 14px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px',
                            color: 'var(--red-dark)', fontSize: '0.85rem', fontWeight: 600,
                        }}>
                            <ShieldAlert size={16} /> {error}
                        </div>
                    )}
                    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                        <div>
                            <label className="label">Username</label>
                            <input className="input" placeholder="admin" value={username} onChange={e => setUsername(e.target.value)} required />
                        </div>
                        <div>
                            <label className="label">Password</label>
                            <input className="input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                        </div>
                        <button type="submit" disabled={loading} className="btn btn-red" style={{ width: '100%', padding: '14px', fontSize: '1rem', marginTop: '4px' }}>
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
