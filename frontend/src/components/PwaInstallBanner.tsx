import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

export const PwaInstallBanner = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const checkStandalone = () => {
            const isStandalone = 
                window.matchMedia('(display-mode: standalone)').matches ||
                window.matchMedia('(display-mode: minimal-ui)').matches ||
                window.matchMedia('(display-mode: fullscreen)').matches ||
                (window.navigator as any).standalone === true ||
                document.referrer.includes('android-app://');
            return isStandalone;
        };

        if (checkStandalone()) {
            setIsVisible(false);
            return;
        }

        const promptHandler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            
            const isDismissed = localStorage.getItem('bcss_pwa_dismissed') === 'true';
            if (!isDismissed) {
                setIsVisible(true);
            }
        };

        const installHandler = () => {
            setIsVisible(false);
            setDeferredPrompt(null);
        };

        window.addEventListener('beforeinstallprompt', promptHandler);
        window.addEventListener('appinstalled', installHandler);

        return () => {
            window.removeEventListener('beforeinstallprompt', promptHandler);
            window.removeEventListener('appinstalled', installHandler);
        };
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
        <div className="pwa-banner">
            <div className="pwa-banner-logo">
                <img src="/cropped-wildcat-logo.png" alt="Wildcats logo" />
            </div>
            <div className="pwa-banner-content">
                <div className="pwa-banner-title">
                    Install Wildcat Calendar
                </div>
                <div className="pwa-banner-desc">
                    Add this app to your home screen for quick access and offline browsing.
                </div>
            </div>
            <div className="pwa-banner-actions">
                <button onClick={handleInstallClick} className="pwa-banner-btn-install">
                    Install
                </button>
                <button onClick={handleDismiss} className="pwa-banner-btn-dismiss">
                    <X size={11} /> Dismiss
                </button>
            </div>
        </div>
    );
};
