import { useEffect } from 'react';

export function usePageTitle(title: string) {
    useEffect(() => {
        if (!title) return;
        document.title = title.includes('|') ? title : `${title} | BCSS Calendar`;
    }, [title]);
}
