import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Calendar as CalIcon, LogOut, Trash2, Edit3, X, Users, Tag, ImagePlus, Loader2, Crop } from 'lucide-react';
import { useToast } from '../components/Toast';
import { Helmet } from 'react-helmet-async';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../utils/cropImage';

interface Club { id: string; name: string; category: string; description: string; instagram?: string; discord?: string; imageUrl?: string; }

type Tab = 'events' | 'clubs';

export const AdminDashboard = () => {
    const [tab, setTab] = useState<Tab>('events');

    // Event form state
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [hasTime, setHasTime] = useState(true);
    const [time, setTime] = useState('15:00');
    const [hasEndDate, setHasEndDate] = useState(false);
    const [endDate, setEndDate] = useState('');
    const [hasEndTime, setHasEndTime] = useState(true);
    const [endTime, setEndTime] = useState('16:00');
    const [description, setDescription] = useState('');
    const [clubId, setClubId] = useState('');
    const [recurring, setRecurring] = useState('');
    const [eventTags, setEventTags] = useState<string[]>([]);

    // Club form state
    const [clubName, setClubName] = useState('');
    const [clubCategory, setClubCategory] = useState('');
    const [clubDesc, setClubDesc] = useState('');
    const [clubInsta, setClubInsta] = useState('');
    const [clubDiscord, setClubDiscord] = useState('');
    const [clubImageUrl, setClubImageUrl] = useState('');
    const [uploading, setUploading] = useState(false);
    const [editingClub, setEditingClub] = useState<Club | null>(null);
    const [customCategory, setCustomCategory] = useState('');

    // Cropper State
    const [cropFileUrl, setCropFileUrl] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

    const [clubs, setClubs] = useState<Club[]>([]);
    const [events, setEvents] = useState<any[]>([]);
    const [categories, setCategories] = useState<{ name: string, color: string }[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();

    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_URL}/api/auth/verify`, { credentials: 'include' })
            .then(r => { if (!r.ok) navigate('/admin'); })
            .catch(() => navigate('/admin'));
        loadClubs();
        loadEvents();
    }, [navigate]);

    const loadEvents = () => {
        fetch(`${import.meta.env.VITE_API_URL}/api/events`).then(r => r.json())
            .then(data => setEvents(data))
            .catch(console.error);
    };

    const loadClubs = () => {
        fetch(`${import.meta.env.VITE_API_URL}/api/clubs`).then(r => r.json())
            .then(data => {
                setClubs(data);
                if (data.length > 0 && !clubId) setClubId(data[0].id);
            })
            .catch(console.error);

        fetch(`${import.meta.env.VITE_API_URL}/api/categories`).then(r => r.json())
            .then(data => setCategories(data))
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
            const dt = hasTime ? new Date(`${date}T${time}:00`) : new Date(`${date}T00:00:00`);
            const endDt = hasEndDate && endDate ? (hasEndTime ? new Date(`${endDate}T${endTime}:00`) : new Date(`${endDate}T23:59:00`)) : null;
            const r = await fetch(`${import.meta.env.VITE_API_URL}/api/events`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
                body: JSON.stringify({ title, date: dt.toISOString(), endDate: endDt?.toISOString() || null, description, clubId, recurring: recurring || null, tags: eventTags }),
            });
            if (r.ok) {
                toast('Event published!');
                setTitle('');
                setDescription('');
                setEventTags([]);
                setHasEndDate(false);
                setEndDate('');
                setEndTime('16:00');
                setHasTime(true);
                setHasEndTime(true);
                loadEvents();
            }
            else { const d = await r.json(); toast(d.error || 'Failed', 'error'); }
        } catch { toast('Submission error', 'error'); }
        finally { setSubmitting(false); }
    };

    const handleDeleteEvent = async (event: any) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this event?');
        if (!confirmDelete) return;

        let allFuture = false;
        if (event.recurring) {
            allFuture = window.confirm('This is a recurring event series.\n\nClick OK to ALSO delete ALL FUTURE occurrences.\nClick Cancel to ONLY delete this specific date.');
        }

        const r = await fetch(`${import.meta.env.VITE_API_URL}/api/events/${event.id}?allFuture=${allFuture}`, { method: 'DELETE', credentials: 'include' });
        if (r.ok) { toast(allFuture ? 'Event series deleted' : 'Event deleted'); loadEvents(); }
        else toast('Failed to delete', 'error');
    };

    // Club handlers
    const handleClubSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        const finalCategory = clubCategory === '__custom__' ? customCategory : clubCategory;
        const body = { name: clubName, category: finalCategory, description: clubDesc, instagram: clubInsta || null, discord: clubDiscord || null, imageUrl: clubImageUrl || null };

        try {
            const url = editingClub
                ? `${import.meta.env.VITE_API_URL}/api/clubs/${editingClub.id}`
                : `${import.meta.env.VITE_API_URL}/api/clubs`;
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
        const r = await fetch(`${import.meta.env.VITE_API_URL}/api/clubs/${id}`, { method: 'DELETE', credentials: 'include' });
        if (r.ok) { toast('Club deleted'); loadClubs(); }
        else toast('Failed to delete', 'error');
    };

    const handleDeleteCategory = async (category: string) => {
        if (!window.confirm(`Delete category "${category}" AND all its clubs and events? This cannot be undone.`)) return;
        const r = await fetch(`${import.meta.env.VITE_API_URL}/api/categories/${encodeURIComponent(category)}`, { method: 'DELETE', credentials: 'include' });
        if (r.ok) {
            toast('Category deleted');
            loadClubs();
        } else {
            toast('Failed to delete', 'error');
        }
    };

    const handleUpdateCategoryColor = async (categoryName: string, color: string) => {
        const r = await fetch(`${import.meta.env.VITE_API_URL}/api/categories/${encodeURIComponent(categoryName)}/color`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ color })
        });
        if (r.ok) {
            toast('Category color updated');
            loadClubs();
        } else {
            toast('Failed to update color', 'error');
        }
    };

    const startEditClub = (club: Club) => {
        setEditingClub(club);
        setClubName(club.name);
        setClubCategory(club.category);
        setClubDesc(club.description);
        setClubInsta(club.instagram || '');
        setClubDiscord(club.discord || '');
        setClubImageUrl(club.imageUrl || '');
    };

    const resetClubForm = () => {
        setEditingClub(null);
        setClubName(''); setClubCategory(''); setClubDesc('');
        setClubInsta(''); setClubDiscord(''); setCustomCategory(''); setClubImageUrl('');
        setCropFileUrl(null);
    };

    const handleFileSelect = (file: File) => {
        const url = URL.createObjectURL(file);
        setCropFileUrl(url);
    };

    const handleConfirmCrop = async () => {
        if (!cropFileUrl || !croppedAreaPixels) return;

        try {
            setUploading(true);
            const croppedFile = await getCroppedImg(cropFileUrl, croppedAreaPixels);
            if (!croppedFile) throw new Error('Failed to crop image');

            // Cleanup the blob url
            URL.revokeObjectURL(cropFileUrl);
            setCropFileUrl(null);

            await handleImageUpload(croppedFile);
        } catch (e) {
            toast('Failed to crop image', 'error');
            setUploading(false);
        }
    };

    const handleImageUpload = async (file: File) => {
        setUploading(true);
        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
        console.log('Cloudinary upload →', { cloudName, uploadPreset, fileName: file.name });

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', uploadPreset);
            const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                method: 'POST', body: formData,
            });
            const data = await res.json();
            console.log('Cloudinary response →', data);
            if (data.secure_url) {
                setClubImageUrl(data.secure_url);
                toast('Image uploaded!');
            } else {
                console.error('Cloudinary error:', data.error?.message || data);
                toast(`Upload failed: ${data.error?.message || 'Unknown error'}`, 'error');
            }
        } catch (err) {
            console.error('Upload exception:', err);
            toast('Upload error', 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleLogout = async () => {
        await fetch(`${import.meta.env.VITE_API_URL}/api/auth/logout`, { method: 'POST', credentials: 'include' });
        navigate('/admin');
    };

    const tabStyle = (active: boolean): React.CSSProperties => ({
        padding: '10px 24px', borderRadius: 'var(--radius-pill)', fontWeight: 700,
        fontFamily: 'var(--font-display)', fontSize: '0.85rem', cursor: 'pointer', border: 'none',
        transition: 'all 0.2s ease',
        background: active ? 'var(--red)' : 'transparent',
        color: active ? '#fff' : 'var(--text-muted)',
    });

    const toggleEventTag = (tagName: string) => {
        if (eventTags.includes(tagName)) {
            setEventTags(eventTags.filter(t => t !== tagName));
        } else {
            setEventTags([...eventTags, tagName]);
        }
    };

    return (
        <div style={{ animation: 'fadeUp 0.4s ease both' }}>
            <Helmet>
                <title>Admin Portal | Wildcat Calendar</title>
            </Helmet>
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
                                <select className="input" value={clubId} onChange={e => setClubId(e.target.value)}>
                                    <option value="">None (School Event)</option>
                                    {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '18px' }}>
                            <div><label className="label">Date</label><input required type="date" className="input" value={date} onChange={e => setDate(e.target.value)} /></div>
                            <div>
                                <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    Time
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 500, textTransform: 'none', letterSpacing: 0, color: 'var(--text-muted)' }}>
                                        <input type="checkbox" checked={hasTime} onChange={e => setHasTime(e.target.checked)} style={{ accentColor: 'var(--red)', width: '13px', height: '13px' }} />
                                        Specific time
                                    </label>
                                </label>
                                {hasTime ? (
                                    <select className="input" value={time} onChange={e => setTime(e.target.value)}>
                                        {timeOptions.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                    </select>
                                ) : (
                                    <div className="input" style={{ color: 'var(--text-muted)', cursor: 'default' }}>All Day</div>
                                )}
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.87rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                                <input type="checkbox" checked={hasEndDate} onChange={e => setHasEndDate(e.target.checked)} style={{ accentColor: 'var(--red)', width: '16px', height: '16px' }} />
                                Add end date & time
                            </label>
                        </div>
                        {hasEndDate && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', animation: 'fadeUp 0.2s ease both' }}>
                                <div><label className="label">End Date</label><input required type="date" className="input" value={endDate} onChange={e => setEndDate(e.target.value)} /></div>
                                <div>
                                    <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        End Time
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 500, textTransform: 'none', letterSpacing: 0, color: 'var(--text-muted)' }}>
                                            <input type="checkbox" checked={hasEndTime} onChange={e => setHasEndTime(e.target.checked)} style={{ accentColor: 'var(--red)', width: '13px', height: '13px' }} />
                                            Specific time
                                        </label>
                                    </label>
                                    {hasEndTime ? (
                                        <select className="input" value={endTime} onChange={e => setEndTime(e.target.value)}>
                                            {timeOptions.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                        </select>
                                    ) : (
                                        <div className="input" style={{ color: 'var(--text-muted)', cursor: 'default' }}>End of Day</div>
                                    )}
                                </div>
                            </div>
                        )}
                        <div>
                            <label className="label">Event Tags (Optional)</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '8px', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                                {categories.length === 0 && <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No categories available. Add some in the Clubs tab.</span>}
                                {categories.map(cat => (
                                    <button
                                        key={cat.name} type="button"
                                        onClick={() => toggleEventTag(cat.name)}
                                        className="pill"
                                        style={{
                                            padding: '6px 14px', fontSize: '0.8rem', border: 'none', cursor: 'pointer',
                                            background: eventTags.includes(cat.name) ? cat.color : 'var(--white)',
                                            color: eventTags.includes(cat.name) ? '#fff' : 'var(--gray-700)',
                                            boxShadow: eventTags.includes(cat.name) ? 'none' : '0 0 0 1px var(--gray-300)',
                                            transition: 'all 0.2s',
                                        }}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
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
                                            <div style={{ fontWeight: 700, fontSize: '0.92rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                {event.title}
                                                {event.tags && event.tags.length > 0 && (
                                                    <div style={{ display: 'flex', gap: '4px' }}>
                                                        {event.tags.map((t: string) => <span key={t} style={{ fontSize: '0.65rem', padding: '2px 6px', background: 'var(--gray-200)', borderRadius: '4px' }}>{t}</span>)}
                                                    </div>
                                                )}
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                                {d.toLocaleDateString()} · {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{event.endDate ? ` – ${new Date(event.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''} · <span style={{ color: event.club ? 'var(--text-muted)' : 'var(--red)', fontWeight: event.club ? 500 : 700 }}>{event.club?.name || 'School Event'}</span>
                                            </div>
                                        </div>
                                        <button onClick={() => handleDeleteEvent(event)} className="btn btn-ghost" style={{ padding: '6px', color: 'var(--red)' }} title="Delete">
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
                                    {categories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
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

                            {/* Image Upload */}
                            <div>
                                <label className="label">Club Photo (optional)</label>
                                {clubImageUrl ? (
                                    <div style={{ position: 'relative', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginTop: '8px' }}>
                                        <img src={clubImageUrl} alt="Club" style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: 'var(--radius-md)' }} />
                                        <button type="button" onClick={() => setClubImageUrl('')} style={{
                                            position: 'absolute', top: '8px', right: '8px',
                                            background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%',
                                            width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            cursor: 'pointer', color: '#fff',
                                        }}>
                                            <X size={14} />
                                        </button>
                                    </div>
                                ) : (
                                    <label style={{
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                        border: '2px dashed var(--border)', borderRadius: 'var(--radius-md)',
                                        padding: '24px', cursor: 'pointer', marginTop: '8px',
                                        transition: 'all 0.2s ease', background: 'var(--gray-50)',
                                    }}
                                        onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--red)'; }}
                                        onDragLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                                        onDrop={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--border)'; const f = e.dataTransfer.files[0]; if (f) handleFileSelect(f); }}
                                    >
                                        {uploading ? (
                                            <Loader2 size={24} style={{ color: 'var(--red)', animation: 'spin 1s linear infinite' }} />
                                        ) : (
                                            <>
                                                <ImagePlus size={24} style={{ color: 'var(--gray-400)', marginBottom: '8px' }} />
                                                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Drop image or click to upload</span>
                                            </>
                                        )}
                                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }} />
                                    </label>
                                )}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '4px' }}>
                                {editingClub && <button type="button" onClick={resetClubForm} className="btn btn-ghost" style={{ fontSize: '0.87rem' }}>Cancel</button>}
                                <button type="submit" disabled={submitting} className="btn btn-red" style={{ paddingInline: '28px' }}>
                                    {submitting ? 'Saving...' : editingClub ? 'Update Club' : 'Add Club'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Crop Modal */}
                    {cropFileUrl && (
                        <div style={{
                            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                            background: 'rgba(0,0,0,0.8)', zIndex: 1000,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px'
                        }}>
                            <div className="card" style={{ width: '100%', maxWidth: '600px', padding: '24px', background: '#fff' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                    <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-display)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Crop size={20} className="text-red" /> Crop Photo
                                    </h3>
                                    <button onClick={() => { URL.revokeObjectURL(cropFileUrl); setCropFileUrl(null); }} className="btn btn-ghost" style={{ padding: '8px' }}>
                                        <X size={20} />
                                    </button>
                                </div>

                                <div style={{ position: 'relative', width: '100%', height: '400px', background: '#333', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                                    <Cropper
                                        image={cropFileUrl}
                                        crop={crop}
                                        zoom={zoom}
                                        aspect={21 / 9}
                                        onCropChange={setCrop}
                                        onZoomChange={setZoom}
                                        onCropComplete={(_, croppedAreaPixels) => setCroppedAreaPixels(croppedAreaPixels)}
                                    />
                                </div>

                                <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Zoom</label>
                                    <input
                                        type="range"
                                        value={zoom}
                                        min={1} max={3} step={0.1}
                                        onChange={(e) => setZoom(Number(e.target.value))}
                                        style={{ flex: 1, accentColor: 'var(--red)' }}
                                    />
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                                    <button onClick={() => { URL.revokeObjectURL(cropFileUrl); setCropFileUrl(null); }} className="btn btn-ghost">Cancel</button>
                                    <button onClick={handleConfirmCrop} disabled={uploading} className="btn btn-red" style={{ gap: '8px' }}>
                                        {uploading ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Processing...</> : 'Confirm & Upload'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

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
                                    <div key={cat.name} className="card" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'var(--gray-100)', border: 'none' }}>
                                        <div style={{ position: 'relative', width: '20px', height: '20px', borderRadius: '50%', overflow: 'hidden', border: '1px solid var(--border)' }}>
                                            <input
                                                type="color"
                                                defaultValue={cat.color}
                                                onBlur={(e) => {
                                                    if (e.target.value !== cat.color) {
                                                        handleUpdateCategoryColor(cat.name, e.target.value);
                                                    }
                                                }}
                                                style={{ position: 'absolute', top: '-10px', left: '-10px', width: '40px', height: '40px', cursor: 'pointer', border: 'none', padding: 0 }}
                                                title="Change Color"
                                            />
                                        </div>
                                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{cat.name}</span>
                                        <button onClick={() => handleDeleteCategory(cat.name)} className="btn btn-ghost" style={{ padding: '2px', color: 'var(--red)', minHeight: 0, height: 'auto' }} title={`Delete ${cat.name} and all its clubs`}>
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
