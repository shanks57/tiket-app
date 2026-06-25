import { Button } from '@/components/ui/button';
import { Download, ExternalLink, Smartphone } from 'lucide-react';
import { usePWAInstall } from '@/hooks/use-pwa-install';

interface PWAInstallButtonProps {
    variant?: 'default' | 'outline' | 'secondary';
    size?: 'default' | 'sm' | 'lg';
    className?: string;
}

export function PWAInstallButton({
    variant = 'default',
    size = 'default',
    className = ''
}: PWAInstallButtonProps) {
    const {
        isInstallable,
        isInstalledOnDevice,
        isRunningInStandalone,
        install,
        openApp,
    } = usePWAInstall();


    console.log('isRunningInStandalone', isRunningInStandalone);
    console.log('isInstalledOnDevice', isInstalledOnDevice);
    console.log('isInstallable', isInstallable);
    console.log('install function', install);
    console.log('openApp function', openApp);

    if (isRunningInStandalone) {
        return null;
    }

    if (isInstalledOnDevice) {
        return (
            <Button
                variant={variant}
                size={size}
                onClick={openApp}
                className={`flex items-center gap-2 ${className}`}
            >
                <Smartphone className="w-4 h-4" />
                <ExternalLink className="w-4 h-4" />
                <span className="hidden sm:inline">Buka Aplikasi</span>
                <span className="sm:hidden">Buka Aplikasi</span>
            </Button>
        );
    }

    if (!isInstallable) {
        return null;
    }

    return (
        <Button
            variant={variant}
            size={size}
            onClick={install}
            className={`flex items-center gap-2 ${className}`}
        >
            <Smartphone className="w-4 h-4" />
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Instal Aplikasi</span>
            <span className="sm:hidden">Instal Aplikasi Mobile</span>
        </Button>
    );
}
