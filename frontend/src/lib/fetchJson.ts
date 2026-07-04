const API_URL = import.meta.env.VITE_API_URL;

export interface FetchJsonOptions extends Omit<RequestInit, 'body'> {
    body?: unknown;
    toastOnError?: (message: string) => void;
}

const buildUrl = (path: string): string => {
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `${API_URL}${path.startsWith('/api') ? path : `/api/${path.replace(/^\//, '')}`}`;
};

export const fetchJson = async <T = unknown>(
    path: string,
    options: FetchJsonOptions = {}
): Promise<T | null> => {
    const { body, headers, toastOnError, ...rest } = options;

    const init: RequestInit = {
        credentials: 'include',
        ...rest,
        headers: {
            ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
            ...headers,
        },
        ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    };

    try {
        const res = await fetch(buildUrl(path), init);
        if (!res.ok) {
            let message = `Request failed (${res.status})`;
            try {
                const errData = await res.json();
                if (errData?.error) message = errData.error;
            } catch {
                /* response wasn't JSON; keep default message */
            }
            toastOnError?.(message);
            return null;
        }
        return (await res.json()) as T;
    } catch (err) {
        console.error(err);
        toastOnError?.('Network error');
        return null;
    }
};
