import { requestForToken } from '@/lib/firebase';

export function usePushSubscription() {
    const supported = typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window;

    async function isSubscribed() {
        if (!supported) return false;

        // Check if we have a token in local storage or if permission is granted
        const permission = Notification.permission;
        if (permission !== 'granted') return false;

        // Note: For FCM, we typically check if the user has a token registered in the backend
        // For simplicity on the client-side, we can check if it's already in the browser's indexedDB via Firebase,
        // but checking permission is usually enough for the UI toggle.
        return permission === 'granted';
    }

    async function subscribe(vapidKey?: string) {
        if (!supported) throw new Error('Notifikasi tidak didukung di peramban ini.');

        console.log('[PUSH] Starting subscription process...');
        const token = await requestForToken(vapidKey);

        if (!token) {
            console.error('[PUSH] Failed to get FCM token');
            throw new Error('Gagal mendapatkan token notifikasi. Pastikan izin diberikan.');
        }

        console.log('[PUSH] Got FCM token:', token.substring(0, 20) + '...');

        const csrfMeta = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null;
        const csrf = csrfMeta?.content;
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (csrf) headers['X-CSRF-TOKEN'] = csrf;

        console.log('[PUSH] Sending token to backend...');

        try {
            const response = await fetch('/mobile/devices', {
                method: 'POST',
                credentials: 'same-origin',
                headers,
                body: JSON.stringify({
                    token: token,
                    platform: 'web',
                    app_version: '1.0.0'
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                console.error('[PUSH] Backend registration failed:', result);
                throw new Error(result.message || 'Gagal mendaftarkan perangkat ke server.');
            }

            console.log('[PUSH] Device registered successfully:', result);
            return token;
        } catch (err) {
            console.error('[PUSH] Error during backend registration:', err);
            throw err;
        }
    }

    async function unsubscribe() {
        if (!supported) return;

        // For FCM, we should get the token again to unregister it from the backend
        const token = await requestForToken();
        if (!token) return;

        const csrfMeta2 = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null;
        const csrf2 = csrfMeta2?.content;
        const headers2: Record<string, string> = { 'Content-Type': 'application/json' };
        if (csrf2) headers2['X-CSRF-TOKEN'] = csrf2;

        await fetch('/mobile/devices/unregister', {
            method: 'POST',
            credentials: 'same-origin',
            headers: headers2,
            body: JSON.stringify({ token: token }),
        });
    }

    return { supported, isSubscribed, subscribe, unsubscribe };
}
