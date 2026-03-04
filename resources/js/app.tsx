import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';
import { onMessageListener } from './lib/firebase';
import { toast } from 'sonner';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';
const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;

// Expose VAPID key to window for use in components
if (vapidPublicKey) {
    (window as any).VAPID_PUBLIC_KEY = vapidPublicKey;
}

createInertiaApp({
    title: (title) => (title ? `${appName} | ${title}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob('./pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <StrictMode>
                <App {...props} />
            </StrictMode>,
        );

        // Register service worker for PWA (works on localhost & production)
        initializeServiceWorker();

        // Handle foreground messages from FCM
        onMessageListener().then((payload: any) => {
            console.log('[APP] Foreground message received:', payload);
            if (payload.notification) {
                toast.success(payload.notification.title, {
                    description: payload.notification.body,
                    action: payload.data?.url ? {
                        label: 'Lihat',
                        onClick: () => window.location.href = payload.data.url
                    } : undefined,
                    duration: 8000
                });
            }
        });

        // Set light/dark mode on load
        initializeTheme();
    },
    progress: {
        color: '#4B5563',
    },
});

/**
 * Initialize and manage service worker registration
 */
async function initializeServiceWorker() {
    try {
        if (!('serviceWorker' in navigator)) {
            console.debug('[APP] Service Workers not supported');
            return;
        }

        const isProd = import.meta.env.PROD;
        const isLocalhost = window.location.hostname === 'localhost';

        if (!isProd && !isLocalhost) {
            console.debug('[APP] Not registering SW - not production or localhost');
            return;
        }

        // Register the service worker
        const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
        });

        console.log('[APP] Service Worker registered successfully', registration);

        // Listen for the "controllerchange" event, which fires when a new service worker
        // takes over. This allows us to reload the page and ensure the user is
        // always seeing the latest version.
        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (refreshing) return;
            refreshing = true;
            console.log('[APP] New Service Worker version detected. Reloading for latest updates...');
            window.location.reload();
        });

        // Listen for updates
        registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (!newWorker) return;

            newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // New service worker is ready to activate
                    console.log('[APP] New version ready. It will activate and reload automatically.');
                }
            });
        });

        // Check for updates periodically
        setInterval(() => {
            registration.update().catch(() => {
                /* ignore update check errors */
            });
        }, 60000); // Check every minute

    } catch (error) {
        console.error('[APP] Service Worker registration failed:', error);
    }
}
