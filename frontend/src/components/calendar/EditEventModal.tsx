import { useState, useEffect } from 'react';
import { X, Edit3, Save } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useToast } from '../Toast';
import { invalidateCache } from '../../utils/apiCache';
import { DescriptionEditor } from '../common/DescriptionEditor';
import { useIsMobile } from '../../hooks/useIsMobile';
import { OBSERVANCE_TAG, NO_SCHOOL_TAG, MARKER_TAGS } from '../../utils/timeUtils';

type ScheduleMode = 'timed' | 'allDay' | 'observance' | 'holiday';

interface EditEventModalProps {
    event: any;
    onClose: () => void;
    onSaveSuccess: () => void;
    clubs: any[];
    categories: { name: string; color: string }[];
}

export const EditEventModal = ({
    event,
    onClose,
    onSaveSuccess,
    clubs = [],
    categories = [],
}: EditEventModalProps) => {
    const { toast } = useToast();
    const isMobile = useIsMobile();
    const [submitting, setSubmitting] = useState(false);

    const [title, setTitle] = useState('');
    const [clubId, setClubId] = useState<string>('');
    const [dateStr, setDateStr] = useState('');
    const [scheduleMode, setScheduleMode] = useState<ScheduleMode>('timed');
    const [timeStr, setTimeStr] = useState('09:00');
    const [hasEndDate, setHasEndDate] = useState(false);
    const [endDateStr, setEndDateStr] = useState('');
    const [endTimeStr, setEndTimeStr] = useState('17:00');
    const [description, setDescription] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [recurring, setRecurring] = useState<string>('');

    useEffect(() => {
        if (!event) return;

        setTitle(event.title || '');
        setClubId(event.clubId || '');
        setDescription(event.description || '');
        setRecurring(event.recurring || '');
        setSelectedTags(event.tags || []);

        const parsedStart = event.date ? (typeof event.date === 'string' ? parseISO(event.date) : new Date(event.date)) : null;
        const parsedEnd = event.endDate ? (typeof event.endDate === 'string' ? parseISO(event.endDate) : new Date(event.endDate)) : null;

        const startDayStr = parsedStart ? format(parsedStart, 'yyyy-MM-dd') : '';
        const endDayStr = parsedEnd ? format(parsedEnd, 'yyyy-MM-dd') : '';
        const hours = parsedStart ? parsedStart.getHours() : 0;
        const minutes = parsedStart ? parsedStart.getMinutes() : 0;
        const endIs17 = parsedEnd ? parsedEnd.getHours() === 17 && parsedEnd.getMinutes() === 0 : false;

        let mode: ScheduleMode;
        if (parsedStart && hours === 0 && minutes === 0) {
            mode = (event.tags || []).some((t: string) => t.trim().toLowerCase() === 'no school') ? 'holiday' : 'observance';
        } else if (parsedStart && hours === 8 && minutes === 0 && endIs17) {
            mode = 'allDay';
        } else {
            mode = 'timed';
            if (parsedStart) {
                setTimeStr(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`);
            }
        }
        setScheduleMode(mode);
        if (parsedStart) setDateStr(startDayStr);

        if (parsedEnd) {
            const endHours = parsedEnd.getHours();
            const endMinutes = parsedEnd.getMinutes();
            const isEndTimeSpecific = endHours !== 0 || endMinutes !== 0;
            const sameDay = startDayStr === endDayStr;

            if (isEndTimeSpecific) {
                setEndTimeStr(`${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`);
            }

            // Non-timed modes: the same-day end (17:00 / 23:59) is implicit — only multi-day shows the end date field
            const showEndDate = mode === 'timed' ? (!sameDay || isEndTimeSpecific) : !sameDay;
            setHasEndDate(showEndDate);
            setEndDateStr(showEndDate ? endDayStr : '');
        } else {
            setHasEndDate(false);
            setEndDateStr('');
        }
    }, [event]);

    if (!event) return null;

    const toggleTag = (tag: string) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags(selectedTags.filter(t => t !== tag));
        } else {
            setSelectedTags([...selectedTags, tag]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) {
            toast('Please provide an event title', 'error');
            return;
        }
        if (!dateStr) {
            toast('Please select a start date', 'error');
            return;
        }

        setSubmitting(true);

        try {
            const startIso = scheduleMode === 'timed' ? `${dateStr}T${timeStr}:00`
                : scheduleMode === 'allDay' ? `${dateStr}T08:00:00`
                : `${dateStr}T00:00:00`;
            const startDt = new Date(startIso);

            let endDt: Date | null = null;
            if (scheduleMode === 'allDay') {
                const targetEndDay = (hasEndDate && endDateStr) ? endDateStr : dateStr;
                endDt = new Date(`${targetEndDay}T17:00:00`);
            } else if (hasEndDate) {
                const targetEndDay = endDateStr || dateStr;
                const endIso = scheduleMode === 'timed' ? `${targetEndDay}T${endTimeStr}:00` : `${targetEndDay}T23:59:59`;
                endDt = new Date(endIso);
            }

            const finalTags = selectedTags.filter(t => !MARKER_TAGS.includes(t));
            if (scheduleMode === 'observance') finalTags.push(OBSERVANCE_TAG);
            if (scheduleMode === 'holiday') finalTags.push(NO_SCHOOL_TAG);

            let allFuture = false;
            if (event.recurring) {
                allFuture = window.confirm(
                    'This is a recurring event series.\n\nClick OK to ALSO update ALL FUTURE occurrences in the series.\nClick Cancel to ONLY update this specific event.'
                );
            }

            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/events/${event.id}?allFuture=${allFuture}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    title,
                    date: startDt.toISOString(),
                    endDate: endDt ? endDt.toISOString() : null,
                    description,
                    clubId: clubId || null,
                    recurring: recurring || null,
                    tags: finalTags,
                }),
            });

            if (res.ok) {
                invalidateCache();
                toast('Event updated successfully!', 'success');
                onSaveSuccess();
                onClose();
            } else {
                const data = await res.json();
                toast(data.error || 'Failed to update event', 'error');
            }
        } catch (err) {
            console.error('Error saving event:', err);
            toast('Network or server error updating event', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
            <div
                className="modal"
                onClick={e => e.stopPropagation()}
                style={{
                    maxWidth: '560px',
                    position: 'relative',
                }}
            >
                <button
                    onClick={onClose}
                    className="btn btn-ghost"
                    style={{ position: 'absolute', top: '18px', right: '18px', padding: '8px', color: 'var(--text-muted)' }}
                >
                    <X size={20} />
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                    <div style={{
                        width: '40px', height: '40px', borderRadius: '50%',
                        background: 'var(--bcss-red-soft)', color: 'var(--bcss-red)',
                        border: '1px solid var(--border-strong)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <Edit3 size={18} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-display)', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                            Edit Event Details
                        </h2>
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                            Modify event title, schedule, or organizing club
                        </span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <label className="label">Event Title *</label>
                        <input
                            type="text"
                            className="input"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="e.g. Spring Music Performance"
                            required
                        />
                    </div>

                    <div>
                        <label className="label">Hosting Club / Organization</label>
                        <select
                            className="input"
                            value={clubId}
                            onChange={e => setClubId(e.target.value)}
                        >
                            <option value="">None (Burnaby Central School Event)</option>
                            {clubs.map(c => (
                                <option key={c.id} value={c.id}>
                                    {c.name} ({c.category})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div>
                            <label className="label">Schedule</label>
                            <select
                                className="input"
                                value={scheduleMode}
                                onChange={e => setScheduleMode(e.target.value as ScheduleMode)}
                            >
                                <option value="timed">Specific time</option>
                                <option value="allDay">All Day (8 AM – 5 PM)</option>
                                <option value="observance">Observed Day (school open)</option>
                                <option value="holiday">No School (holiday)</option>
                            </select>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
                            <div>
                                <label className="label">Start Date *</label>
                                <input
                                    type="date"
                                    className="input"
                                    value={dateStr}
                                    onChange={e => setDateStr(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className="label">{scheduleMode === 'timed' ? 'Start Time *' : 'Hours'}</label>
                                {scheduleMode === 'timed' ? (
                                    <input
                                        type="time"
                                        className="input"
                                        value={timeStr}
                                        onChange={e => setTimeStr(e.target.value)}
                                        required
                                    />
                                ) : (
                                    <div className="input" style={{ color: 'var(--text-muted)', cursor: 'default', background: 'var(--bg-secondary)' }}>
                                        {scheduleMode === 'allDay' ? '8:00 AM – 5:00 PM' : scheduleMode === 'holiday' ? 'All day · no school' : 'All day · school open'}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div>
                        <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                            <input
                                type="checkbox"
                                checked={hasEndDate}
                                onChange={e => setHasEndDate(e.target.checked)}
                                style={{ accentColor: 'var(--bcss-red)', cursor: 'pointer' }}
                            />
                            {scheduleMode === 'timed' ? 'Multi-Day or Custom End Time' : 'Multi-Day Event'}
                        </label>

                        {hasEndDate && (
                            <div style={{ display: 'grid', gridTemplateColumns: (scheduleMode === 'timed' && !isMobile) ? '1fr 1fr' : '1fr', gap: '10px', marginTop: '6px' }}>
                                <input
                                    type="date"
                                    className="input"
                                    value={endDateStr}
                                    onChange={e => setEndDateStr(e.target.value)}
                                />
                                {scheduleMode === 'timed' && (
                                    <input
                                        type="time"
                                        className="input"
                                        value={endTimeStr}
                                        onChange={e => setEndTimeStr(e.target.value)}
                                    />
                                )}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="label">Categories & Tags</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {categories.map(cat => {
                                const selected = selectedTags.includes(cat.name);
                                return (
                                    <button
                                        key={cat.name}
                                        type="button"
                                        onClick={() => toggleTag(cat.name)}
                                        className="pill"
                                        style={{
                                            cursor: 'pointer',
                                            border: selected ? '1px solid transparent' : '1px solid var(--border)',
                                            padding: '6px 14px',
                                            fontSize: '0.75rem',
                                            background: selected ? cat.color : 'rgba(255,255,255,0.05)',
                                            color: selected ? '#fff' : 'var(--text-secondary)',
                                            transition: 'all 0.15s ease',
                                        }}
                                    >
                                        {cat.name}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <DescriptionEditor
                        label="Description / Details"
                        value={description}
                        onChange={setDescription}
                        placeholder="Add event information, requirements, or links (e.g. https://forms.gle/...)"
                        rows={3}
                    />

                    <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-outline"
                            style={{ flex: 1 }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-red"
                            disabled={submitting}
                            style={{ flex: 1, gap: '8px' }}
                        >
                            <Save size={16} />
                            {submitting ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
