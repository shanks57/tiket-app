import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Head, router, useForm } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dasbor', href: '/dashboard' },
    { title: 'Pengguna', href: '/admin/users' },
    { title: 'Buat', href: '/admin/users/create' },
];

interface Category {
    id: number;
    name: string;
}

export default function Create({ categories }: { categories: Category[] }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        nip: '',
        username: '',
        email: '',
        password: '',
        role: 'user',
        unit: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/users', {
            onSuccess: () => {
                toast.success('Pengguna berhasil ditambahkan!');
            },
            onError: () => {
                toast.error('Gagal menambahkan pengguna. Silakan periksa kembali data yang diinput.');
            }
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tambah Pengguna" />
            <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 pt-4 px-4 pb-20   md:p-4 rounded-xl transition-colors duration-300">
                <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent mb-6">Tambah Pengguna</h1>

                <form onSubmit={handleSubmit} autoComplete="off" className="bg-gradient-to-br from-white to-blue-50 dark:from-slate-900 dark:to-slate-800 p-8 rounded-2xl shadow-xl dark:border dark:border-slate-800 max-w-2xl space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-blue-900 dark:text-blue-200 font-bold text-xs uppercase tracking-wider">Nama Lengkap</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                            autoComplete="off"
                            className="border-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 focus:border-blue-500 focus:ring-blue-500 h-11 rounded-xl shadow-sm"
                        />
                        {errors.name && <p className="text-red-500 text-[11px] font-bold mt-1 uppercase tracking-tighter">{errors.name}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="nip" className="text-blue-900 dark:text-blue-200 font-bold text-xs uppercase tracking-wider">NIP (Opsional)</Label>
                        <Input
                            id="nip"
                            value={data.nip}
                            onChange={(e) => setData('nip', e.target.value)}
                            placeholder="Contoh: 19950227 202504 1 002"
                            className="border-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 focus:border-blue-500 focus:ring-blue-500 h-11 rounded-xl shadow-sm"
                        />
                        {errors.nip && <p className="text-red-500 text-[11px] font-bold mt-1 uppercase tracking-tighter">{errors.nip}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="username" className="text-blue-900 dark:text-blue-200 font-bold text-xs uppercase tracking-wider">Username Pengguna</Label>
                        <Input
                            id="username"
                            value={data.username}
                            onChange={(e) => setData('username', e.target.value)}
                            required
                            autoComplete="off"
                            className="border-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 focus:border-blue-500 focus:ring-blue-500 h-11 rounded-xl shadow-sm"
                        />
                        {errors.username && <p className="text-red-500 text-[11px] font-bold mt-1 uppercase tracking-tighter">{errors.username}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-blue-900 dark:text-blue-200 font-bold text-xs uppercase tracking-wider">Alamat Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            autoComplete="off"
                            className="border-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 focus:border-blue-500 focus:ring-blue-500 h-11 rounded-xl shadow-sm"
                        />
                        {errors.email && <p className="text-red-500 text-[11px] font-bold mt-1 uppercase tracking-tighter">{errors.email}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-blue-900 dark:text-blue-200 font-bold text-xs uppercase tracking-wider">Kata Laluan</Label>
                        <Input
                            id="password"
                            type="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            required
                            autoComplete="new-password"
                            className="border-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 focus:border-blue-500 focus:ring-blue-500 h-11 rounded-xl shadow-sm"
                        />
                        {errors.password && <p className="text-red-500 text-[11px] font-bold mt-1 uppercase tracking-tighter">{errors.password}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="role" className="text-blue-900 dark:text-blue-200 font-bold text-xs uppercase tracking-wider">Akses Peran</Label>
                        <Select value={data.role} onValueChange={(value) => setData('role', value)}>
                            <SelectTrigger className="border-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 h-11 rounded-xl shadow-sm">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="dark:bg-slate-900 dark:border-slate-800">
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="technician">Teknisi</SelectItem>
                                <SelectItem value="user">User</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.role && <p className="text-red-500 text-[11px] font-bold mt-1 uppercase tracking-tighter">{errors.role}</p>}
                    </div>

                    {data.role === 'technician' && (
                        <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                            <Label htmlFor="unit" className="text-blue-900 dark:text-blue-200 font-bold text-xs uppercase tracking-wider">Unit Kerja</Label>
                            <Select value={data.unit} onValueChange={(value) => setData('unit', value)}>
                                <SelectTrigger className="border-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 h-11 rounded-xl shadow-sm">
                                    <SelectValue placeholder="Pilih Unit" />
                                </SelectTrigger>
                                <SelectContent className="dark:bg-slate-900 dark:border-slate-800">
                                    {categories.map((category) => (
                                        <SelectItem key={category.id} value={category.name}>
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.unit && <p className="text-red-500 text-[11px] font-bold mt-1 uppercase tracking-tighter">{errors.unit}</p>}
                        </div>
                    )}

                    <Button type="submit" disabled={processing} className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 hover:from-blue-700 hover:to-indigo-700 text-white font-black uppercase tracking-widest rounded-xl shadow-xl transition-all duration-300 transform active:scale-95">
                        {processing ? 'Menyimpan...' : 'Tambah Pengguna'}
                    </Button>
                </form>
            </div>
        </AppLayout>
    );
}