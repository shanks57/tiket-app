import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    FileText,
    CheckCircle,
    AlertTriangle,
    TrendingUp,
    Users,
    BarChart3,
    Calendar,
    Target,
    Download,
    Info,
    Folder,
    Wrench
} from 'lucide-react';
import { SlaInfoModal } from '@/components/sla-info-modal';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dasbor Admin',
        href: dashboard().url,
    },
];

interface Stats {
    total_tickets: number;
    submitted: number;
    processed: number;
    repairing: number;
    done: number;
    rejected: number;
    high_priority: number;
    medium_priority: number;
    low_priority: number;
    completed_today: number;
    completed_this_week: number;
    overdue: number;
    resolution_rate: number;
    tickets_today: number;
    tickets_7days: number;
    tickets_14days: number;
    tickets_30days: number;
}

interface Ticket {
    id: number;
    ticket_number: string;
    title: string;
    status: string;
    priority: string;
    category: {
        name: string;
    };
    user: {
        name: string;
    };
    assignees?: {
        name: string;
    }[];
    created_at: string;
    updated_at: string;
}

interface User {
    id: number;
    name: string;
}

interface Sla {
    id: number;
    priority: string;
    response_time_minutes: number;
    resolution_time_minutes: number;
}

interface Props {
    stats: Stats;
    recentTickets: Ticket[];
    technicians: User[];
    slas: Sla[];
}

export default function Dashboard({ stats, recentTickets, technicians = [], slas = [] }: Props) {
    const [selectedTechnician, setSelectedTechnician] = useState<string>('all');
    const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().substring(0, 7));
    const [isDownloadOpen, setIsDownloadOpen] = useState(false);

    const handleDownloadExcel = () => {
        const params = new URLSearchParams();
        params.append('format', 'xlsx');
        if (selectedTechnician !== 'all') params.append('technician_id', selectedTechnician);
        if (selectedMonth) params.append('month', selectedMonth);

        window.open(`/admin/reports/performance?${params.toString()}`, '_blank');
        setIsDownloadOpen(false);
    };
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'submitted': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
            case 'processed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
            case 'repairing': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
            case 'done': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
            case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'submitted': return 'Diajukan';
            case 'processed': return 'Diproses';
            case 'repairing': return 'Diperbaiki';
            case 'done': return 'Selesai';
            case 'rejected': return 'Ditolak';
            default: return status;
        }
    };

    const getPriorityText = (priority: string) => {
        switch (priority) {
            case 'low': return 'Rendah';
            case 'medium': return 'Sedang';
            case 'high': return 'Tinggi';
            default: return priority;
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
            case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
            case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
        }
    };

    // Calculate percentages for status distribution
    const statusData = [
        { status: 'Dikirim', count: stats.submitted, color: 'bg-gray-500' },
        { status: 'Diproses', count: stats.processed, color: 'bg-blue-500' },
        { status: 'Diperbaiki', count: stats.repairing, color: 'bg-yellow-500' },
        { status: 'Selesai', count: stats.done, color: 'bg-green-500' },
        { status: 'Ditolak', count: stats.rejected, color: 'bg-red-500' },
    ];

    const priorityData = [
        { priority: 'Tinggi', count: stats.high_priority, color: 'bg-red-500' },
        { priority: 'Sedang', count: stats.medium_priority, color: 'bg-yellow-500' },
        { priority: 'Rendah', count: stats.low_priority, color: 'bg-green-500' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dasbor Admin" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4 pb-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 transition-colors duration-300">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">Dasbor Admin</h1>
                        <p className="text-muted-foreground text-sm md:text-base dark:text-gray-400">Selamat datang kembali! Berikut ringkasan sistem helpdesk Anda.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <Link href="/admin/tickets">
                            <Button variant="outline" className="border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 dark:text-blue-100">
                                <FileText className="mr-2 h-4 w-4" />
                                Lihat Semua Tiket
                            </Button>
                        </Link>
                        <Link href="/admin/users">
                            <Button variant="outline" className="border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 dark:text-blue-100">
                                <Users className="mr-2 h-4 w-4" />
                                Kelola Pengguna
                            </Button>
                        </Link>
                        <SlaInfoModal slas={slas} />
                        <Dialog open={isDownloadOpen} onOpenChange={setIsDownloadOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-lg">
                                    <Download className="mr-2 h-4 w-4" />
                                    Download Performa (Excel)
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Download Laporan Performa</DialogTitle>
                                    <DialogDescription>
                                        Pilih teknisi dan bulan untuk mengunduh laporan performa dalam format Excel.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-medium dark:text-gray-200">Teknisi</label>
                                        <Select value={selectedTechnician} onValueChange={setSelectedTechnician}>
                                            <SelectTrigger className="border-blue-200 dark:border-blue-800 dark:bg-slate-900">
                                                <SelectValue placeholder="Pilih Teknisi" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Semua Teknisi</SelectItem>
                                                {technicians?.map((tech) => (
                                                    <SelectItem key={tech.id} value={tech.id.toString()}>
                                                        {tech.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-medium dark:text-gray-200">Bulan</label>
                                        <Input
                                            type="month"
                                            value={selectedMonth}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectedMonth(e.target.value)}
                                            className="border-blue-200 dark:border-blue-800 dark:bg-slate-900"
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button onClick={handleDownloadExcel} className="bg-emerald-600 hover:bg-emerald-700">
                                        Download Excel
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>


                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                    <Card
                        className="cursor-pointer hover:shadow-lg hover:border-blue-500 transition-all border-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 dark:border dark:border-blue-800/50"
                        onClick={() => router.visit('/admin/tickets')}
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100">Total Tiket</CardTitle>
                            <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.total_tickets}</div>
                            <p className="text-xs text-blue-600 dark:text-blue-400/80">Total tiket sepanjang waktu</p>
                        </CardContent>
                    </Card>

                    <Card
                        className="cursor-pointer hover:shadow-lg hover:border-emerald-500 transition-all border-0 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 dark:border dark:border-emerald-800/50"
                        onClick={() => router.visit('/admin/tickets?status=done')}
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-emerald-900 dark:text-emerald-100">Tingkat Penyelesaian</CardTitle>
                            <Target className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{stats.resolution_rate}%</div>
                            <Progress value={stats.resolution_rate} className="mt-2 bg-emerald-200 dark:bg-emerald-900/50 [&>*]:bg-emerald-600 dark:[&>*]:bg-emerald-400" />
                        </CardContent>
                    </Card>

                    <Card
                        className="cursor-pointer hover:shadow-lg hover:border-green-500 transition-all border-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 dark:border dark:border-green-800/50"
                        onClick={() => router.visit('/admin/tickets?status=done&date=today')}
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-green-900 dark:text-green-100">Selesai Hari Ini</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.completed_today}</div>
                            <p className="text-xs text-green-600 dark:text-green-400/80">Tiket diselesaikan hari ini</p>
                        </CardContent>
                    </Card>

                    <Card
                        className="cursor-pointer hover:shadow-lg hover:border-red-500 transition-all border-0 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 dark:border dark:border-red-800/50"
                        onClick={() => router.visit('/admin/tickets?status=overdue')}
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-red-900 dark:text-red-100">Terlambat</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-700 dark:text-red-300">{stats.overdue}</div>
                            <p className="text-xs text-red-600 dark:text-red-400/80">Melewati batas waktu SLA</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Time-Based Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                    <Card
                        className="cursor-pointer hover:shadow-lg hover:border-amber-500 transition-all border-0 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 dark:border dark:border-amber-800/50"
                        onClick={() => router.visit('/admin/tickets?date_from=today')}
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-amber-900 dark:text-amber-100">Tiket Hari Ini</CardTitle>
                            <Calendar className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">{stats.tickets_today}</div>
                            <p className="text-xs text-amber-600 dark:text-amber-400/80">Dibuat hari ini</p>
                        </CardContent>
                    </Card>

                    <Card
                        className="cursor-pointer hover:shadow-lg hover:border-cyan-500 transition-all border-0 bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-800/20 dark:border dark:border-cyan-800/50"
                        onClick={() => router.visit('/admin/tickets?date_from=7days')}
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-cyan-900 dark:text-cyan-100">Tiket 7 Hari</CardTitle>
                            <Calendar className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-cyan-700 dark:text-cyan-300">{stats.tickets_7days}</div>
                            <p className="text-xs text-cyan-600 dark:text-cyan-400/80">Dalam 7 hari terakhir</p>
                        </CardContent>
                    </Card>

                    <Card
                        className="cursor-pointer hover:shadow-lg hover:border-violet-500 transition-all border-0 bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-900/20 dark:to-violet-800/20 dark:border dark:border-violet-800/50"
                        onClick={() => router.visit('/admin/tickets?date_from=14days')}
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-violet-900 dark:text-violet-100">Tiket 14 Hari</CardTitle>
                            <Calendar className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-violet-700 dark:text-violet-300">{stats.tickets_14days}</div>
                            <p className="text-xs text-violet-600 dark:text-violet-400/80">Dalam 14 hari terakhir</p>
                        </CardContent>
                    </Card>

                    <Card
                        className="cursor-pointer hover:shadow-lg hover:border-fuchsia-500 transition-all border-0 bg-gradient-to-br from-fuchsia-50 to-fuchsia-100 dark:from-fuchsia-900/20 dark:to-fuchsia-800/20 dark:border dark:border-fuchsia-800/50"
                        onClick={() => router.visit('/admin/tickets?date_from=30days')}
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-fuchsia-900 dark:text-fuchsia-100">Tiket 30 Hari</CardTitle>
                            <Calendar className="h-4 w-4 text-fuchsia-600 dark:text-fuchsia-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-fuchsia-700 dark:text-fuchsia-300">{stats.tickets_30days}</div>
                            <p className="text-xs text-fuchsia-600 dark:text-fuchsia-400/80">Dalam 30 hari terakhir</p>
                        </CardContent>
                    </Card>
                </div>
                {/* Status Distribution */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                    <Card className="border-0 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 dark:border dark:border-indigo-800/50 shadow-md">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-indigo-900 dark:text-indigo-100">
                                <BarChart3 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                Distribusi Status Tiket
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {statusData.map((item) => (
                                    <div
                                        key={item.status}
                                        className="flex items-center justify-between cursor-pointer hover:opacity-80 transition-opacity"
                                        onClick={() => {
                                            const statusMap: { [key: string]: string } = {
                                                'Dikirim': 'submitted',
                                                'Diproses': 'processed',
                                                'Diperbaiki': 'repairing',
                                                'Selesai': 'done',
                                                'Ditolak': 'rejected',
                                            };
                                            router.visit(`/admin/tickets?status=${statusMap[item.status]}`);
                                        }}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                                            <span className="text-sm font-medium dark:text-indigo-100">{item.status}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-muted-foreground dark:text-indigo-300">{item.count}</span>
                                            <div className="w-20 bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full ${item.color}`}
                                                    style={{
                                                        width: stats.total_tickets > 0 ? `${(item.count / stats.total_tickets) * 100}%` : '0%'
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 dark:border dark:border-orange-800/50 shadow-md">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-orange-900 dark:text-orange-100">
                                <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                Distribusi Prioritas
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {priorityData.map((item) => (
                                    <div
                                        key={item.priority}
                                        className="flex items-center justify-between cursor-pointer hover:opacity-80 transition-opacity"
                                        onClick={() => {
                                            const priorityMap: { [key: string]: string } = {
                                                'Tinggi': 'high',
                                                'Sedang': 'medium',
                                                'Rendah': 'low',
                                            };
                                            router.visit(`/admin/tickets?priority=${priorityMap[item.priority]}`);
                                        }}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                                            <span className="text-sm font-medium dark:text-orange-100">{item.priority} Priority</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-muted-foreground dark:text-orange-300">{item.count}</span>
                                            <div className="w-20 bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full ${item.color}`}
                                                    style={{
                                                        width: stats.total_tickets > 0 ? `${(item.count / stats.total_tickets) * 100}%` : '0%'
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Weekly Performance & Achievements */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    <Card className="border-0 bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20 dark:border dark:border-teal-800/50 shadow-md">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-teal-900 dark:text-teal-100">
                                <TrendingUp className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                                Minggu Ini
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.completed_this_week}</div>
                            <p className="text-sm text-muted-foreground dark:text-teal-300/80">Tiket diselesaikan minggu ini</p>
                            <div className="mt-4">
                                <Progress
                                    value={stats.total_tickets > 0 ? (stats.completed_this_week / Math.max(stats.total_tickets * 0.1, 1)) * 100 : 0}
                                    className="h-2 bg-teal-200 dark:bg-teal-900/50"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 dark:border dark:border-indigo-800/30 shadow-md">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-indigo-900 dark:text-indigo-100">
                                <CheckCircle className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                Kesehatan Sistem
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm text-indigo-800 dark:text-indigo-200">
                                    <span>Tiket Aktif</span>
                                    <span className="font-semibold">{stats.submitted + stats.processed + stats.repairing}</span>
                                </div>
                                <Progress
                                    value={stats.total_tickets > 0 ? ((stats.submitted + stats.processed + stats.repairing) / stats.total_tickets) * 100 : 0}
                                    className="h-2 bg-indigo-200 dark:bg-indigo-950/50"
                                />
                                <div className="flex justify-between text-sm text-indigo-800 dark:text-indigo-200 pt-2">
                                    <span>Tingkat Penyelesaian</span>
                                    <span className="font-semibold">{stats.resolution_rate}%</span>
                                </div>
                                <Progress value={stats.resolution_rate} className="h-2 bg-indigo-200 dark:bg-indigo-950/50" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-900/20 dark:to-rose-800/20 dark:border dark:border-rose-800/50 shadow-md">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-rose-900 dark:text-rose-100">
                                <Target className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                                Pencapaian
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3 font-medium">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" />
                                    <span className="text-sm dark:text-rose-100">
                                        {stats.completed_today >= 5 ? 'Performa Tinggi' : 'Dalam Jalur'} Hari Ini
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" />
                                    <span className="text-sm dark:text-rose-100">
                                        Tingkat Penyelesaian {stats.resolution_rate >= 80 ? 'Sangat Baik' : 'Baik'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className={`h-4 w-4 ${stats.overdue === 0 ? 'text-green-500 dark:text-green-400' : 'text-yellow-500 dark:text-yellow-400'}`} />
                                    <span className="text-sm dark:text-rose-100">
                                        {stats.overdue === 0 ? 'Tidak Ada Terlambat' : `${stats.overdue} Tiket Terlambat`}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Tickets */}
                <Card className="border-0 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900/20 dark:to-blue-900/20 dark:border dark:border-blue-800/30 shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
                            <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            Tiket Terbaru
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentTickets.map((ticket) => (
                                <div key={ticket.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-blue-100 dark:border-blue-900/30 rounded-xl bg-white/60 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm group">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                            <span className="font-bold text-blue-900 dark:text-blue-200">{ticket.ticket_number}</span>
                                            <Badge className={`${getStatusColor(ticket.status)} border-0`}>
                                                {getStatusText(ticket.status)}
                                            </Badge>
                                            <Badge className={`${getPriorityColor(ticket.priority)} border-0`}>
                                                {getPriorityText(ticket.priority)}
                                            </Badge>
                                        </div>
                                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{ticket.title}</p>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                                            <span className="flex items-center gap-1">
                                                <Users className="h-3 w-3" />
                                                {ticket.user.name}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Folder className="h-3 w-3" />
                                                {ticket.category.name}
                                            </span>
                                            {ticket.assignees && ticket.assignees.length > 0 && (
                                                <span className="flex items-center gap-1">
                                                    <Wrench className="h-3 w-3" />
                                                    {ticket.assignees.map(a => a.name).join(', ')}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto mt-4 sm:mt-0 gap-2">
                                        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 italic">
                                            {new Date(ticket.created_at).toLocaleDateString()}
                                        </p>
                                        <Link href={`/admin/tickets/${ticket.id}`}>
                                            <Button variant="outline" size="sm" className="border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                                                Lihat Rincian
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {recentTickets.length === 0 && (
                            <div className="text-center py-12 bg-slate-50/50 dark:bg-slate-900/50 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                                <FileText className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                                <p className="text-muted-foreground font-medium">Tidak ada tiket ditemukan.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}