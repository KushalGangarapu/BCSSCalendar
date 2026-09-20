import { useState } from 'react';
import { createPortal } from 'react-dom';
import Cropper, { type Area } from 'react-easy-crop';
import { X, Crop, Loader2, ZoomIn, ZoomOut, RotateCw, RotateCcw, Image as ImageIcon } from 'lucide-react';
import { useIsMobile } from '../../hooks/useIsMobile';

interface ImageCropModalProps {
    imageUrl: string;
    uploading: boolean;
    onCancel: () => void;
    onConfirm: (croppedAreaPixels: Area, rotation: number) => void;
    onUseOriginal: () => void;
}

export const ImageCropModal = ({ imageUrl, uploading, onCancel, onConfirm, onUseOriginal }: ImageCropModalProps) => {
    const isMobile = useIsMobile();
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [croppedArea, setCroppedArea] = useState<Area | null>(null);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

    const clampZoom = (z: number) => Math.min(4, Math.max(1, Number(z.toFixed(2))));

    const handleReset = () => {
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setRotation(0);
    };

    // Percent-based CSS crop preview: background-size scales so the crop width fills
    // the container; background-position aligns the region using the x/(100-w) formula.
    const previewStyle = (() => {
        if (!croppedArea || rotation !== 0) return null;
        const { x, y, width, height } = croppedArea;
        const posX = width >= 100 ? 0 : (x / (100 - width)) * 100;
        const posY = height >= 100 ? 0 : (y / (100 - height)) * 100;
        return {
            backgroundImage: `url(${imageUrl})`,
            backgroundSize: `${(100 / width) * 100}% auto`,
            backgroundPosition: `${posX}% ${posY}%`,
            backgroundRepeat: 'no-repeat',
        } as React.CSSProperties;
    })();

    const iconBtnStyle: React.CSSProperties = {
        width: '34px', height: '34px', padding: 0, borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    };

    return createPortal(
        <div className="modal-overlay" style={{
            position: 'fixed',
            top: 0, bottom: 0, left: 0, right: 0,
            zIndex: 9999,
            background: 'rgba(10, 14, 26, 0.88)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }}>
            <div className="modal" style={{
                width: '100%',
                maxWidth: '620px',
                maxHeight: '92dvh',
                overflowY: 'auto',
                padding: isMobile ? '20px 16px calc(env(safe-area-inset-bottom, 0px) + 20px)' : '28px',
                background: '#FFFFFF',
                boxShadow: '0 25px 60px rgba(0,0,0,0.5)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '1.3rem', fontFamily: 'var(--font-display)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)' }}>
                        <Crop size={22} style={{ color: 'var(--bcss-red)' }} /> Crop Banner Photo
                    </h3>
                    <button onClick={onCancel} className="btn btn-ghost" style={{ padding: '8px' }}>
                        <X size={20} />
                    </button>
                </div>

                <div style={{ position: 'relative', width: '100%', height: 'min(340px, 40dvh)', background: '#0F172A', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border)' }}>
                    <Cropper
                        image={imageUrl}
                        crop={crop}
                        zoom={zoom}
                        rotation={rotation}
                        aspect={21 / 9}
                        minZoom={1}
                        maxZoom={4}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={(croppedArea, croppedAreaPixels) => {
                            setCroppedArea(croppedArea);
                            setCroppedAreaPixels(croppedAreaPixels);
                        }}
                    />
                </div>

                {/* Controls */}
                <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <button type="button" onClick={() => setZoom(z => clampZoom(z - 0.1))} className="btn btn-outline" style={iconBtnStyle} title="Zoom out">
                        <ZoomOut size={16} />
                    </button>
                    <input
                        type="range"
                        value={zoom}
                        min={1} max={4} step={0.1}
                        onChange={(e) => setZoom(Number(e.target.value))}
                        style={{ flex: 1, minWidth: '100px', accentColor: 'var(--bcss-red)' }}
                    />
                    <button type="button" onClick={() => setZoom(z => clampZoom(z + 0.1))} className="btn btn-outline" style={iconBtnStyle} title="Zoom in">
                        <ZoomIn size={16} />
                    </button>
                    <div style={{ width: '1px', height: '22px', background: 'var(--border)', flexShrink: 0 }} />
                    <button type="button" onClick={() => setRotation(r => (r + 90) % 360)} className="btn btn-outline" style={iconBtnStyle} title="Rotate 90°">
                        <RotateCw size={16} />
                    </button>
                    <button type="button" onClick={handleReset} className="btn btn-outline" style={iconBtnStyle} title="Reset crop">
                        <RotateCcw size={16} />
                    </button>
                </div>

                {/* Live card preview */}
                <div style={{ marginTop: '16px' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <ImageIcon size={13} /> Card preview
                    </div>
                    {previewStyle ? (
                        <div style={{ ...previewStyle, width: '100%', aspectRatio: '21 / 9', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-secondary)' }} />
                    ) : (
                        <div style={{ width: '100%', aspectRatio: '21 / 9', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-strong)', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, padding: '8px', textAlign: 'center' }}>
                            Preview available after resetting rotation
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px', flexWrap: 'wrap' }}>
                    <button onClick={onCancel} className="btn btn-outline">Cancel</button>
                    <button onClick={onUseOriginal} disabled={uploading} className="btn btn-outline" style={{ gap: '8px' }}>
                        <ImageIcon size={15} /> Use original
                    </button>
                    <button onClick={() => croppedAreaPixels && onConfirm(croppedAreaPixels, rotation)} disabled={uploading || !croppedAreaPixels} className="btn btn-red" style={{ gap: '8px' }}>
                        {uploading ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Processing...</> : 'Crop & Upload'}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};
