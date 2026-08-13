import { Response } from 'express';

const clients = new Set<Response>();

export const handleSyncStream = (res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    clients.add(res);

    // Initial connection handshake
    res.write(`data: ${JSON.stringify({ type: 'CONNECTED', timestamp: Date.now() })}\n\n`);

    // Keep-alive heartbeat every 20 seconds
    const intervalId = setInterval(() => {
        res.write(`: heartbeat\n\n`);
    }, 20000);

    res.on('close', () => {
        clearInterval(intervalId);
        clients.delete(res);
    });
};

export const broadcastChange = (resource: string = 'all', data?: any) => {
    const payload = JSON.stringify({ type: 'MUTATION', resource, data, timestamp: Date.now() });
    for (const client of clients) {
        try {
            client.write(`data: ${payload}\n\n`);
        } catch {
            clients.delete(client);
        }
    }
};
