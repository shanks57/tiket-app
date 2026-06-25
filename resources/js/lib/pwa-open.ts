const PWA_PROTOCOL_URL = 'web+siperkasa://open';

function isAndroid(): boolean {
    return /Android/i.test(navigator.userAgent);
}

function clickTransientLink(href: string, target?: string): void {
    const link = document.createElement('a');
    link.href = href;
    if (target) {
        link.target = target;
        link.rel = 'noopener noreferrer';
    }
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Open the installed PWA from a browser tab.
 *
 * - Android WebAPK: scoped HTTPS links opened via _blank (user gesture) launch the installed app.
 * - Desktop (Windows/macOS/Linux): web+ protocol handler registered by the installed PWA.
 */
export function openInstalledPwaApp(startPath = '/'): void {
    const startUrl = new URL(startPath, window.location.origin).href;

    if (isAndroid()) {
        clickTransientLink(startUrl, '_blank');
        return;
    }

    clickTransientLink(PWA_PROTOCOL_URL);
}
