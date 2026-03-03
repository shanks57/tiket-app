import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import Pagination from '@/components/Pagination';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dasbor', href: '/dashboard' },
    { title: 'Subkategori', href: '/admin/subcategories' },
];

interface Category {
    id: number;
    name: string;
}

interface Subcategory {
    id: number;
    name: string;
    description?: string;
    category: Category;
}

interface Props {
    subcategories: {
        data: Subcategory[];
        links: any[];
    };
    categories: Category[];
    filters: {
        search: string;
    };
}

export default function SubcategoriesIndex({ subcategories, filters }: Props) {
    const { data, setData, get, processing } = useForm({
        search: filters.search || '',
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        get('/admin/subcategories', {
            preserveState: true,
        });
    };

    const handleDelete = (subcategoryId: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus subkategori ini?')) {
            router.delete(`/admin/subcategories/${subcategoryId}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Subkategori Tiket" />
            <div className="flex flex-1 flex-col gap-6 rounded-xl px-4 pt-4 pb-20 md:p-4 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950/30 dark:to-indigo-950 transition-colors duration-300">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div className="space-y-1">
                        <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent uppercase tracking-tight">Subkategori Tiket</h1>
                        <p className="text-muted-foreground text-xs md:text-sm font-medium dark:text-slate-400 italic">Kelola detail spesifikasi masalah untuk layanan yang lebih efisien.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <form onSubmit={handleSearch} className="flex gap-2 relative group">
                            <Input
                                placeholder="Cari subkategori..."
                                value={data.search}
                                onChange={(e) => setData('search', e.target.value)}
                                className="w-full sm:w-64 h-12 border-blue-200 dark:border-slate-800 focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-900/50 rounded-xl pl-4 pr-10 transition-all font-medium"
                            />
                            <Button type="submit" disabled={processing} variant="secondary" className="h-12 px-6 rounded-xl font-bold bg-white dark:bg-slate-800 border-2 border-blue-100 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-slate-700 transition-all">Cari</Button>
                        </form>
                        <Link href="/admin/subcategories/create">
                            <Button className="h-12 w-full sm:w-auto px-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-500 dark:to-blue-600 text-white font-black rounded-xl shadow-xl shadow-blue-500/20 uppercase tracking-widest text-xs">Buat Baru</Button>
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {subcategories.data.map((subcategory) => (
                        <Card key={subcategory.id} className="border-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm shadow-xl dark:shadow-blue-900/10 rounded-2xl overflow-hidden group hover:translate-y-[-4px] transition-all duration-300">
                            <CardHeader className="border-b border-blue-50 dark:border-slate-800 p-6 bg-gradient-to-r from-blue-50/30 to-transparent dark:from-blue-900/10">
                                <CardTitle className="text-blue-900 dark:text-blue-100 font-black text-xl tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors uppercase">{subcategory.name}</CardTitle>
                                <span className="inline-block mt-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-[10px] font-black rounded-full uppercase tracking-tighter">
                                    {subcategory.category.name}
                                </span>
                            </CardHeader>
                            <CardContent className="p-6">
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 italic min-h-[40px] leading-relaxed">{subcategory.description || 'Tidak ada deskripsi rinci'}</p>
                                <div className="flex gap-2 pt-4 border-t border-blue-50 dark:border-slate-800">
                                    <Link href={`/admin/subcategories/${subcategory.id}/edit`} className="flex-1">
                                        <Button variant="outline" size="sm" className="w-full border-blue-200 dark:border-slate-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 font-bold rounded-lg h-10 text-xs uppercase tracking-widest transition-all">Edit</Button>
                                    </Link>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        className="flex-1 font-bold rounded-lg h-10 shadow-lg shadow-red-500/10 text-xs uppercase tracking-widest transition-all"
                                        onClick={() => handleDelete(subcategory.id)}
                                    >
                                        Hapus
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {subcategories.data.length === 0 && (
                    <div className="text-center py-20 bg-white/40 dark:bg-slate-900/40 rounded-3xl border-2 border-dashed border-blue-100 dark:border-slate-800">
                        <p className="text-slate-500 dark:text-slate-400 font-bold italic mb-4">Tidak ada subkategori ditemukan.</p>
                        <Link href="/admin/subcategories/create">
                            <Button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 font-black px-8 rounded-xl shadow-lg">Buat Subkategori Pertama</Button>
                        </Link>
                    </div>
                )}

                {/* Pagination */}
                <div className="mt-8">
                    <Pagination links={subcategories.links} />
                </div>
            </div>
        </AppLayout>
    );
}
