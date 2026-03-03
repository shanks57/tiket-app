import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Head, useForm } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';

interface Category {
    id: number;
    name: string;
}

interface Props {
    categories: Category[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dasbor', href: '/dashboard' },
    { title: 'Subkategori', href: '/admin/subcategories' },
    { title: 'Buat', href: '/admin/subcategories/create' },
];

export default function CreateSubcategory({ categories }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        category_id: '',
        name: '',
        description: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/subcategories');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Buat Subkategori" />
            <div className="flex flex-1 flex-col gap-6 rounded-xl px-4 pt-4 pb-20 md:p-4 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950/30 dark:to-indigo-950 transition-colors duration-300">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">Buat Subkategori</h1>
                    <p className="text-muted-foreground text-sm dark:text-gray-400">Tambahkan sub-klasifikasi untuk pengelompokan masalah yang lebih mendalam.</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-gradient-to-br from-white to-blue-50 dark:from-slate-900 dark:to-slate-800 p-8 rounded-2xl shadow-xl dark:shadow-blue-900/10 max-w-2xl space-y-6 border border-blue-100 dark:border-slate-800">
                    <div className="space-y-2">
                        <Label htmlFor="category_id" className="text-blue-900 dark:text-blue-100 font-bold uppercase text-[10px] tracking-widest pl-1">Kategori Induk</Label>
                        <Select value={data.category_id} onValueChange={(value) => setData('category_id', value)}>
                            <SelectTrigger className="h-12 border-blue-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-950 rounded-xl">
                                <SelectValue placeholder="Pilih kategori induk" />
                            </SelectTrigger>
                            <SelectContent className="dark:bg-slate-900 dark:border-slate-800">
                                {categories.map((category) => (
                                    <SelectItem key={category.id} value={category.id.toString()} className="dark:focus:bg-slate-800">
                                        {category.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.category_id && <p className="text-red-500 text-[10px] sm:text-xs mt-1 font-bold italic uppercase pl-1">{errors.category_id}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-blue-900 dark:text-blue-100 font-bold uppercase text-[10px] tracking-widest pl-1">Nama Subkategori</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Contoh: PC Desktop, Keyboard/Mouse, Monitor"
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
                            placeholder="Jelaskan jenis masalah dalam subkategori ini"
                            className="min-h-[120px] border-blue-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-950 rounded-xl resize-none"
                        />
                        {errors.description && <p className="text-red-500 text-[10px] sm:text-xs mt-1 font-bold italic uppercase pl-1">{errors.description}</p>}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <Button type="submit" disabled={processing} className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-500 dark:to-blue-600 shadow-lg shadow-blue-500/20 text-white font-black h-12 rounded-xl text-sm uppercase tracking-wider">
                            {processing ? 'Menyimpan...' : 'Simpan Subkategori'}
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
            </div>
        </AppLayout>
    );
}
