import { useState, useEffect } from 'react';

export const MOBILE_BREAKPOINT = 1200;

export const useIsMobile = (): boolean => {
    const [isMobile, setIsMobile] = useState<boolean>(() =>
        typeof window !== 'undefined' ? window.innerWidth <= MOBILE_BREAKPOINT : false
    );

    useEffect(() => {
        const handler = () => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
        window.addEventListener('resize', handler);
        return () => window.removeEventListener('resize', handler);
    }, []);

    return isMobile;
};
