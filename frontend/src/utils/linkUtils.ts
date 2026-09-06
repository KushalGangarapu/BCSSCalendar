// Ensure URLs only use safe protocols (prevent javascript:, data:, etc.)
export const isSafeUrl = (url?: string): boolean => {
    if (!url) return false;
    const trimmed = url.trim().toLowerCase();
    return trimmed.startsWith('https://') || trimmed.startsWith('http://') || trimmed.startsWith('mailto:');
};

// Robust Markdown link regex supporting balanced parentheses in URLs (e.g. Wikipedia links)
export const MARKDOWN_LINK_REGEX = /\[([^\]]+)\]\((https?:\/\/[^\s()]+(?:\([^\s()]+\)[^\s()]*)*)\)/g;

// Utility to extract all valid external URLs and Markdown links from text
export const extractLinksFromText = (text?: string | null): Array<{ label: string; url: string }> => {
    if (!text) return [];

    const links: Array<{ label: string; url: string }> = [];
    const seenUrls = new Set<string>();

    // 1. Match Markdown links: [Label](url)
    let match: RegExpExecArray | null;
    const mdRegex = new RegExp(MARKDOWN_LINK_REGEX.source, 'g');
    while ((match = mdRegex.exec(text)) !== null) {
        const label = match[1].trim();
        const url = match[2].trim();
        if (isSafeUrl(url) && !seenUrls.has(url)) {
            seenUrls.add(url);
            links.push({ label: label || 'External Link', url });
        }
    }

    // 2. Match bare URLs: https://... or http://...
    // Replace markdown links with blanks first to avoid duplicating URLs already matched in markdown
    const textWithoutMarkdown = text.replace(new RegExp(MARKDOWN_LINK_REGEX.source, 'g'), '');
    const bareUrlRegex = /(https?:\/\/[^\s<>"']+)/g;
    while ((match = bareUrlRegex.exec(textWithoutMarkdown)) !== null) {
        let url = match[1].trim();
        // Clean trailing sentence punctuation while safely preserving balanced parentheses (e.g. Wikipedia)
        url = url.replace(/[.,;:!?]+$/, '');
        let openCount = (url.match(/\(/g) || []).length;
        let closeCount = (url.match(/\)/g) || []).length;
        while (closeCount > openCount && url.endsWith(')')) {
            url = url.slice(0, -1);
            closeCount--;
            url = url.replace(/[.,;:!?]+$/, '');
        }
        if (isSafeUrl(url) && !seenUrls.has(url)) {
            seenUrls.add(url);
            let displayLabel = 'Open Link';
            try {
                const parsed = new URL(url);
                if (parsed.hostname.includes('forms.gle') || parsed.pathname.includes('/forms/')) {
                    displayLabel = 'Sign-Up Form';
                } else if (parsed.hostname.includes('zoom.us') || parsed.hostname.includes('meet.google.com')) {
                    displayLabel = 'Meeting Link';
                } else if (parsed.hostname.includes('instagram.com')) {
                    displayLabel = 'Instagram';
                } else if (parsed.hostname.includes('discord.')) {
                    displayLabel = 'Discord';
                } else {
                    displayLabel = parsed.hostname.replace(/^www\./, '');
                }
            } catch {
                displayLabel = 'Open Link';
            }
            links.push({ label: displayLabel, url });
        }
    }

    return links;
};
