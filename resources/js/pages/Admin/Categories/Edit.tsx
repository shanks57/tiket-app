import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { toast } from 'sonner';

interface Subcategory {
    id: number;
    name: string;
    description?: string;
}

interface Category {
    id: number;
    name: string;
    description?: string;
    subcategories: Subcategory[];
}

interface Props {
    category: Category;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dasbor', href: '/dashboard' },
    { title: 'Kategori', href: '/admin/categories' },
    { title: 'Edit', href: '' },
];

export default function Edit({ category }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: category.name,
        description: category.description || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/categories/${category.id}`, {
            onSuccess: () => {
                toast.success('Kategori berhasil diperbarui!');
            },
            onError: () => {
                toast.error('Gagal memperbarui kategori.');
            }
        });
    };

    const handleDeleteSubcategory = (subcategoryId: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus subkategori ini?')) {
            router.delete(`/admin/subcategories/${subcategoryId}`, {
                onSuccess: () => {
                    toast.success('Subkategori berhasil dihapus!');
                },
                onError: () => {
                    toast.error('Gagal menghapus subkategori.');
                }
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Kategori: ${category.name}`} />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl px-4 pt-4 pb-20   md:p-4 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950/30 dark:to-indigo-950 transition-colors duration-300">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">Edit Kategori</h1>
                    <p className="text-muted-foreground text-sm dark:text-gray-400">Perbarui rincian kategori tiket "{category.name}"</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-gradient-to-br from-white to-blue-50 dark:from-slate-900 dark:to-slate-800 p-8 rounded-2xl shadow-xl dark:shadow-blue-900/10 max-w-2xl space-y-6 border border-blue-100 dark:border-slate-800 mb-8">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-blue-900 dark:text-blue-100 font-bold uppercase text-[10px] tracking-widest pl-1">Nama Kategori</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                            className="h-12 border-blue-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-950 rounded-xl"
                        />
                        {errors.name && <p className="text-red-500 text-[10px] sm:text-xs mt-1 font-bold italic uppercase pl-1">{errors.name}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-blue-900 dark:text-blue-100 font-bold uppercase text-[10px] tracking-widest pl-1">Deskripsi</Label>
                        <Textarea
                            id="description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            className="min-h-[120px] border-blue-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-950 rounded-xl resize-none"
                        />
                        {errors.description && <p className="text-red-500 text-[10px] sm:text-xs mt-1 font-bold italic uppercase pl-1">{errors.description}</p>}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <Button type="submit" disabled={processing} className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-500 dark:to-blue-600 shadow-lg shadow-blue-500/20 text-white font-black h-12 rounded-xl text-sm uppercase tracking-wider">
                            {processing ? 'Memperbarui...' : 'Simpan Perubahan'}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 h-12 rounded-xl font-bold uppercase text-xs tracking-widest"
                            onClick={() => window.history.back()}
                        >
                            Batal
                        </Button>
                    </div>
                </form>

                {/* Subcategories Section */}
                {category.subcategories && category.subcategories.length > 0 && (
                    <div className="mt-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 uppercase tracking-tight">Subkategori</h2>
                            <Link href="/admin/subcategories/create">
                                <Button className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-bold rounded-xl h-10 px-6 text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/20">Tambah Subkategori</Button>
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                            {category.subcategories.map((subcategory) => (
                                <Card key={subcategory.id} className="border-0 bg-gradient-to-br from-white to-emerald-50 dark:from-slate-900 dark:to-emerald-900/10 dark:border dark:border-emerald-800/30 shadow-xl overflow-hidden group">
                                    <CardHeader className="border-b border-emerald-50 dark:border-emerald-900/30 bg-white/40 dark:bg-slate-800/40">
                                        <CardTitle className="text-lg text-emerald-900 dark:text-emerald-100 font-bold">{subcategory.name}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-5">
                                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 italic leading-relaxed">{subcategory.description || 'Tidak ada deskripsi'}</p>
                                        <div className="flex gap-2">
                                            <Link href={`/admin/subcategories/${subcategory.id}/edit`} className="flex-1">
                                                <Button variant="outline" size="sm" className="w-full border-emerald-200 dark:border-emerald-800/50 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 font-bold rounded-lg h-9 text-xs">Edit</Button>
                                            </Link>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                className="flex-1 font-bold rounded-lg h-9 shadow-lg shadow-red-500/20 text-xs"
                                                onClick={() => handleDeleteSubcategory(subcategory.id)}
                                            >
                                                Hapus
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {(!category.subcategories || category.subcategories.length === 0) && (
                    <Link href="/admin/subcategories/create" className="w-full sm:w-auto">
                        <Button className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 dark:from-emerald-500 dark:to-emerald-600 shadow-xl rounded-xl font-bold uppercase tracking-widest text-xs h-12 px-8">Tambah Subkategori Pertama</Button>
                    </Link>
                )}
            </div>
        </AppLayout>
    );
}
