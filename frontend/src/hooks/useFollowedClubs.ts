import { useState, useCallback } from 'react';

const STORAGE_KEY = 'bcss_followed_clubs';

const readFollowed = (): string[] => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY) || '[]';
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

const writeFollowed = (ids: string[]): void => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
};

export const useFollowedClubs = () => {
    const [followedClubIds, setFollowedClubIds] = useState<string[]>(readFollowed);

    const refresh = useCallback((): void => {
        setFollowedClubIds(readFollowed());
    }, []);

    const isFollowed = useCallback(
        (clubId: string | undefined): boolean =>
            Boolean(clubId && followedClubIds.includes(clubId)),
        [followedClubIds]
    );

    const toggleFollow = useCallback((clubId: string): boolean => {
        const prev = readFollowed();
        const isCurrentlyFollowing = prev.includes(clubId);
        const next = isCurrentlyFollowing
            ? prev.filter(id => id !== clubId)
            : [...prev, clubId];
        writeFollowed(next);
        setFollowedClubIds(next);
        return !isCurrentlyFollowing;
    }, []);

    return { followedClubIds, isFollowed, toggleFollow, refresh };
};
