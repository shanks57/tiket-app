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
    { title: 'Buat Tiket', href: '/tickets/create' },
];

interface Category {
    id: number;
    name: string;
    description: string;
    subcategories?: Subcategory[];
}

interface Subcategory {
    id: number;
    name: string;
    description: string;
}

interface Sla {
    id: number;
    priority: string;
    response_time_minutes: number;
    resolution_time_minutes: number;
}

interface Props {
    categories: Category[];
    slas: Sla[];
}

export default function Create({ categories, slas }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        category_id: '',
        subcategory_id: '',
        title: '',
        description: '',
        location: '',
        attachments: [] as File[],
    });

    const selectedCategory = categories.find(c => c.id === parseInt(data.category_id));
    const subcategories = selectedCategory?.subcategories || [];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        post('/tickets', {
            forceFormData: true,
            onSuccess: () => {
                toast.success('Tiket berhasil dibuat!');
            },
            onError: () => {
                toast.error('Gagal membuat tiket. Silakan periksa kembali isian Anda.');
            }
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Buat Tiket Baru" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl px-4 pt-4 pb-20   md:p-4 bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-slate-950 dark:via-blue-950 dark:to-cyan-950 transition-colors duration-300">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">Buat Tiket Baru</h1>

                <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl bg-gradient-to-br from-white to-blue-50 dark:from-slate-900 dark:to-slate-800 p-6 rounded-xl border border-blue-100 dark:border-slate-800 shadow-md">
                    <div>
                        <Label htmlFor="category_id" className="dark:text-slate-200">Kategori</Label>
                        <Select value={data.category_id} onValueChange={(value) => {
                            setData('category_id', value);
                            setData('subcategory_id', ''); // Reset subcategory when category changes
                        }}>
                            <SelectTrigger className="dark:bg-slate-900 dark:border-slate-700">
                                <SelectValue placeholder="Pilih kategori" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((category) => (
                                    <SelectItem key={category.id} value={category.id.toString()}>
                                        {category.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.category_id && <p className="text-red-500">{errors.category_id}</p>}
                    </div>

                    <div>
                        <Label htmlFor="subcategory_id" className="dark:text-slate-200">Subkategori (opsional)</Label>
                        {subcategories.length > 0 ? (
                            <>
                                <Select value={data.subcategory_id} onValueChange={(value) => setData('subcategory_id', value)}>
                                    <SelectTrigger className="dark:bg-slate-900 dark:border-slate-700">
                                        <SelectValue placeholder="Pilih subkategori" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {subcategories.map((subcategory) => (
                                            <SelectItem key={subcategory.id} value={subcategory.id.toString()}>
                                                {subcategory.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.subcategory_id && <p className="text-red-500 text-sm mt-1">{errors.subcategory_id}</p>}
                            </>
                        ) : (
                            <div className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md bg-gray-100 dark:bg-slate-900/50 text-gray-500 dark:text-slate-400">
                                Tidak ada subkategori untuk kategori ini
                            </div>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="title" className="dark:text-slate-200">Judul</Label>
                        <Input
                            id="title"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            required
                            placeholder="Deskripsi singkat masalah"
                            className="dark:bg-slate-900 dark:border-slate-700"
                        />
                        {errors.title && <p className="text-red-500">{errors.title}</p>}
                    </div>

                    <div>
                        <Label htmlFor="description" className="dark:text-slate-200">Deskripsi</Label>
                        <textarea
                            id="description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            required
                            placeholder="Deskripsi detail masalah"
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-900 dark:text-slate-200"
                        />
                        {errors.description && <p className="text-red-500">{errors.description}</p>}
                    </div>

                    <div>
                        <Label htmlFor="attachments" className="dark:text-slate-200">Lampiran (opsional)</Label>
                        <Input
                            id="attachments"
                            type="file"
                            multiple
                            onChange={(e) => {
                                const files = Array.from(e.target.files || []);
                                setData('attachments', files);
                            }}
                            className="dark:bg-slate-900 dark:border-slate-700"
                            accept="image/*,.pdf,.doc,.docx,.txt"
                        />
                        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                            Anda dapat mengupload beberapa file (gambar, PDF, dokumen)
                        </p>
                        {errors.attachments && <p className="text-red-500">{errors.attachments}</p>}
                    </div>

                    <div>
                        <Label htmlFor="location" className="dark:text-slate-200">Lokasi</Label>
                        <Input
                            id="location"
                            value={data.location}
                            onChange={(e) => setData('location', e.target.value)}
                            required
                            placeholder="Di mana lokasi masalah?"
                            className="dark:bg-slate-900 dark:border-slate-700"
                        />
                        {errors.location && <p className="text-red-500">{errors.location}</p>}
                    </div>



                    <Button type="submit" disabled={processing} className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 shadow-md">
                        Buat Tiket
                    </Button>
                </form>
            </div>
        </AppLayout>
    );
}