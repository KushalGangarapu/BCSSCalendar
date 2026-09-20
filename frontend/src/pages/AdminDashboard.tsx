import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Calendar as CalIcon, LogOut, Trash2, Edit3, X, Users, Tag, ImagePlus, Loader2, Star } from 'lucide-react';
import { useToast } from '../components/Toast';
import { Helmet } from 'react-helmet-async';
import getCroppedImg from '../utils/cropImage';
import { ImageCropModal } from '../components/common/ImageCropModal';
import { invalidateCache } from '../utils/apiCache';
import { usePageTitle } from '../hooks/usePageTitle';
import { useAppData } from '../context/DataContext';
import type { ClubItem } from '../context/DataContext';
import { filterRecurringEvents } from '../utils/recurringUtils';
import { DescriptionEditor } from '../components/common/DescriptionEditor';
import { OBSERVANCE_TAG, NO_SCHOOL_TAG, MARKER_TAGS, formatEventTime, getTagPillColor } from '../utils/timeUtils';

type Club = ClubItem;

type Tab = 'events' | 'clubs';

type ScheduleMode = 'timed' | 'allDay' | 'observance' | 'holiday';

const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    useEffect(() => {
        const handler = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handler);
        return () => window.removeEventListener('resize', handler);
    }, []);
    return isMobile;
};

export const AdminDashboard = () => {
    usePageTitle('Admin Dashboard');
    const isMobile = useIsMobile();
    const [tab, setTab] = useState<Tab>('events');
    const { events, clubs, categories, refreshData } = useAppData();

    // Event form state
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [scheduleMode, setScheduleMode] = useState<ScheduleMode>('timed');
    const [time, setTime] = useState('15:00');
    const [hasEndDate, setHasEndDate] = useState(false);
    const [endDate, setEndDate] = useState('');
    const [hasEndTime, setHasEndTime] = useState(true);
    const [endTime, setEndTime] = useState('16:00');
    const [description, setDescription] = useState('');
    const [clubId, setClubId] = useState('');
    const [recurring, setRecurring] = useState('');
    const [recurrenceEndDate, setRecurrenceEndDate] = useState('');
    const [eventTags, setEventTags] = useState<string[]>([]);
    const [editingEvent, setEditingEvent] = useState<any>(null);

    // Club form state
    const [clubName, setClubName] = useState('');
    const [clubCategory, setClubCategory] = useState('');
    const [clubDesc, setClubDesc] = useState('');
    const [clubInsta, setClubInsta] = useState('');
    const [clubDiscord, setClubDiscord] = useState('');
    const [clubImageUrl, setClubImageUrl] = useState('');
    const [clubIsFeatured, setClubIsFeatured] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [editingClub, setEditingClub] = useState<Club | null>(null);
    const [customCategory, setCustomCategory] = useState('');

    // Cropper State
    const [cropFileUrl, setCropFileUrl] = useState<string | null>(null);
    const [cropFile, setCropFile] = useState<File | null>(null);

    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();

    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_URL}/api/auth/verify`, { credentials: 'include' })
            .then(r => { if (!r.ok) navigate('/admin'); })
            .catch(() => navigate('/admin'));
    }, [navigate]);

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

    const handleEventSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            let dt: Date;
            let endDt: Date | null = null;
            const targetEndDate = endDate || date;

            if (scheduleMode === 'timed') {
                dt = new Date(`${date}T${time}:00`);
                if (hasEndDate) {
                    endDt = hasEndTime && endTime
                        ? new Date(`${targetEndDate}T${endTime}:00`)
                        : new Date(`${targetEndDate}T23:59:59`);
                }
            } else if (scheduleMode === 'allDay') {
                dt = new Date(`${date}T08:00:00`);
                endDt = new Date(`${targetEndDate}T17:00:00`);
            } else {
                dt = new Date(`${date}T00:00:00`);
                if (hasEndDate) {
                    endDt = new Date(`${targetEndDate}T23:59:59`);
                }
            }

            const finalTags = eventTags.filter(t => !MARKER_TAGS.includes(t));
            if (scheduleMode === 'observance') finalTags.push(OBSERVANCE_TAG);
            if (scheduleMode === 'holiday') finalTags.push(NO_SCHOOL_TAG);

            let url = `${import.meta.env.VITE_API_URL}/api/events`;
            let method = 'POST';

            if (editingEvent) {
                let allFuture = false;
                if (editingEvent.recurring) {
                    allFuture = window.confirm('This is a recurring event series.\n\nClick OK to ALSO update ALL FUTURE occurrences.\nClick Cancel to ONLY update this specific date.');
                }
                url = `${import.meta.env.VITE_API_URL}/api/events/${editingEvent.id}?allFuture=${allFuture}`;
                method = 'PUT';
            }

            const r = await fetch(url, {
                method, headers: { 'Content-Type': 'application/json' }, credentials: 'include',
                body: JSON.stringify({ 
                    title, 
                    date: dt.toISOString(), 
                    endDate: endDt?.toISOString() || null, 
                    recurrenceEndDate: recurrenceEndDate ? new Date(`${recurrenceEndDate}T23:59:59`).toISOString() : null,
                    description: description || null, 
                    clubId: clubId || null, 
                    recurring: recurring || null, 
                    tags: finalTags 
                }),
            });
            if (r.ok) {
                invalidateCache();
                toast(editingEvent ? 'Event updated!' : 'Event published!');
                resetEventForm();
                refreshData('all').catch(() => {});
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
        if (r.ok) {
            invalidateCache();
            toast(allFuture ? 'Event series deleted' : 'Event deleted');
            if (editingEvent && (editingEvent.id === event.id || allFuture)) {
                resetEventForm();
            }
            refreshData('events').catch(() => {});
        }
        else toast('Failed to delete', 'error');
    };

    const handleClubSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        const finalCategory = clubCategory === '__custom__' ? customCategory : clubCategory;
        const body = { 
            name: clubName, 
            category: finalCategory, 
            description: clubDesc, 
            instagram: clubInsta || null, 
            discord: clubDiscord || null, 
            imageUrl: clubImageUrl || null,
            isFeatured: clubIsFeatured
        };

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
                invalidateCache();
                toast(editingClub ? 'Club updated!' : 'Club created!');
                resetClubForm();
                refreshData('all').catch(() => {});
            } else {
                const d = await r.json();
                toast(d.error || 'Failed', 'error');
            }
        } catch { toast('Submission error', 'error'); }
        finally { setSubmitting(false); }
    };

    const handleToggleFeatured = async (clubId: string) => {
        try {
            const r = await fetch(`${import.meta.env.VITE_API_URL}/api/clubs/${clubId}/feature`, {
                method: 'PUT',
                credentials: 'include',
            });
            if (r.ok) {
                invalidateCache();
                const updated = await r.json();
                toast(updated.isFeatured ? 'Club pinned to Featured!' : 'Club removed from Featured');
                await refreshData('all');
            } else {
                toast('Failed to update featured status', 'error');
            }
        } catch {
            toast('Network error', 'error');
        }
    };

    const handleDeleteClub = async (id: string) => {
        if (!window.confirm('Delete this club and all its events?')) return;
        const r = await fetch(`${import.meta.env.VITE_API_URL}/api/clubs/${id}`, { method: 'DELETE', credentials: 'include' });
        if (r.ok) { invalidateCache(); toast('Club deleted'); refreshData('clubs'); }
        else toast('Failed to delete', 'error');
    };

    const handleDeleteCategory = async (category: string) => {
        if (!window.confirm(`Delete category "${category}" AND all its clubs and events? This cannot be undone.`)) return;
        const r = await fetch(`${import.meta.env.VITE_API_URL}/api/categories/${encodeURIComponent(category)}`, { method: 'DELETE', credentials: 'include' });
        if (r.ok) {
            invalidateCache();
            toast('Category deleted');
            refreshData('all');
        } else {
            toast('Failed to delete category', 'error');
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
            invalidateCache();
            toast('Category color updated');
            refreshData('categories');
        } else {
            toast('Failed to update color', 'error');
        }
    };

    const startEditEvent = (event: any) => {
        setEditingEvent(event);
        setTitle(event.title);
        setDescription(event.description || '');
        setClubId(event.clubId || '');
        setRecurring(event.recurring || '');
        setEventTags(event.tags || []);

        const d = new Date(event.date);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const startDateString = `${yyyy}-${mm}-${dd}`;
        setDate(startDateString);

        const hours = d.getHours();
        const minutes = d.getMinutes();
        const ed = event.endDate ? new Date(event.endDate) : null;

        let detectedMode: ScheduleMode;
        if (hours === 0 && minutes === 0) {
            detectedMode = (event.tags || []).some((t: string) => t.trim().toLowerCase() === 'no school') ? 'holiday' : 'observance';
        } else if (hours === 8 && minutes === 0 && ed && ed.getHours() === 17 && ed.getMinutes() === 0) {
            detectedMode = 'allDay';
        } else {
            detectedMode = 'timed';
            setTime(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`);
        }
        setScheduleMode(detectedMode);

        // For recurring events, determine the series cutoff date (Repeat Until Date)
        if (event.recurring) {
            const seriesEvents = events.filter(e => 
                e.title?.trim().toLowerCase() === event.title?.trim().toLowerCase() && 
                (e.clubId || null) === (event.clubId || null) && 
                Boolean(e.recurring)
            ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

            const lastInSeries = seriesEvents[seriesEvents.length - 1];
            if (lastInSeries && seriesEvents.length > 1) {
                const ld = new Date(lastInSeries.date);
                setRecurrenceEndDate(`${ld.getFullYear()}-${String(ld.getMonth() + 1).padStart(2, '0')}-${String(ld.getDate()).padStart(2, '0')}`);
            } else {
                setRecurrenceEndDate('');
            }
        } else {
            setRecurrenceEndDate('');
        }

        if (ed) {
            const eYyyy = ed.getFullYear();
            const eMm = String(ed.getMonth() + 1).padStart(2, '0');
            const eDd = String(ed.getDate()).padStart(2, '0');
            const endDateString = `${eYyyy}-${eMm}-${eDd}`;

            const eHours = ed.getHours();
            const eMinutes = ed.getMinutes();
            if (eHours === 23 && eMinutes === 59) {
                setHasEndTime(false);
            } else {
                setHasEndTime(true);
                setEndTime(`${String(eHours).padStart(2, '0')}:${String(eMinutes).padStart(2, '0')}`);
            }

            const sameDay = endDateString === startDateString;
            const hasSpecificEndTime = eHours !== 0 && (eHours !== 23 || eMinutes !== 59);

            if (detectedMode === 'timed') {
                // Only mark multi-day or custom end time if it spans across different days or has a non-midnight/non-eod end time
                if ((!event.recurring && (!sameDay || hasSpecificEndTime)) || (event.recurring && hasSpecificEndTime)) {
                    setEndDate(endDateString);
                    setHasEndDate(true);
                } else {
                    setHasEndDate(false);
                    setEndDate('');
                }
            } else {
                // Non-timed modes: the same-day end (17:00 / 23:59) is implicit — only multi-day shows the end date field
                if (!sameDay) {
                    setEndDate(endDateString);
                    setHasEndDate(true);
                } else {
                    setHasEndDate(false);
                    setEndDate('');
                }
            }
        } else {
            setHasEndDate(false);
            setEndDate('');
            setHasEndTime(true);
            setEndTime('16:00');
        }
    };

    const resetEventForm = () => {
        setEditingEvent(null);
        setTitle('');
        setDescription('');
        setClubId('');
        setRecurring('');
        setRecurrenceEndDate('');
        setEventTags([]);
        setDate('');
        setScheduleMode('timed');
        setTime('15:00');
        setHasEndDate(false);
        setEndDate('');
        setHasEndTime(true);
        setEndTime('16:00');
    };

    const startEditClub = (club: Club) => {
        setEditingClub(club);
        setClubName(club.name);
        setClubCategory(club.category);
        setClubDesc(club.description || '');
        setClubInsta(club.instagram || '');
        setClubDiscord(club.discord || '');
        setClubImageUrl(club.imageUrl || '');
        setClubIsFeatured(Boolean(club.isFeatured));
    };

    const resetClubForm = () => {
        setEditingClub(null);
        setClubName(''); setClubCategory(''); setClubDesc('');
        setClubInsta(''); setClubDiscord(''); setCustomCategory(''); setClubImageUrl('');
        setClubIsFeatured(false);
        closeCropModal();
    };

    const handleFileSelect = (file: File) => {
        if (cropFileUrl) URL.revokeObjectURL(cropFileUrl);
        setCropFile(file);
        setCropFileUrl(URL.createObjectURL(file));
    };

    const closeCropModal = () => {
        if (cropFileUrl) URL.revokeObjectURL(cropFileUrl);
        setCropFileUrl(null);
        setCropFile(null);
    };

    const handleConfirmCrop = async (croppedAreaPixels: { x: number; y: number; width: number; height: number }, rotation: number) => {
        if (!cropFileUrl || !croppedAreaPixels) return;

        try {
            setUploading(true);
            const croppedFile = await getCroppedImg(cropFileUrl, croppedAreaPixels, rotation);
            if (!croppedFile) throw new Error('Failed to crop image');

            closeCropModal();
            await handleImageUpload(croppedFile);
        } catch {
            toast('Failed to crop image', 'error');
            setUploading(false);
        }
    };

    const handleUseOriginal = async () => {
        if (!cropFile) return;
        const file = cropFile;
        closeCropModal();
        await handleImageUpload(file);
    };

    const handleImageUpload = async (file: File) => {
        setUploading(true);
        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', uploadPreset);
            const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                method: 'POST', body: formData,
            });
            const data = await res.json();
            if (data.secure_url) {
                setClubImageUrl(data.secure_url);
                toast('Image uploaded!');
            } else {
                toast(`Upload failed: ${data.error?.message || 'Unknown error'}`, 'error');
            }
        } catch {
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
        padding: '12px 26px', borderRadius: 'var(--radius-pill)', fontWeight: 800,
        fontFamily: 'var(--font-display)', fontSize: '0.88rem', cursor: 'pointer', border: 'none',
        transition: 'all 0.25s ease',
        background: active ? 'var(--bcss-red)' : 'transparent',
        color: active ? '#FFF' : 'var(--text-secondary)',
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
                <title>Admin Dashboard | BCSS Calendar</title>
            </Helmet>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-display)', fontWeight: 900, letterSpacing: '-0.03em', color: 'var(--text-main)' }}>
                        Admin Control Dashboard
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '4px' }}>
                        Manage Burnaby Central events and student clubs.
                    </p>
                </div>
                <button onClick={handleLogout} className="btn btn-outline" style={{ gap: '8px' }}>
                    <LogOut size={16} /> Sign Out
                </button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '28px', background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: 'var(--radius-pill)', padding: '6px', width: 'fit-content' }}>
                <button onClick={() => setTab('events')} style={tabStyle(tab === 'events')}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}><CalIcon size={16} /> Manage Events</span>
                </button>
                <button onClick={() => setTab('clubs')} style={tabStyle(tab === 'clubs')}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}><Users size={16} /> Clubs & Categories</span>
                </button>
            </div>

            {/* Event Tab */}
            {tab === 'events' && (
                <div className="card" style={{ padding: '36px', animation: 'fadeUp 0.3s ease both', background: '#FFFFFF' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', paddingBottom: '18px', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {editingEvent ? <Edit3 size={24} style={{ color: 'var(--bcss-red)' }} /> : <PlusCircle size={24} style={{ color: 'var(--bcss-red)' }} />}
                            <h2 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-display)', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                                {editingEvent ? 'Edit Scheduled Event' : 'Create New School Event'}
                            </h2>
                        </div>
                        {editingEvent && (
                            <button type="button" onClick={resetEventForm} className="btn btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                                <X size={16} /> Clear Selection
                            </button>
                        )}
                    </div>
                    <form onSubmit={handleEventSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '20px' }}>
                            <div><label className="label">Event Title *</label><input required className="input" placeholder="e.g. Winter Spirit Assembly" value={title} onChange={e => setTitle(e.target.value)} /></div>
                            <div><label className="label">Hosting Club / Organization</label>
                                <select className="input" value={clubId} onChange={e => setClubId(e.target.value)}>
                                    <option value="">None (Burnaby Central Event)</option>
                                    {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, minmax(0, 1fr))', gap: '20px' }}>
                            <div><label className="label">Date *</label><input required type="date" className="input" value={date} onChange={e => setDate(e.target.value)} /></div>
                            <div>
                                <label className="label">Schedule</label>
                                <select className="input" value={scheduleMode} onChange={e => setScheduleMode(e.target.value as ScheduleMode)}>
                                    <option value="timed">Specific time</option>
                                    <option value="allDay">All Day (8 AM – 5 PM)</option>
                                    <option value="observance">Observed Day (school open)</option>
                                    <option value="holiday">No School (holiday)</option>
                                </select>
                            </div>
                            <div>
                                <label className="label">Time</label>
                                {scheduleMode === 'timed' ? (
                                    <select className="input" value={time} onChange={e => setTime(e.target.value)}>
                                        {timeOptions.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                    </select>
                                ) : (
                                    <div className="input" style={{ color: 'var(--text-muted)', cursor: 'default', background: 'var(--bg-secondary)' }}>
                                        {scheduleMode === 'allDay' ? '8:00 AM – 5:00 PM' : scheduleMode === 'holiday' ? 'All day · no school' : 'All day · school open'}
                                    </div>
                                )}
                            </div>
                            <div><label className="label">Recurrence</label>
                                <select className="input" value={recurring} onChange={e => setRecurring(e.target.value)}>
                                    <option value="">None (One-time)</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="biweekly">Bi-weekly (Every 2 weeks)</option>
                                    <option value="monthly">Monthly</option>
                                </select>
                            </div>
                        </div>

                        {recurring && (
                            <div style={{ animation: 'fadeUp 0.2s ease both', background: 'rgba(255, 46, 84, 0.04)', border: '1px solid rgba(255, 46, 84, 0.18)', borderRadius: 'var(--radius-md)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label className="label" style={{ color: 'var(--bcss-red)' }}>Repeat Until Date (Recurrence End Date)</label>
                                <input 
                                    type="date" 
                                    className="input" 
                                    value={recurrenceEndDate} 
                                    min={date || undefined}
                                    onChange={e => setRecurrenceEndDate(e.target.value)} 
                                />
                                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                                    Optional: Recurrence will automatically generate on this schedule until this date. On the live calendar, only the single next upcoming date is shown until it passes.
                                </span>
                            </div>
                        )}

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                                <input type="checkbox" checked={hasEndDate} onChange={e => setHasEndDate(e.target.checked)} style={{ accentColor: 'var(--bcss-red)', width: '16px', height: '16px' }} />
                                {scheduleMode === 'timed' ? 'Multi-day or specify end time' : 'Multi-day event'}
                            </label>
                        </div>

                        {hasEndDate && (
                            <div style={{ display: 'grid', gridTemplateColumns: (isMobile || scheduleMode !== 'timed') ? '1fr' : '1fr 1fr', gap: '20px', animation: 'fadeUp 0.2s ease both' }}>
                                <div><label className="label">End Date</label><input required type="date" className="input" value={endDate} onChange={e => setEndDate(e.target.value)} /></div>
                                {scheduleMode === 'timed' && (
                                    <div>
                                        <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            End Time
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600, textTransform: 'none', letterSpacing: 0, color: 'var(--text-muted)' }}>
                                                <input type="checkbox" checked={hasEndTime} onChange={e => setHasEndTime(e.target.checked)} style={{ accentColor: 'var(--bcss-red)', width: '14px', height: '14px' }} />
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
                                )}
                            </div>
                        )}

                        <div>
                            <label className="label">Event Categories / Tags</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '12px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                                {categories.length === 0 && <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>No categories available yet. Add some in the Clubs tab.</span>}
                                {categories.map(cat => (
                                    <button
                                        key={cat.name} type="button"
                                        onClick={() => toggleEventTag(cat.name)}
                                        className="pill"
                                        style={{
                                            padding: '6px 14px', fontSize: '0.78rem', border: 'none', cursor: 'pointer',
                                            background: eventTags.includes(cat.name) ? cat.color : 'var(--border)',
                                            color: eventTags.includes(cat.name) ? '#fff' : 'var(--text-secondary)',
                                            transition: 'all 0.2s ease',
                                        }}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <DescriptionEditor
                            label="Event Details / Description"
                            value={description}
                            onChange={setDescription}
                            placeholder="Add room location, instructions, or links (e.g. https://forms.gle/...)"
                            rows={3}
                        />

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                            <button type="button" onClick={resetEventForm} className="btn btn-ghost">Cancel</button>
                            <button type="submit" disabled={submitting} className="btn btn-red" style={{ paddingInline: '36px' }}>
                                {submitting ? 'Saving...' : (editingEvent ? 'Update Event' : 'Publish Event')}
                            </button>
                        </div>
                    </form>

                    {(() => {
                        const now = new Date();
                        const upcomingEvents = filterRecurringEvents(events).filter(e => {
                            const start = new Date(e.date);
                            const end = e.endDate ? new Date(e.endDate) : null;
                            if (end) {
                                return end >= now;
                            } else {
                                const oneHourLater = new Date(start.getTime() + 60 * 60 * 1000);
                                return oneHourLater >= now;
                            }
                        });

                        const getEventCategoryColor = (event: any) => {
                            const clubCat = event.club?.category;
                            const matched = categories.find(c => c.name === clubCat);
                            if (matched) return matched.color;

                            if (event.tags && event.tags.length > 0) {
                                for (const tag of event.tags) {
                                    if (tag.toLowerCase().trim() === 'school event') continue;
                                    const tagMatched = categories.find(c => c.name === tag);
                                    if (tagMatched) return tagMatched.color;
                                    const markerColor = getTagPillColor(tag, categories, '');
                                    if (markerColor) return markerColor;
                                }
                            }
                            return '#0F172A';
                        };

                        return (
                            <div style={{ marginTop: '44px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid var(--border)' }}>
                                    <CalIcon size={20} style={{ color: 'var(--bcss-red)' }} />
                                    <h2 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>Upcoming Scheduled Events ({upcomingEvents.length})</h2>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
                                    {upcomingEvents.map((event, idx) => {
                                        const d = new Date(event.date);
                                        const categoryColor = getEventCategoryColor(event);
                                        return (
                                            <div 
                                                key={event.id || idx} 
                                                className="card card-hover" 
                                                style={{
                                                    padding: '16px 20px',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    gap: '16px',
                                                    borderLeft: `4px solid ${categoryColor}`,
                                                    background: '#FFFFFF',
                                                }}
                                            >
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ fontWeight: 800, fontSize: '1.05rem', fontFamily: 'var(--font-display)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
                                                        <span style={{ wordBreak: 'break-word' }}>{event.title}</span>
                                                        {event.tags && event.tags.length > 0 && (
                                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                                                {event.tags.map((t: string) => {
                                                                    const tagColor = getTagPillColor(t, categories);
                                                                    return (
                                                                        <span key={t} style={{
                                                                            fontSize: '0.68rem',
                                                                            padding: '3px 10px',
                                                                            background: tagColor,
                                                                            color: '#FFFFFF',
                                                                            borderRadius: 'var(--radius-pill)',
                                                                            whiteSpace: 'nowrap',
                                                                            fontWeight: 800,
                                                                            fontFamily: 'var(--font-display)',
                                                                            textTransform: 'uppercase'
                                                                        }}>{t}</span>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px', wordBreak: 'break-word' }}>
                                                        {d.toLocaleDateString()} · {formatEventTime(event.date, event.endDate, event.tags)} · <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{event.club?.name || 'Burnaby Central'}</span>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', gap: '6px' }}>
                                                    <button onClick={() => startEditEvent(event)} className="btn btn-ghost" style={{ padding: '8px', color: 'var(--text-secondary)' }} title="Edit Event">
                                                        <Edit3 size={16} />
                                                    </button>
                                                    <button onClick={() => handleDeleteEvent(event)} className="btn btn-ghost" style={{ padding: '8px', color: 'var(--bcss-red)' }} title="Delete Event">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {upcomingEvents.length === 0 && (
                                        <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No upcoming events scheduled</div>
                                    )}
                                </div>
                            </div>
                        );
                    })()}
                </div>
            )}

            {/* Clubs & Categories Tab */}
            {tab === 'clubs' && (
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '28px', animation: 'fadeUp 0.3s ease both' }}>
                    {/* Club Creation / Edit Form */}
                    <div className="card" style={{ padding: '32px', background: '#FFFFFF' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
                            {editingClub ? <Edit3 size={22} style={{ color: 'var(--bcss-red)' }} /> : <PlusCircle size={22} style={{ color: 'var(--bcss-red)' }} />}
                            <h2 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                                {editingClub ? 'Edit Club Profile' : 'Register New Club'}
                            </h2>
                            {editingClub && (
                                <button onClick={resetClubForm} className="btn btn-ghost" style={{ marginLeft: 'auto', padding: '6px' }}>
                                    <X size={18} />
                                </button>
                            )}
                        </div>

                        <form onSubmit={handleClubSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                            <div><label className="label">Club Name *</label><input required className="input" placeholder="e.g. Robotics Club" value={clubName} onChange={e => setClubName(e.target.value)} /></div>
                            <div>
                                <label className="label">Category *</label>
                                <select required className="input" value={clubCategory} onChange={e => setClubCategory(e.target.value)}>
                                    <option value="">Select category...</option>
                                    {categories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                                    <option value="__custom__">+ Add New Category</option>
                                </select>
                            </div>
                            {clubCategory === '__custom__' && (
                                <div style={{ animation: 'fadeUp 0.2s ease both' }}>
                                    <label className="label">New Category Name *</label>
                                    <input required className="input" placeholder="e.g. STEM, Athletics" value={customCategory} onChange={e => setCustomCategory(e.target.value)} />
                                </div>
                            )}

                            <div><label className="label">Description *</label><textarea required className="input" rows={3} style={{ resize: 'vertical' }} placeholder="Overview of the club's mission and activities..." value={clubDesc} onChange={e => setClubDesc(e.target.value)} /></div>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px' }}>
                                <div><label className="label">Instagram Link</label><input className="input" placeholder="https://instagram.com/..." value={clubInsta} onChange={e => setClubInsta(e.target.value)} /></div>
                                <div><label className="label">Discord Invite</label><input className="input" placeholder="https://discord.gg/..." value={clubDiscord} onChange={e => setClubDiscord(e.target.value)} /></div>
                            </div>

                            {/* Image Upload */}
                            <div>
                                <label className="label">Club Banner / Image</label>
                                {clubImageUrl ? (
                                    <div style={{ position: 'relative', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginTop: '8px', border: '1px solid var(--border)', background: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '140px', maxHeight: '240px' }}>
                                        <img src={clubImageUrl} alt="Club Banner Preview" style={{ width: '100%', height: 'auto', maxHeight: '240px', objectFit: 'contain', display: 'block' }} />
                                        <button type="button" onClick={() => setClubImageUrl('')} style={{
                                            position: 'absolute', top: '10px', right: '10px',
                                            background: 'rgba(15,23,42,0.85)', border: '1px solid var(--border)', borderRadius: '50%',
                                            width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            cursor: 'pointer', color: '#fff',
                                        }}>
                                            <X size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <label style={{
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                        border: '2px dashed var(--border-strong)', borderRadius: 'var(--radius-md)',
                                        padding: '28px', cursor: 'pointer', marginTop: '8px',
                                        transition: 'all 0.25s ease', background: 'var(--bg-secondary)',
                                    }}
                                        onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--bcss-red)'; }}
                                        onDragLeave={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; }}
                                        onDrop={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--border-strong)'; const f = e.dataTransfer.files[0]; if (f) handleFileSelect(f); }}
                                    >
                                        {uploading ? (
                                            <Loader2 size={26} style={{ color: 'var(--bcss-red)', animation: 'spin 1s linear infinite' }} />
                                        ) : (
                                            <>
                                                <ImagePlus size={28} style={{ color: 'var(--bcss-red)', marginBottom: '10px' }} />
                                                <span style={{ fontSize: '0.88rem', color: 'var(--text-main)', fontWeight: 700 }}>Upload Banner Image</span>
                                                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '4px' }}>PNG, JPG or WEBP (21:9 ratio)</span>
                                            </>
                                        )}
                                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }} />
                                    </label>
                                )}
                            </div>

                            <div style={{ padding: '12px 16px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
                                    <input 
                                        type="checkbox" 
                                        checked={clubIsFeatured} 
                                        onChange={e => setClubIsFeatured(e.target.checked)} 
                                        style={{ accentColor: 'var(--bcss-red)', width: '18px', height: '18px', cursor: 'pointer' }} 
                                    />
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Star size={16} fill={clubIsFeatured ? '#F59E0B' : 'none'} style={{ color: clubIsFeatured ? '#F59E0B' : 'var(--text-muted)' }} />
                                        <span>Feature on Dashboard Home Page</span>
                                    </div>
                                </label>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                                {editingClub && <button type="button" onClick={resetClubForm} className="btn btn-ghost">Cancel</button>}
                                <button type="submit" disabled={submitting} className="btn btn-red" style={{ paddingInline: '32px' }}>
                                    {submitting ? 'Saving...' : editingClub ? 'Update Club' : 'Create Club'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Crop Modal */}
                    {cropFileUrl && (
                        <ImageCropModal
                            imageUrl={cropFileUrl}
                            uploading={uploading}
                            onCancel={closeCropModal}
                            onConfirm={handleConfirmCrop}
                            onUseOriginal={handleUseOriginal}
                        />
                    )}

                    {/* Content Lists */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                        {/* Club List */}
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Users size={20} style={{ color: 'var(--bcss-red)' }} />
                                    <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem', margin: 0, color: 'var(--text-main)' }}>
                                        Registered Clubs ({clubs.length})
                                    </h3>
                                </div>
                                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', background: 'var(--bg-secondary)', padding: '4px 10px', borderRadius: 'var(--radius-pill)', border: '1px solid var(--border)' }}>
                                    ⭐ {clubs.filter(c => c.isFeatured).length} Featured
                                </span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '380px', overflowY: 'auto', paddingRight: '4px' }}>
                                {clubs.map(club => (
                                    <div key={club.id} className="card card-hover" style={{
                                        padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', background: '#FFFFFF',
                                    }}>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontWeight: 800, fontSize: '1.05rem', fontFamily: 'var(--font-display)', wordBreak: 'break-word', color: 'var(--text-main)' }}>{club.name}</div>
                                            <span style={{ 
                                                marginTop: '6px', 
                                                fontSize: '0.68rem', 
                                                padding: '3px 10px', 
                                                background: categories.find(c => c.name.toLowerCase().trim() === club.category.toLowerCase().trim())?.color || 'var(--bcss-red)', 
                                                color: '#FFFFFF', 
                                                fontWeight: 800, 
                                                borderRadius: 'var(--radius-pill)', 
                                                display: 'inline-block', 
                                                fontFamily: 'var(--font-display)', 
                                                textTransform: 'uppercase' 
                                            }}>
                                                {club.category}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                                            <button 
                                                type="button" 
                                                onClick={() => handleToggleFeatured(club.id)} 
                                                className="btn" 
                                                style={{ 
                                                    padding: '6px 12px', 
                                                    fontSize: '0.78rem', 
                                                    fontWeight: 700, 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    gap: '6px', 
                                                    borderRadius: 'var(--radius-pill)', 
                                                    border: club.isFeatured ? '1px solid #FCD34D' : '1px solid var(--border)', 
                                                    background: club.isFeatured ? '#FEF3C7' : 'var(--bg-secondary)', 
                                                    color: club.isFeatured ? '#B45309' : 'var(--text-secondary)', 
                                                    cursor: 'pointer', 
                                                    transition: 'all 0.2s ease', 
                                                }} 
                                                title={club.isFeatured ? 'Click to unpin from dashboard featured' : 'Click to pin to dashboard featured'}
                                            >
                                                <Star size={14} fill={club.isFeatured ? '#F59E0B' : 'none'} style={{ color: club.isFeatured ? '#F59E0B' : 'var(--text-muted)' }} />
                                                {club.isFeatured ? 'Featured' : 'Feature'}
                                            </button>
                                            <button onClick={() => startEditClub(club)} className="btn btn-ghost" style={{ padding: '8px', color: 'var(--text-secondary)' }} title="Edit Club">
                                                <Edit3 size={16} />
                                            </button>
                                            <button onClick={() => handleDeleteClub(club.id)} className="btn btn-ghost" style={{ padding: '8px', color: 'var(--bcss-red)' }} title="Delete Club">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {clubs.length === 0 && (
                                    <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        No clubs created yet. Add your first Burnaby Central club!
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Category List */}
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                                <Tag size={20} style={{ color: 'var(--bcss-red)' }} />
                                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem', margin: 0, color: 'var(--text-main)' }}>
                                    Manage Categories
                                </h3>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                {categories.map(cat => (
                                    <div key={cat.name} className="card" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 14px', background: '#FFFFFF' }}>
                                        <div style={{ position: 'relative', width: '22px', height: '22px', borderRadius: '50%', overflow: 'hidden', border: '1px solid var(--border)' }}>
                                            <input
                                                type="color"
                                                defaultValue={cat.color}
                                                onBlur={(e) => {
                                                    if (e.target.value !== cat.color) {
                                                        handleUpdateCategoryColor(cat.name, e.target.value);
                                                    }
                                                }}
                                                style={{ position: 'absolute', top: '-10px', left: '-10px', width: '44px', height: '44px', cursor: 'pointer', border: 'none', padding: 0 }}
                                                title="Click to Change Tag Color"
                                            />
                                        </div>
                                        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>{cat.name}</span>
                                        <button onClick={() => handleDeleteCategory(cat.name)} className="btn btn-ghost" style={{ padding: '4px', color: 'var(--bcss-red)', minHeight: 0, height: 'auto' }} title={`Delete ${cat.name} and all associated items`}>
                                            <X size={15} />
                                        </button>
                                    </div>
                                ))}
                                {categories.length === 0 && (
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>No categories registered yet.</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
