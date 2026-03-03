import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import Pagination from '@/components/Pagination';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dasbor', href: '/dashboard' },
    { title: 'Pengguna', href: '/admin/users' },
];

interface User {
    id: number;
    name: string;
    username: string;
    email: string;
    role: string;
    unit: string | null;
}

interface Props {
    users: {
        data: User[];
        links: any[];
    };
    filters: {
        search: string;
    };
}

export default function Index({ users, filters }: Props) {
    const { data, setData, get, processing } = useForm({
        search: filters.search || '',
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        get('/admin/users', {
            preserveState: true,
        });
    };

    const handleDelete = (userId: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) {
            router.delete(`/admin/users/${userId}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Pengguna" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4 pb-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 transition-colors duration-300">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">Manajemen Pengguna</h1>
                    <div className="flex flex-col md:flex-row gap-4">
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <Input
                                placeholder="Cari berdasarkan nama..."
                                value={data.search}
                                onChange={(e) => setData('search', e.target.value)}
                                className="w-full md:w-64 border-indigo-200 dark:border-slate-800 dark:bg-slate-900 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl"
                            />
                            <Button type="submit" disabled={processing} variant="secondary" className="rounded-xl">Cari</Button>
                        </form>
                        <Link href="/admin/users/create">
                            <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-500 dark:to-blue-600 shadow-lg w-full rounded-xl">Tambah Pengguna</Button>
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {users.data.map((user) => (
                        <Card key={user.id} className="border-0 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-800/20 dark:border dark:border-indigo-800/50 shadow-md hover:shadow-xl transition-all duration-300 rounded-2xl group">
                            <CardHeader className="pb-3 text-center md:text-left">
                                <CardTitle className="text-indigo-900 dark:text-indigo-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors uppercase font-black tracking-tight">{user.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-blue-600 dark:text-blue-400">@{user.username}</p>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 truncate">{user.email}</p>
                                </div>
                                <div className="flex gap-2 pt-2 border-t border-indigo-200/50 dark:border-indigo-800/30">
                                    <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase">{user.role}</span>
                                    <span className="px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-600 dark:text-slate-400 text-[10px] font-bold uppercase">UNIT: {user.unit || 'INTERNAL'}</span>
                                </div>
                                <div className="mt-4 flex gap-2">
                                    <Link href={`/admin/users/${user.id}/edit`} className="flex-1">
                                        <Button variant="outline" size="sm" className="w-full border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900 font-bold rounded-xl text-indigo-700 dark:text-indigo-300">Edit</Button>
                                    </Link>
                                    <Button
                                        className="bg-red-500 hover:bg-red-600 dark:bg-red-600/80 dark:hover:bg-red-700 text-white font-bold rounded-xl px-4"
                                        size="sm"
                                        onClick={() => handleDelete(user.id)}
                                    >
                                        Hapus
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Pagination */}
                <Pagination links={users.links} />
            </div>
        </AppLayout>
    );
}