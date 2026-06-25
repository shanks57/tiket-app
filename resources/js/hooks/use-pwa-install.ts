import { useState, useEffect, useCallback } from 'react';
import { openInstalledPwaApp } from '@/lib/pwa-open';

const PWA_INSTALLED_KEY = 'pwa-installed';

interface InstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface InstalledRelatedApp {
    id: string;
    platform: string;
    url?: string;
}

function isRunningStandalone(): boolean {
    return (
        window.matchMedia('(display-mode: standalone)').matches ||
        window.matchMedia('(display-mode: fullscreen)').matches ||
        (window.navigator as Navigator & { standalone?: boolean }).standalone === true
    );
}

export function usePWAInstall() {
    const [isInstallable, setIsInstallable] = useState(false);
    const [isInstalledOnDevice, setIsInstalledOnDevice] = useState(false);
    const [isRunningInStandalone, setIsRunningInStandalone] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState<InstallPromptEvent | null>(null);

    useEffect(() => {
        if (isRunningStandalone()) {
            setIsRunningInStandalone(true);
            setIsInstalledOnDevice(true);
            return;
        }

        if (localStorage.getItem(PWA_INSTALLED_KEY) === 'true') {
            setIsInstalledOnDevice(true);
        }

        if ('getInstalledRelatedApps' in navigator) {
            (navigator as Navigator & {
                getInstalledRelatedApps: () => Promise<InstalledRelatedApp[]>;
            }).getInstalledRelatedApps().then((apps) => {
                if (apps.length > 0) {
                    setIsInstalledOnDevice(true);
                    localStorage.setItem(PWA_INSTALLED_KEY, 'true');
                }
            });
        }

        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as InstallPromptEvent);
            setIsInstallable(true);
        };

        const handleAppInstalled = () => {
            setIsInstalledOnDevice(true);
            setIsInstallable(false);
            setDeferredPrompt(null);
            localStorage.setItem(PWA_INSTALLED_KEY, 'true');
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const install = async () => {
        if (!deferredPrompt) return;

        try {
            await deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;

            if (outcome === 'accepted') {
                setIsInstallable(false);
                setDeferredPrompt(null);
            }
        } catch (error) {
            console.error('[PWA] Install error:', error);
        }
    };

    const openApp = useCallback(() => {
        openInstalledPwaApp('/');
    }, []);

    return {
        isInstallable,
        isInstalledOnDevice,
        isRunningInStandalone,
        install,
        openApp,
    };
}
