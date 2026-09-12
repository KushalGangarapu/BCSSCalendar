import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

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

        // 1. If running inside standalone PWA window, never show the banner
        if (checkStandalone()) {
            setIsVisible(false);
            return;
        }

        // 2. If user already explicitly dismissed the banner, don't show
        if (localStorage.getItem('bcss_pwa_dismissed') === 'true') {
            setIsVisible(false);
            return;
        }

        // 3. Browser-level check for installed apps (supported in modern Chrome / Edge)
        if ('getInstalledRelatedApps' in navigator) {
            (navigator as any).getInstalledRelatedApps()
                .then((relatedApps: any[]) => {
                    if (relatedApps && relatedApps.length > 0) {
                        setIsVisible(false);
                    }
                })
                .catch(() => {});
        }

        const promptHandler = (e: any) => {
            // If already in standalone or user dismissed, ignore
            if (checkStandalone()) return;
            if (localStorage.getItem('bcss_pwa_dismissed') === 'true') return;

            // Browser firing beforeinstallprompt is the source of truth that the app
            // is eligible for installation (clears any stale previous install flag)
            localStorage.removeItem('bcss_pwa_installed');

            e.preventDefault();
            setDeferredPrompt(e);
            setIsVisible(true);
        };

        const installHandler = () => {
            localStorage.setItem('bcss_pwa_installed', 'true');
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
        if (!deferredPrompt) {
            setIsVisible(false);
            return;
        }
        
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`PWA install outcome: ${outcome}`);
        
        if (outcome === 'accepted') {
            localStorage.setItem('bcss_pwa_installed', 'true');
        }
        
        setDeferredPrompt(null);
        setIsVisible(false);
    };

    const handleDismiss = () => {
        localStorage.setItem('bcss_pwa_dismissed', 'true');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <aside className="pwa-banner" aria-label="Install Wildcat Clubs">
            <div className="pwa-banner-logo">
                <img src="/cropped-wildcat-logo.png" alt="Wildcat mascot" />
            </div>
            <div className="pwa-banner-content">
                <div className="pwa-banner-title">
                    Install Wildcat Clubs
                </div>
                <div className="pwa-banner-desc">
                    Fast access right from your home screen.
                </div>
            </div>
            <div className="pwa-banner-actions">
                <button onClick={handleInstallClick} className="pwa-banner-btn-install">
                    <Download size={15} />
                    <span>Install</span>
                </button>
                <button onClick={handleDismiss} className="pwa-banner-btn-dismiss" title="Dismiss" aria-label="Dismiss banner">
                    <X size={17} />
                </button>
            </div>
        </aside>
    );
};
