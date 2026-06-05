<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark'=> ($appearance ?? 'system') == 'dark'])>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    {{-- Inline script to detect system dark mode preference and apply it immediately --}}
    <script>
        (function() {
            const appearance = '{{ $appearance ?? "system" }}';

            if (appearance === 'system') {
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                if (prefersDark) {
                    document.documentElement.classList.add('dark');
                }
            }
        })();
    </script>

    {{-- Inline style to set the HTML background color based on our theme in app.css --}}
    <style>
        html {
            background-color: oklch(1 0 0);
        }

        html.dark {
            background-color: oklch(0.145 0 0);
        }
    </style>

    <title inertia>{{ config('app.name', 'SIPERKASA') }}</title>
    <meta name="description" content="SIPERKASA - Sistem Laporan Perbaikan Sarana Rumah Sakit. Kelola tiket, lacak kemajuan, dan pastikan koordinasi perawatan sarana rumah sakit yang efisien.">
    <meta name="application-name" content="{{ config('app.name', 'SIPERKASA') }}">
    <meta property="og:site_name" content="{{ config('app.name', 'SIPERKASA') }}">
    <meta property="og:type" content="website">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <link rel="icon" href="/favicon.png" sizes="any">
    <link rel="icon" href="/favicon.png" type="image/svg+xml">
    <link rel="apple-touch-icon" href="/apple-touch-icon.png">

    {{-- PWA Manifest --}}
    <link rel="manifest" href="/site.webmanifest">
    <meta name="theme-color" content="#2563eb">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="default">
    <meta name="apple-mobile-web-app-title" content="{{ config('app.name', 'SIPERKASA') }}">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="msapplication-TileColor" content="#2563eb">
    <meta name="msapplication-config" content="/browserconfig.xml">

    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />

    @viteReactRefresh
    @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
    @inertiaHead
</head>

<body class="font-sans antialiased">
    @inertia

    {{-- PWA Service Worker Registration --}}
    <script>
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                        console.log('[SW] Registered successfully:', registration.scope);

                        // Check for updates
                        registration.addEventListener('updatefound', function() {
                            const newWorker = registration.installing;
                            newWorker.addEventListener('statechange', function() {
                                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    // New version available
                                    if (confirm('Versi baru aplikasi tersedia. Perbarui sekarang?')) {
                                        newWorker.postMessage({
                                            action: 'skipWaiting'
                                        });
                                        window.location.reload();
                                    }
                                }
                            });
                        });
                    })
                    .catch(function(error) {
                        console.log('[SW] Registration failed:', error);
                    });
            });

            // Listen for service worker updates
            navigator.serviceWorker.addEventListener('controllerchange', function() {
                window.location.reload();
            });
        }

        // Handle PWA install prompt
        let deferredPrompt;
        window.addEventListener('beforeinstallprompt', function(e) {
            console.log('[PWA] Install prompt triggered');
            e.preventDefault();
            deferredPrompt = e;

            // Show custom install button or notification
            // You can dispatch a custom event to show install UI
            window.dispatchEvent(new CustomEvent('pwa-installable'));
        });

        // Function to trigger install
        window.installPWA = function() {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then(function(choiceResult) {
                    console.log('[PWA] User choice:', choiceResult.outcome);
                    deferredPrompt = null;
                });
            }
        };

        // Handle successful installation
        window.addEventListener('appinstalled', function(evt) {
            console.log('[PWA] App installed successfully');
            // You can hide install UI here
        });
    </script>
</body>

</html>