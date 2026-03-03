import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Head, useForm } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { toast } from 'sonner';

interface Technician {
    id: number;
    name: string;
    username: string;
    email: string;
}

interface Category {
    id: number;
    name: string;
    description?: string;
}

interface Props {
    category: Category;
    technicians: Technician[];
    assignedTechnicians: number[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Categories', href: '/admin/categories' },
    { title: 'Manage Technicians', href: '' },
];

export default function ManageTechnicians({ category, technicians, assignedTechnicians }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        technician_ids: assignedTechnicians,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/admin/categories/${category.id}/assign-technicians`, {
            onSuccess: () => {
                toast.success('Penugasan teknisi berhasil diperbarui!');
            },
            onError: () => {
                toast.error('Gagal memperbarui penugasan teknisi.');
            }
        });
    };

    const handleTechnicianToggle = (technicianId: number) => {
        const updated = Array.isArray(data.technician_ids) ? [...data.technician_ids] : [];
        const index = updated.indexOf(technicianId);

        if (index > -1) {
            updated.splice(index, 1);
        } else {
            updated.push(technicianId);
        }

        setData('technician_ids', updated);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tugaskan Teknisi" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl px-4 pt-4 pb-20   md:p-4 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950/30 dark:to-indigo-950 transition-colors duration-300">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">Tugaskan Teknisi</h1>
                    <p className="text-muted-foreground text-sm dark:text-gray-400">Atur siapa saja yang bertanggung jawab untuk kategori: <span className="font-bold text-blue-600 dark:text-blue-400">{category.name}</span></p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl bg-white/60 dark:bg-slate-900/60 p-6 md:p-8 rounded-2xl shadow-xl dark:shadow-blue-900/10 border border-blue-100 dark:border-slate-800">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-sm font-black text-blue-900 dark:text-blue-100 uppercase tracking-widest">Pilih Teknisi</h2>
                            <span className="text-[10px] font-bold bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full uppercase tracking-tighter">
                                {data.technician_ids.length} Dipilih
                            </span>
                        </div>

                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {technicians.length > 0 ? (
                                technicians.map((technician) => (
                                    <div
                                        key={technician.id}
                                        className={`flex items-center space-x-3 p-4 border rounded-xl transition-all cursor-pointer group ${(Array.isArray(data.technician_ids) && data.technician_ids.includes(technician.id))
                                            ? 'bg-blue-50/50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                                            : 'bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-800/50 hover:border-blue-200 dark:hover:border-blue-800/50'
                                            }`}
                                        onClick={() => handleTechnicianToggle(technician.id)}
                                    >
                                        <Checkbox
                                            id={`tech-${technician.id}`}
                                            checked={Array.isArray(data.technician_ids) && data.technician_ids.includes(technician.id)}
                                            onCheckedChange={() => handleTechnicianToggle(technician.id)}
                                            className="h-5 w-5 rounded-md border-slate-300 dark:border-slate-700 data-[state=checked]:bg-blue-600 dark:data-[state=checked]:bg-blue-500"
                                        />
                                        <Label htmlFor={`tech-${technician.id}`} className="cursor-pointer flex-1">
                                            <div className="flex flex-col">
                                                <p className={`font-bold transition-colors ${(Array.isArray(data.technician_ids) && data.technician_ids.includes(technician.id))
                                                    ? 'text-blue-700 dark:text-blue-300'
                                                    : 'text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                                                    }`}>{technician.name}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">@{technician.username} • {technician.email}</p>
                                            </div>
                                        </Label>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 bg-slate-50 dark:bg-slate-950/40 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                                    <p className="text-slate-500 dark:text-slate-400 font-medium italic">Tidak ada teknisi tersedia</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {errors.technician_ids && <p className="text-red-500 text-xs font-bold italic p-2 border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 rounded-r-lg">{errors.technician_ids}</p>}

                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <Button type="submit" disabled={processing} className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-black h-12 rounded-xl text-sm uppercase tracking-wider shadow-lg shadow-blue-500/20">
                            {processing ? 'Menyimpan...' : 'Simpan Penugasan'}
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
