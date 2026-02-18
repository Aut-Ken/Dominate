import { useEffect, useRef, useCallback, useState } from 'react';

interface WSMessage {
    event: string;
    payload: any;
    userId?: string;
}

type WSEventHandler = (payload: any) => void;

const WS_URL = 'ws://localhost:8080/ws';

export function useWebSocket(userId: string | null) {
    const wsRef = useRef<WebSocket | null>(null);
    const handlersRef = useRef<Map<string, Set<WSEventHandler>>>(new Map());
    const [connected, setConnected] = useState(false);
    const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const connect = useCallback(() => {
        if (!userId) return;

        const ws = new WebSocket(`${WS_URL}?user_id=${userId}`);

        ws.onopen = () => {
            console.log('[WS] Connected');
            setConnected(true);
        };

        ws.onmessage = (event) => {
            try {
                const msg: WSMessage = JSON.parse(event.data);
                const handlers = handlersRef.current.get(msg.event);
                if (handlers) {
                    handlers.forEach(handler => handler(msg.payload));
                }
            } catch (e) {
                console.warn('[WS] Failed to parse message:', e);
            }
        };

        ws.onclose = () => {
            console.log('[WS] Disconnected, reconnecting in 3s...');
            setConnected(false);
            reconnectTimer.current = setTimeout(connect, 3000);
        };

        ws.onerror = (err) => {
            console.error('[WS] Error:', err);
            ws.close();
        };

        wsRef.current = ws;
    }, [userId]);

    useEffect(() => {
        connect();
        return () => {
            if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
            if (wsRef.current) {
                wsRef.current.onclose = null; // prevent reconnect on unmount
                wsRef.current.close();
            }
        };
    }, [connect]);

    const on = useCallback((event: string, handler: WSEventHandler) => {
        if (!handlersRef.current.has(event)) {
            handlersRef.current.set(event, new Set());
        }
        handlersRef.current.get(event)!.add(handler);
        return () => {
            handlersRef.current.get(event)?.delete(handler);
        };
    }, []);

    return { connected, on };
}
