import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Head, Link, router } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dasbor', href: '/dashboard' },
    { title: 'Kategori', href: '/admin/categories' },
];

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
    categories: {
        data: Category[];
        links: any[];
    };
}

export default function Index({ categories }: Props) {
    const handleDelete = (categoryId: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus kategori ini? Subkategori terkait juga akan dihapus.')) {
            router.delete(`/admin/categories/${categoryId}`, {
                onSuccess: () => {
                    toast.success('Kategori berhasil dihapus!');
                },
                onError: () => {
                    toast.error('Gagal menghapus kategori.');
                }
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kategori Tiket" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl px-4 pt-4 pb-20   md:p-4 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950/30 dark:to-indigo-950 transition-colors duration-300">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">Kategori Tiket</h1>
                        <p className="text-muted-foreground text-sm md:text-base dark:text-gray-400">Kelola kategori dan subkategori untuk pengorganisasian tiket yang lebih baik.</p>
                    </div>
                    <Link href="/admin/categories/create" className="w-full sm:w-auto">
                        <Button className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-500 dark:to-indigo-600 shadow-xl rounded-xl font-bold">Buat Kategori</Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {categories.data.map((category) => (
                        <Card key={category.id} className="border-0 bg-gradient-to-br from-white to-blue-50 dark:from-slate-900 dark:to-slate-800 dark:border dark:border-slate-800 shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-300 pt-0">
                            <CardHeader className="border-b py-6 border-blue-50 dark:border-slate-700/50 bg-white/40 dark:bg-slate-800/40">
                                <CardTitle className="text-blue-900 dark:text-blue-100 font-black tracking-tight">{category.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="p-5">
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 min-h-[40px] leading-relaxed italic border-l-4 border-blue-500 pl-3">
                                    {category.description || 'Tidak ada deskripsi'}
                                </p>

                                {category.subcategories && category.subcategories.length > 0 && (
                                    <div className="mb-6 p-4 bg-blue-50/50 dark:bg-slate-950/40 rounded-xl border border-blue-100/50 dark:border-slate-800/50">
                                        <h4 className="text-xs font-black text-blue-800 dark:text-blue-300 mb-3 uppercase tracking-widest flex items-center justify-between">
                                            Subkategori
                                            <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full text-[10px]">{category.subcategories.length}</span>
                                        </h4>
                                        <ul className="space-y-2">
                                            {category.subcategories.slice(0, 3).map((sub) => (
                                                <li key={sub.id} className="text-sm text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                    <div className="h-1 w-1 rounded-full bg-blue-400" />
                                                    {sub.name}
                                                </li>
                                            ))}
                                            {category.subcategories.length > 3 && (
                                                <li className="text-xs text-slate-400 dark:text-slate-500 font-bold mt-2 pl-3">
                                                    + {category.subcategories.length - 3} lainnya
                                                </li>
                                            )}
                                        </ul>
                                    </div>
                                )}

                                <div className="mt-4 flex flex-col sm:flex-row gap-2">
                                    <div className="flex gap-2 flex-1">
                                        <Link href={`/admin/categories/${category.id}/technicians`} className="flex-1">
                                            <Button variant="secondary" size="sm" className="w-full font-bold h-9 rounded-lg dark:bg-slate-700 dark:hover:bg-slate-600 text-xs">Teknisi</Button>
                                        </Link>
                                        <Link href={`/admin/categories/${category.id}/edit`} className="flex-1">
                                            <Button variant="outline" size="sm" className="w-full border-blue-200 dark:border-slate-700 font-bold h-9 rounded-lg text-xs">Edit</Button>
                                        </Link>
                                    </div>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        className="font-bold h-9 rounded-lg shadow-lg shadow-red-500/20 text-xs"
                                        onClick={() => handleDelete(category.id)}
                                    >
                                        Hapus
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {categories.data.length === 0 && (
                    <div className="text-center py-20 bg-white/40 dark:bg-slate-900/40 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                        <p className="text-slate-500 dark:text-slate-400 mb-4 font-medium">Tidak ada kategori ditemukan.</p>
                        <Link href="/admin/categories/create">
                            <Button className="bg-blue-600 hover:bg-blue-700 rounded-xl font-bold">Buat Kategori Baru</Button>
                        </Link>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
