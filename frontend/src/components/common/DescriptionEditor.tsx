import React, { useState, useRef } from 'react';
import { Link2, Eye, Edit3, X, Check } from 'lucide-react';
import { RichDescription } from './RichDescription';

interface DescriptionEditorProps {
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
    rows?: number;
    label?: string;
}

export const DescriptionEditor: React.FC<DescriptionEditorProps> = ({
    value,
    onChange,
    placeholder = 'Add event information, room location, or links...',
    rows = 4,
    label = 'Event Details / Description',
}) => {
    const [mode, setMode] = useState<'write' | 'preview'>('write');
    const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
    const [linkText, setLinkText] = useState('');
    const [linkUrl, setLinkUrl] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const urlInputRef = useRef<HTMLInputElement>(null);
    const [selectionRange, setSelectionRange] = useState<{ start: number; end: number }>({ start: 0, end: 0 });

    const handleOpenLinkDialog = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            setSelectionRange({ start, end });
            const selected = textarea.value.substring(start, end);
            setLinkText(selected);
        } else {
            setLinkText('');
        }
        setLinkUrl('');
        setIsLinkDialogOpen(true);
    };

    const handleInsertLink = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        let trimmedUrl = linkUrl.trim();
        if (!trimmedUrl) {
            setIsLinkDialogOpen(false);
            return;
        }

        // Prepend https:// if user pasted www. or bare domain
        if (!/^https?:\/\//i.test(trimmedUrl) && !/^mailto:/i.test(trimmedUrl)) {
            trimmedUrl = `https://${trimmedUrl}`;
        }

        const trimmedText = linkText.trim();
        const markdownLink = trimmedText ? `[${trimmedText}](${trimmedUrl})` : trimmedUrl;

        const before = value.substring(0, selectionRange.start);
        const after = value.substring(selectionRange.end);
        const newValue = `${before}${markdownLink}${after}`;

        onChange(newValue);
        setIsLinkDialogOpen(false);

        // Restore focus to textarea after inserting
        setTimeout(() => {
            if (textareaRef.current) {
                textareaRef.current.focus();
                const newPos = before.length + markdownLink.length;
                textareaRef.current.setSelectionRange(newPos, newPos);
            }
        }, 50);
    };

    const insertPreset = (presetText: string, presetUrl: string) => {
        const textarea = textareaRef.current;
        const start = textarea ? textarea.selectionStart : value.length;
        const end = textarea ? textarea.selectionEnd : value.length;

        const before = value.substring(0, start);
        const after = value.substring(end);
        const snippet = `[${presetText}](${presetUrl})`;
        const newValue = `${before}${snippet}${after}`;

        onChange(newValue);
        setTimeout(() => {
            if (textareaRef.current) {
                textareaRef.current.focus();
                // Select the URL portion for quick replacement
                const urlStart = before.length + presetText.length + 3;
                const urlEnd = urlStart + presetUrl.length;
                textareaRef.current.setSelectionRange(urlStart, urlEnd);
            }
        }, 50);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
            {/* Header & Mode Switcher */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                {label && <label className="label" style={{ marginBottom: 0 }}>{label}</label>}

                <div style={{ display: 'inline-flex', background: 'var(--bg-secondary)', padding: '2px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                    <button
                        type="button"
                        onClick={() => setMode('write')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '4px 10px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            borderRadius: 'var(--radius-sm)',
                            border: 'none',
                            background: mode === 'write' ? '#FFFFFF' : 'transparent',
                            color: mode === 'write' ? 'var(--text-main)' : 'var(--text-muted)',
                            boxShadow: mode === 'write' ? 'var(--shadow-xs)' : 'none',
                            cursor: 'pointer',
                        }}
                    >
                        <Edit3 size={13} /> Write
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode('preview')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '4px 10px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            borderRadius: 'var(--radius-sm)',
                            border: 'none',
                            background: mode === 'preview' ? '#FFFFFF' : 'transparent',
                            color: mode === 'preview' ? 'var(--bcss-red)' : 'var(--text-muted)',
                            boxShadow: mode === 'preview' ? 'var(--shadow-xs)' : 'none',
                            cursor: 'pointer',
                        }}
                    >
                        <Eye size={13} /> Preview
                    </button>
                </div>
            </div>

            {/* Formatting Toolbar (Visible in Write Mode) */}
            {mode === 'write' && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '6px',
                    background: '#F8FAFC',
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                    border: '1px solid var(--border-strong)',
                    borderBottom: 'none',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <button
                            type="button"
                            onClick={handleOpenLinkDialog}
                            className="btn btn-outline"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                padding: '4px 10px',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                height: '28px',
                                background: '#FFFFFF',
                                color: 'var(--text-main)',
                                borderColor: 'var(--border-strong)',
                                borderRadius: 'var(--radius-sm)',
                            }}
                            title="Insert Link"
                        >
                            <Link2 size={13} style={{ color: 'var(--bcss-red)' }} />
                            <span>Add Link</span>
                        </button>

                        {/* Quick preset templates */}
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: '4px' }}>Quick:</span>
                        <button
                            type="button"
                            onClick={() => insertPreset('Sign-Up Form', 'https://forms.gle/...')}
                            style={{
                                background: '#FFFFFF',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius-pill)',
                                padding: '2px 8px',
                                fontSize: '0.72rem',
                                fontWeight: 600,
                                color: 'var(--text-secondary)',
                                cursor: 'pointer',
                            }}
                            title="Insert Google Form template"
                        >
                            + Form
                        </button>
                        <button
                            type="button"
                            onClick={() => insertPreset('Join Meeting', 'https://zoom.us/...')}
                            style={{
                                background: '#FFFFFF',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius-pill)',
                                padding: '2px 8px',
                                fontSize: '0.72rem',
                                fontWeight: 600,
                                color: 'var(--text-secondary)',
                                cursor: 'pointer',
                            }}
                            title="Insert Zoom or Meet template"
                        >
                            + Meeting
                        </button>
                        <button
                            type="button"
                            onClick={() => insertPreset('Instagram', 'https://instagram.com/...')}
                            style={{
                                background: '#FFFFFF',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius-pill)',
                                padding: '2px 8px',
                                fontSize: '0.72rem',
                                fontWeight: 600,
                                color: 'var(--text-secondary)',
                                cursor: 'pointer',
                            }}
                            title="Insert Instagram template"
                        >
                            + Instagram
                        </button>
                    </div>

                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        Supports URLs & [text](url)
                    </span>
                </div>
            )}

            {/* Inline Link Insertion Popover */}
            {isLinkDialogOpen && mode === 'write' && (
                <div style={{
                    background: '#FFFFFF',
                    border: '1.5px solid var(--bcss-red)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 14px',
                    boxShadow: 'var(--shadow-md)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    animation: 'fadeUp 0.15s ease both',
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Link2 size={14} style={{ color: 'var(--bcss-red)' }} /> Insert Clickable Link
                        </span>
                        <button
                            type="button"
                            onClick={() => setIsLinkDialogOpen(false)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px' }}
                        >
                            <X size={15} />
                        </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '10px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                                Link Text (optional)
                            </label>
                            <input
                                type="text"
                                className="input"
                                value={linkText}
                                onChange={(e) => setLinkText(e.target.value)}
                                placeholder="e.g. Sign-Up Form"
                                style={{ height: '34px', fontSize: '0.82rem', padding: '6px 10px' }}
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        if (linkUrl.trim()) {
                                            handleInsertLink();
                                        } else if (urlInputRef.current) {
                                            urlInputRef.current.focus();
                                        }
                                    } else if (e.key === 'Escape') {
                                        e.preventDefault();
                                        setIsLinkDialogOpen(false);
                                    }
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                                URL Address <span style={{ color: 'var(--bcss-red)' }}>*</span>
                            </label>
                            <input
                                ref={urlInputRef}
                                type="text"
                                className="input"
                                value={linkUrl}
                                onChange={(e) => setLinkUrl(e.target.value)}
                                placeholder="https://forms.gle/..."
                                style={{ height: '34px', fontSize: '0.82rem', padding: '6px 10px' }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleInsertLink();
                                    } else if (e.key === 'Escape') {
                                        e.preventDefault();
                                        setIsLinkDialogOpen(false);
                                    }
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '2px' }}>
                        <button
                            type="button"
                            onClick={() => setIsLinkDialogOpen(false)}
                            className="btn btn-ghost"
                            style={{ height: '30px', padding: '0 12px', fontSize: '0.78rem' }}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={() => handleInsertLink()}
                            className="btn btn-red"
                            style={{ height: '30px', padding: '0 14px', fontSize: '0.78rem', gap: '4px' }}
                            disabled={!linkUrl.trim()}
                        >
                            <Check size={13} /> Insert Link
                        </button>
                    </div>
                </div>
            )}

            {/* Input / Preview Area */}
            {mode === 'write' ? (
                <textarea
                    ref={textareaRef}
                    className="input"
                    rows={rows}
                    style={{
                        resize: 'vertical',
                        borderRadius: mode === 'write' ? '0 0 var(--radius-md) var(--radius-md)' : 'var(--radius-md)',
                        fontFamily: 'inherit',
                        lineHeight: 1.6,
                    }}
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                />
            ) : (
                <div style={{
                    minHeight: `${rows * 28}px`,
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    background: '#FFFFFF',
                    fontSize: '0.92rem',
                }}>
                    {value.trim() ? (
                        <RichDescription content={value} />
                    ) : (
                        <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.85rem' }}>
                            No description entered yet. Switch to "Write" to add details and links.
                        </span>
                    )}
                </div>
            )}
        </div>
    );
};
