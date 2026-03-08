import { requestForToken, deleteAppToken } from '@/lib/firebase';

export function usePushSubscription() {
    const supported = typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window;

    async function isSubscribed() {
        if (!supported) return false;

        const permission = Notification.permission;
        if (permission !== 'granted') return false;

        // Check localStorage to see if user previously opted in on this browser
        return localStorage.getItem('push_enabled') === 'true';
    }

    async function subscribe(vapidKey?: string) {
        if (!supported) throw new Error('Notifikasi tidak didukung di peramban ini.');

        console.log('[PUSH] Starting subscription process...');
        const token = await requestForToken(vapidKey);

        if (!token) {
            console.error('[PUSH] Failed to get FCM token');
            throw new Error('Gagal mendapatkan token notifikasi. Pastikan izin diberikan.');
        }

        const csrfMeta = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null;
        const csrf = csrfMeta?.content;
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        };
        if (csrf) headers['X-CSRF-TOKEN'] = csrf;

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

            localStorage.setItem('push_enabled', 'true');
            console.log('[PUSH] Device registered successfully');
            return token;
        } catch (err) {
            console.error('[PUSH] Error during backend registration:', err);
            throw err;
        }
    }

    async function unsubscribe() {
        if (!supported) return;

        try {
            // 1. Get current token to notify backend
            const token = await requestForToken();

            if (token) {
                const csrfMeta = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null;
                const csrf = csrfMeta?.content;
                const headers: Record<string, string> = {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                };
                if (csrf) headers['X-CSRF-TOKEN'] = csrf;

                // 2. Notify backend to unregister
                await fetch('/mobile/devices/unregister', {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers,
                    body: JSON.stringify({ token: token }),
                });
            }

            // 3. Deactivate on client-side (revoke token and clear storage)
            await deleteAppToken();
            localStorage.removeItem('push_enabled');

            console.log('[PUSH] Unsubscribed successfully');
        } catch (err) {
            console.error('[PUSH] Error during unsubscription:', err);
            // Even if backend fails, we should clear local state
            localStorage.removeItem('push_enabled');
        }
    }

    return { supported, isSubscribed, subscribe, unsubscribe };
}
