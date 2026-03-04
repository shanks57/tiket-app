import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import { send } from '@/routes/verification';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Form, Head, Link, router, usePage } from '@inertiajs/react';

import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { logout } from '@/routes';
import { edit } from '@/routes/profile';
import { LogOut } from 'lucide-react';
import { PushSubscribeButton } from '@/components/PushSubscribeButton';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: edit().url,
    },
];

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth } = usePage<SharedData>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />

            <SettingsLayout>
                <div className="space-y-6 bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-slate-950 dark:via-blue-950/30 dark:to-cyan-950 p-6 rounded-xl transition-colors duration-300">
                    <HeadingSmall
                        title="Informasi Profil"
                        description="Perbarui nama dan alamat email Anda"
                    />

                    <Form
                        {...ProfileController.update.form()}
                        options={{
                            preserveScroll: true,
                        }}
                        className="space-y-6 bg-gradient-to-br from-white to-blue-50 dark:from-slate-900 dark:to-slate-800 p-6 rounded-xl border border-blue-100 dark:border-slate-800 shadow-md"
                    >
                        {({ processing, recentlySuccessful, errors }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="name" className="text-blue-900 dark:text-blue-100 font-semibold">Nama Lengkap</Label>

                                    <Input
                                        id="name"
                                        className="mt-1 block w-full border-blue-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-900 dark:text-slate-100"
                                        defaultValue={auth.user.name}
                                        name="name"
                                        required
                                        autoComplete="name"
                                        placeholder="Nama Lengkap"
                                    />

                                    <InputError
                                        className="mt-2"
                                        message={errors.name}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email" className="text-blue-900 dark:text-blue-100 font-semibold">Alamat Email</Label>

                                    <Input
                                        id="email"
                                        type="email"
                                        className="mt-1 block w-full border-blue-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-900 dark:text-slate-100"
                                        defaultValue={auth.user.email}
                                        name="email"
                                        required
                                        autoComplete="username"
                                        placeholder="Alamat Email"
                                    />

                                    <InputError
                                        className="mt-2"
                                        message={errors.email}
                                    />
                                </div>

                                {mustVerifyEmail &&
                                    auth.user.email_verified_at === null && (
                                        <div>
                                            <p className="-mt-4 text-sm text-muted-foreground">
                                                Your email address is
                                                unverified.{' '}
                                                <Link
                                                    href={send()}
                                                    as="button"
                                                    className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                                >
                                                    Click here to resend the
                                                    verification email.
                                                </Link>
                                            </p>

                                            {status ===
                                                'verification-link-sent' && (
                                                    <div className="mt-2 text-sm font-medium text-green-600">
                                                        A new verification link has
                                                        been sent to your email
                                                        address.
                                                    </div>
                                                )}
                                        </div>
                                    )}

                                <div className="flex items-center gap-4">
                                    <Button
                                        disabled={processing}
                                        data-test="update-profile-button"
                                    >
                                        Save
                                    </Button>

                                    <Transition
                                        show={recentlySuccessful}
                                        enter="transition ease-in-out"
                                        enterFrom="opacity-0"
                                        leave="transition ease-in-out"
                                        leaveTo="opacity-0"
                                    >
                                        <p className="text-sm text-neutral-600">
                                            Saved
                                        </p>
                                    </Transition>
                                </div>
                            </>
                        )}
                    </Form>
                </div>

                <div className="space-y-6 mt-6 bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 dark:from-slate-950 dark:via-blue-950/30 dark:to-emerald-950 p-6 rounded-xl transition-colors duration-300">
                    <HeadingSmall
                        title="Notifikasi Web"
                        description="Aktifkan notifikasi untuk mendapatkan info terbaru tentang tiket Anda"
                    />
                    <div className="bg-white/60 dark:bg-slate-900/60 p-6 rounded-xl border border-blue-100 dark:border-slate-800 shadow-sm">
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                            Dapatkan notifikasi real-time saat ada pembaruan pada tiket yang Anda buat atau tugaskan.
                        </p>
                        <PushSubscribeButton />
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 bg-red-50/50 dark:bg-red-950/10 rounded-2xl border border-red-100 dark:border-red-900/20 transition-all duration-300">
                        <div className="space-y-1">
                            <h3 className="text-sm font-black text-red-900 dark:text-red-100 uppercase tracking-tight">Sesi Akun</h3>
                            <p className="text-xs text-red-700/70 dark:text-red-400/70 font-medium italic">Keluar dari akun Anda untuk mengakhiri sesi aktif pada perangkat ini.</p>
                        </div>
                        <Link
                            href={logout().url}
                            method="post"
                            as="button"
                            onClick={() => router.clearHistory()}
                            className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 font-black rounded-xl text-xs uppercase tracking-widest hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white transition-all duration-300 shadow-sm border border-red-100 dark:border-red-900/30 group"
                        >
                            <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                            Keluar Sekarang
                        </Link>
                    </div>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
