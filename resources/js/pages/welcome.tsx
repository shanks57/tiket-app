import { dashboard, login } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { PWAInstallButton } from '@/components/pwa-install-button';
import { PushSubscribeButton } from '@/components/PushSubscribeButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Home, FileText, BarChart3, User, Clock, Eye } from 'lucide-react';
import AppLogoIcon from '@/components/app-logo-icon';

interface Ticket {
    id: number;
    ticket_number: string;
    title: string;
    status: string;
    priority: string;
    category: {
        name: string;
    };
    created_at: string;
    updated_at: string;
}

interface Props {
    canRegister?: boolean;
    activeTickets?: Ticket[];
    stats?: {
        total_tickets: number;
        submitted: number;
        done: number;
        pending_response: number;
    };
}

export default function Welcome({
    canRegister = true,
    activeTickets = [],
    stats = { total_tickets: 0, submitted: 0, done: 0, pending_response: 0 },
}: Props) {
    const { auth } = usePage<SharedData>().props;
    const [activeNav, setActiveNav] = useState<'home' | 'update' | 'help' | 'more'>('home');

    // For unauthenticated users, show the landing page
    return (
        <>
            <Head title="Beranda">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700"
                    rel="stylesheet"
                />
                <meta name="description" content="Sederhanakan operasi rumah sakit dengan sistem helpdesk komprehensif kami. Kelola tiket, lacak kemajuan, dan pastikan koordinasi perawatan pasien yang efisien." />
            </Head>

            {/* Navigation */}
            <nav className="fixed top-0 w-full bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm border-b border-gray-200 dark:border-slate-800 z-50 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-2">
                            <AppLogoIcon />
                            <span className="text-xl font-bold text-gray-900 dark:text-white">SIPERKASA</span>
                        </div>

                        <div className="flex items-center space-x-4">
                            <Link
                                href={login()}
                                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                            >
                                Masuk
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 overflow-hidden pt-16">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5 dark:opacity-[0.03]">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }} />
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                    <div className="text-center space-y-8">
                        <div className="space-y-4">
                            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Sistem Informasi Pelaporan
                            </div>
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
                                SIPERKASA
                                <span className="text-blue-600 dark:text-blue-400 block">Sistem Laporan Perbaikan Sarana</span>
                            </h1>
                            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                                Platform terintegrasi untuk manajemen laporan perbaikan sarana rumah sakit. Kelola tiket dengan efisien, koordinasikan tim, dan optimalkan operasional fasilitas kesehatan.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href={login()}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                            >
                                Masuk ke Sistem
                            </Link>
                        </div>
                        <div className="flex gap-4 justify-center flex-wrap">
                            <PWAInstallButton className='h-auto' />
                            <PushSubscribeButton vapidKey={import.meta.env.VITE_VAPID_PUBLIC_KEY} />
                        </div>

                        {/* Features Grid */}
                        <div className="grid md:grid-cols-3 gap-6 mt-16">
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-slate-800 hover:shadow-md transition">
                                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4 mx-auto">
                                    <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Manajemen Laporan</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Buat, lacak, dan kelola laporan perbaikan dengan mudah</p>
                            </div>

                            <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-slate-800 hover:shadow-md transition">
                                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4 mx-auto">
                                    <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Monitoring Status</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Pantau progres perbaikan secara real-time</p>
                            </div>

                            <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-slate-800 hover:shadow-md transition">
                                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4 mx-auto">
                                    <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Koordinasi Tim</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Delegasikan tugas dan kelola tim dengan efisien</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 text-center">
                <div className="max-w-2xl mx-auto px-4">
                    <h2 className="text-3xl font-bold text-white mb-4">Siap mulai melaporkan?</h2>
                    <p className="text-blue-100 dark:text-blue-200 mb-8">Gunakan SIPERKASA untuk melaporkan dan mengelola perbaikan sarana rumah sakit dengan efisien</p>
                    <Link
                        href={login()}
                        className="bg-white dark:bg-slate-100 text-blue-600 hover:bg-gray-50 dark:hover:bg-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 inline-block"
                    >
                        Masuk Sekarang
                    </Link>
                </div>
            </section>
        </>
    );
}
