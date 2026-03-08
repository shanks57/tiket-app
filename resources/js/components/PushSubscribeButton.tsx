import React, { useEffect, useState } from 'react';
import { usePushSubscription } from '@/hooks/use-push-subscription';

export function PushSubscribeButton({ vapidKey }: { vapidKey?: string } = {}) {
    const { supported, isSubscribed, subscribe, unsubscribe } = usePushSubscription();
    const [subscribed, setSubscribed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!supported) return;
        (async () => {
            try {
                setSubscribed(await isSubscribed());
                setError(null);
            } catch (err) {
                console.log(err);
                setError(err instanceof Error ? err.message : 'Error checking subscription');
            }
        })();
    }, [supported, isSubscribed]);

    if (!supported) return <div className="text-sm text-muted">Notifikasi tidak didukung pada peramban ini.</div>;

    if (error) {
        return <div className="text-sm text-red-600">Error: {error}</div>;
    }

    return subscribed ? (
        <button
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-gray-200 dark:border-slate-800 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
            onClick={async () => {
                console.log("unsubscribe");
                try {
                    setLoading(true);
                    await unsubscribe();
                    setSubscribed(false);
                    setError(null);
                } catch (err) {
                    const msg = err instanceof Error ? err.message : 'Error unsubscribing';
                    setError(msg);
                    alert('Gagal menonaktifkan notifikasi: ' + msg);
                } finally {
                    setLoading(false);
                }
            }}
            disabled={loading}
        >
            {loading ? 'Memproses...' : 'Nonaktifkan Notifikasi'}
        </button>
    ) : (
        <button
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700"
            onClick={async () => {
                try {
                    setLoading(true);
                    await subscribe(vapidKey);
                    setSubscribed(true);
                    setError(null);
                } catch (err) {
                    const msg = err instanceof Error ? err.message : 'Error subscribing';
                    setError(msg);
                    alert('Gagal mengaktifkan notifikasi: ' + msg);
                } finally {
                    setLoading(false);
                }
            }}
            disabled={loading}
        >
            {loading ? 'Memproses...' : 'Aktifkan Notifikasi'}
        </button>
    );
}
