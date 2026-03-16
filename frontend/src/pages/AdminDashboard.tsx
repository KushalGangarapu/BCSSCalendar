import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Calendar as CalIcon, LogOut, Trash2, Edit3, X, Users, Tag } from 'lucide-react';
import { useToast } from '../components/Toast';

interface Club { id: string; name: string; category: string; description: string; instagram?: string; discord?: string; }

type Tab = 'events' | 'clubs';

export const AdminDashboard = () => {
    const [tab, setTab] = useState<Tab>('events');

    // Event form state
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('15:00');
    const [description, setDescription] = useState('');
    const [clubId, setClubId] = useState('');
    const [recurring, setRecurring] = useState('');

    // Club form state
    const [clubName, setClubName] = useState('');
    const [clubCategory, setClubCategory] = useState('');
    const [clubDesc, setClubDesc] = useState('');
    const [clubInsta, setClubInsta] = useState('');
    const [clubDiscord, setClubDiscord] = useState('');
    const [editingClub, setEditingClub] = useState<Club | null>(null);
    const [customCategory, setCustomCategory] = useState('');

    const [clubs, setClubs] = useState<Club[]>([]);
    const [events, setEvents] = useState<any[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();

    useEffect(() => {
        fetch('http://localhost:3001/api/auth/verify', { credentials: 'include' })
            .then(r => { if (!r.ok) navigate('/admin'); })
            .catch(() => navigate('/admin'));
        loadClubs();
        loadEvents();
    }, [navigate]);

    const loadEvents = () => {
        fetch('http://localhost:3001/api/events').then(r => r.json())
            .then(data => setEvents(data))
            .catch(console.error);
    };

    const loadClubs = () => {
        fetch('http://localhost:3001/api/clubs').then(r => r.json())
            .then(data => {
                setClubs(data);
                if (data.length > 0 && !clubId) setClubId(data[0].id);
                const cats = [...new Set(data.map((c: Club) => c.category))] as string[];
                setCategories(cats.sort());
            })
            .catch(console.error);
    };

    const timeOptions = (() => {
        const t = [];
        for (let h = 7; h <= 20; h++) {
            for (let m = 0; m < 60; m += 15) {
                const ampm = h >= 12 ? 'PM' : 'AM';
                const dh = h > 12 ? h - 12 : h === 0 ? 12 : h;
                const dm = m.toString().padStart(2, '0');
                t.push({ value: `${h.toString().padStart(2, '0')}:${dm}`, label: `${dh}:${dm} ${ampm}` });
            }
        }
        return t;
    })();

    // Event handlers
    const handleEventSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const dt = new Date(`${date}T${time}:00`);
            const r = await fetch('http://localhost:3001/api/events', {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
                body: JSON.stringify({ title, date: dt.toISOString(), description, clubId, recurring: recurring || null }),
            });
            if (r.ok) {
                toast('Event published!');
                setTitle('');
                setDescription('');
                loadEvents();
            }
            else { const d = await r.json(); toast(d.error || 'Failed', 'error'); }
        } catch { toast('Submission error', 'error'); }
        finally { setSubmitting(false); }
    };

    const handleDeleteEvent = async (id: string) => {
        if (!window.confirm('Delete this event?')) return;
        const r = await fetch(`http://localhost:3001/api/events/${id}`, { method: 'DELETE', credentials: 'include' });
        if (r.ok) { toast('Event deleted'); loadEvents(); }
        else toast('Failed to delete', 'error');
    };

    // Club handlers
    const handleClubSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        const finalCategory = clubCategory === '__custom__' ? customCategory : clubCategory;
        const body = { name: clubName, category: finalCategory, description: clubDesc, instagram: clubInsta || null, discord: clubDiscord || null };

        try {
            const url = editingClub
                ? `http://localhost:3001/api/clubs/${editingClub.id}`
                : 'http://localhost:3001/api/clubs';
            const r = await fetch(url, {
                method: editingClub ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' }, credentials: 'include',
                body: JSON.stringify(body),
            });
            if (r.ok) {
                toast(editingClub ? 'Club updated!' : 'Club created!');
                resetClubForm();
                loadClubs();
            } else {
                const d = await r.json();
                toast(d.error || 'Failed', 'error');
            }
        } catch { toast('Submission error', 'error'); }
        finally { setSubmitting(false); }
    };

    const handleDeleteClub = async (id: string) => {
        if (!window.confirm('Delete this club and all its events?')) return;
        const r = await fetch(`http://localhost:3001/api/clubs/${id}`, { method: 'DELETE', credentials: 'include' });
        if (r.ok) { toast('Club deleted'); loadClubs(); }
        else toast('Failed to delete', 'error');
    };

    const handleDeleteCategory = async (category: string) => {
        if (!window.confirm(`Delete category "${category}" AND all its clubs and events? This cannot be undone.`)) return;
        const r = await fetch(`http://localhost:3001/api/categories/${encodeURIComponent(category)}`, { method: 'DELETE', credentials: 'include' });
        if (r.ok) {
            toast('Category deleted');
            loadClubs();
        } else {
            toast('Failed to delete', 'error');
        }
    };

    const startEditClub = (club: Club) => {
        setEditingClub(club);
        setClubName(club.name);
        setClubCategory(club.category);
        setClubDesc(club.description);
        setClubInsta(club.instagram || '');
        setClubDiscord(club.discord || '');
    };

    const resetClubForm = () => {
        setEditingClub(null);
        setClubName(''); setClubCategory(''); setClubDesc('');
        setClubInsta(''); setClubDiscord(''); setCustomCategory('');
    };

    const handleLogout = async () => {
        await fetch('http://localhost:3001/api/auth/logout', { method: 'POST', credentials: 'include' });
        navigate('/admin');
    };

    const tabStyle = (active: boolean): React.CSSProperties => ({
        padding: '10px 24px', borderRadius: 'var(--radius-pill)', fontWeight: 700,
        fontFamily: 'var(--font-display)', fontSize: '0.85rem', cursor: 'pointer', border: 'none',
        transition: 'all 0.2s ease',
        background: active ? 'var(--red)' : 'transparent',
        color: active ? '#fff' : 'var(--text-muted)',
    });

    return (
        <div style={{ animation: 'fadeUp 0.4s ease both' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-display)', fontWeight: 800, letterSpacing: '-0.03em' }}>
                        Admin Dashboard
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>Manage events, clubs, and categories.</p>
                </div>
                <button onClick={handleLogout} className="btn btn-outline" style={{ color: 'var(--red)', borderColor: 'var(--red)', gap: '8px' }}>
                    <LogOut size={16} /> Logout
                </button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', background: 'var(--gray-100)', borderRadius: 'var(--radius-pill)', padding: '4px', width: 'fit-content' }}>
                <button onClick={() => setTab('events')} style={tabStyle(tab === 'events')}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><CalIcon size={15} /> Events</span>
                </button>
                <button onClick={() => setTab('clubs')} style={tabStyle(tab === 'clubs')}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Users size={15} /> Clubs & Categories</span>
                </button>
            </div>

            {/* Event Tab */}
            {tab === 'events' && (
                <div className="card" style={{ padding: '32px', animation: 'fadeUp 0.3s ease both' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
                        <PlusCircle size={22} style={{ color: 'var(--red)' }} />
                        <h2 style={{ fontSize: '1.15rem', fontFamily: 'var(--font-display)', fontWeight: 700, margin: 0 }}>Create New Event</h2>
                    </div>
                    <form onSubmit={handleEventSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
                            <div><label className="label">Event Title</label><input required className="input" placeholder="e.g. Winter Social" value={title} onChange={e => setTitle(e.target.value)} /></div>
                            <div><label className="label">Hosting Club</label>
                                <select required className="input" value={clubId} onChange={e => setClubId(e.target.value)}>
                                    {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '18px' }}>
                            <div><label className="label">Date</label><input required type="date" className="input" value={date} onChange={e => setDate(e.target.value)} /></div>
                            <div><label className="label">Time</label>
                                <select required className="input" value={time} onChange={e => setTime(e.target.value)}>
                                    {timeOptions.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                </select>
                            </div>
                            <div><label className="label">Recurrence</label>
                                <select className="input" value={recurring} onChange={e => setRecurring(e.target.value)}>
                                    <option value="">Doesn't repeat</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="biweekly">Every 2 Weeks</option>
                                    <option value="monthly">Monthly</option>
                                </select>
                            </div>
                        </div>
                        <div><label className="label">Description (Optional)</label><textarea className="input" rows={3} style={{ resize: 'none' }} placeholder="Details..." value={description} onChange={e => setDescription(e.target.value)} /></div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '4px' }}>
                            <button type="button" onClick={() => { setTitle(''); setDescription(''); }} className="btn btn-ghost" style={{ fontSize: '0.87rem' }}>Cancel</button>
                            <button type="submit" disabled={submitting} className="btn btn-red" style={{ paddingInline: '32px' }}>{submitting ? 'Publishing...' : 'Save Event'}</button>
                        </div>
                    </form>

                    <div style={{ marginTop: '40px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
                            <CalIcon size={20} style={{ color: 'var(--red)' }} />
                            <h2 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-display)', fontWeight: 700, margin: 0 }}>All Upcoming Events ({events.length})</h2>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '400px', overflowY: 'auto' }}>
                            {events.map((event, idx) => {
                                const d = new Date(event.date);
                                return (
                                    <div key={event.id || idx} className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontWeight: 700, fontSize: '0.92rem', fontFamily: 'var(--font-display)' }}>{event.title}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                                {d.toLocaleDateString()} · {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {event.club?.name}
                                            </div>
                                        </div>
                                        <button onClick={() => handleDeleteEvent(event.id)} className="btn btn-ghost" style={{ padding: '6px', color: 'var(--red)' }} title="Delete">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                );
                            })}
                            {events.length === 0 && (
                                <div className="card" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>No events scheduled</div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Clubs & Categories Tab */}
            {tab === 'clubs' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', animation: 'fadeUp 0.3s ease both' }}>
                    {/* Club Form */}
                    <div className="card" style={{ padding: '28px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid var(--border)' }}>
                            {editingClub ? <Edit3 size={20} style={{ color: 'var(--red)' }} /> : <PlusCircle size={20} style={{ color: 'var(--red)' }} />}
                            <h2 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-display)', fontWeight: 700, margin: 0 }}>
                                {editingClub ? 'Edit Club' : 'Add New Club'}
                            </h2>
                            {editingClub && (
                                <button onClick={resetClubForm} className="btn btn-ghost" style={{ marginLeft: 'auto', padding: '4px' }}>
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                        <form onSubmit={handleClubSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div><label className="label">Club Name</label><input required className="input" placeholder="e.g. Robotics Club" value={clubName} onChange={e => setClubName(e.target.value)} /></div>
                            <div>
                                <label className="label">Category</label>
                                <select required className="input" value={clubCategory} onChange={e => setClubCategory(e.target.value)}>
                                    <option value="">Select category...</option>
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                    <option value="__custom__">+ New Category</option>
                                </select>
                            </div>
                            {clubCategory === '__custom__' && (
                                <div style={{ animation: 'fadeUp 0.2s ease both' }}>
                                    <label className="label">New Category Name</label>
                                    <input required className="input" placeholder="e.g. STEM, Athletics" value={customCategory} onChange={e => setCustomCategory(e.target.value)} />
                                </div>
                            )}
                            <div><label className="label">Description</label><textarea required className="input" rows={2} style={{ resize: 'none' }} placeholder="Brief description..." value={clubDesc} onChange={e => setClubDesc(e.target.value)} /></div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                                <div><label className="label">Instagram (optional)</label><input className="input" placeholder="https://..." value={clubInsta} onChange={e => setClubInsta(e.target.value)} /></div>
                                <div><label className="label">Discord (optional)</label><input className="input" placeholder="https://..." value={clubDiscord} onChange={e => setClubDiscord(e.target.value)} /></div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '4px' }}>
                                {editingClub && <button type="button" onClick={resetClubForm} className="btn btn-ghost" style={{ fontSize: '0.87rem' }}>Cancel</button>}
                                <button type="submit" disabled={submitting} className="btn btn-red" style={{ paddingInline: '28px' }}>
                                    {submitting ? 'Saving...' : editingClub ? 'Update Club' : 'Add Club'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Content Lists */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                        {/* Club List */}
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                                <Users size={18} style={{ color: 'var(--red)' }} />
                                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.05rem', margin: 0 }}>
                                    All Clubs ({clubs.length})
                                </h3>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '350px', overflowY: 'auto' }}>
                                {clubs.map(club => (
                                    <div key={club.id} className="card" style={{
                                        padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    }}>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontWeight: 700, fontSize: '0.92rem', fontFamily: 'var(--font-display)' }}>{club.name}</div>
                                            <span className="pill pill-dark" style={{ marginTop: '4px', fontSize: '0.7rem' }}>{club.category}</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                                            <button onClick={() => startEditClub(club)} className="btn btn-ghost" style={{ padding: '6px', color: 'var(--gray-500)' }} title="Edit">
                                                <Edit3 size={15} />
                                            </button>
                                            <button onClick={() => handleDeleteClub(club.id)} className="btn btn-ghost" style={{ padding: '6px', color: 'var(--red)' }} title="Delete">
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {clubs.length === 0 && (
                                    <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        No clubs yet. Create your first club!
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Category List */}
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                                <Tag size={18} style={{ color: 'var(--red)' }} />
                                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.05rem', margin: 0 }}>
                                    Manage Categories ({categories.length})
                                </h3>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {categories.map(cat => (
                                    <div key={cat} className="card" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'var(--gray-100)', border: 'none' }}>
                                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{cat}</span>
                                        <button onClick={() => handleDeleteCategory(cat)} className="btn btn-ghost" style={{ padding: '2px', color: 'var(--red)', minHeight: 0, height: 'auto' }} title={`Delete ${cat} and all its clubs`}>
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                                {categories.length === 0 && (
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No categories created yet.</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
