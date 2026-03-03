import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

export default function Dashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-slate-950 dark:via-blue-950/20 dark:to-slate-950 p-6 pb-20 rounded-xl border dark:border-slate-800">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent mb-6">Dashboard</h1>
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <div className="relative aspect-video overflow-hidden rounded-xl border-2 border-blue-200 dark:border-blue-900 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/40 dark:to-cyan-950/40 shadow-md">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-blue-300/30 dark:stroke-blue-400/10" />
                    </div>
                    <div className="relative aspect-video overflow-hidden rounded-xl border-2 border-indigo-200 dark:border-indigo-900 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 shadow-md">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-indigo-300/30 dark:stroke-indigo-400/10" />
                    </div>
                    <div className="relative aspect-video overflow-hidden rounded-xl border-2 border-emerald-200 dark:border-emerald-900 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 shadow-md">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-emerald-300/30 dark:stroke-emerald-400/10" />
                    </div>
                </div>
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border-2 border-blue-200 dark:border-blue-900 bg-gradient-to-br from-white to-blue-50 dark:from-slate-900 dark:to-blue-950/20 md:min-h-min shadow-lg mt-4">
                    <PlaceholderPattern className="absolute inset-0 size-full stroke-blue-300/20 dark:stroke-blue-400/5" />
                </div>
            </div>
        </AppLayout>
    );
}
