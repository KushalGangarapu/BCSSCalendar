import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

export const PwaInstallBanner = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            
            const isDismissed = localStorage.getItem('bcss_pwa_dismissed') === 'true';
            if (!isDismissed) {
                setIsVisible(true);
            }
        };

        window.addEventListener('beforeinstallprompt', handler);

        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        if (isStandalone) {
            setIsVisible(false);
        }

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`PWA install outcome: ${deferredPrompt ? outcome : 'unknown'}`);
        
        setDeferredPrompt(null);
        setIsVisible(false);
    };

    const handleDismiss = () => {
        localStorage.setItem('bcss_pwa_dismissed', 'true');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            background: 'var(--black)',
            color: '#fff',
            padding: '16px 20px',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            maxWidth: '380px',
            animation: 'fadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) both',
            border: '1px solid var(--gray-800)',
        }}>
            <div style={{
                width: '40px', height: '40px', borderRadius: '50%',
                background: 'rgba(211,47,47,0.15)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
                <Download size={20} style={{ color: 'var(--red)' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 800, fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}>
                    Install Wildcat Calendar
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)', marginTop: '2px', lineHeight: 1.3 }}>
                    Add this app to your home screen for quick access and offline browsing.
                </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                <button onClick={handleInstallClick} className="btn btn-red" style={{ padding: '6px 12px', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                    Install
                </button>
                <button onClick={handleDismiss} style={{ background: 'none', border: 'none', color: 'var(--gray-500)', cursor: 'pointer', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <X size={10} /> Dismiss
                </button>
            </div>
        </div>
    );
};
