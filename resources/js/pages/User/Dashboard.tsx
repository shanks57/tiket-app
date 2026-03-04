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
    Clock,
    Wrench,
    CheckCircle,
    XCircle,
    AlertTriangle,
    TrendingUp,
    Plus,
    Eye,
    BarChart3,
    Calendar,
    Target
} from 'lucide-react';
import { PushSubscribeButton } from '@/components/PushSubscribeButton';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dasbor Pengguna',
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
    completed_this_week: number;
    pending_response: number;
    resolution_rate: number;
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
    assignees?: {
        name: string;
    }[];
    progress?: Array<{
        status: string;
        note?: string;
        created_at: string;
    }>;
    created_at: string;
    updated_at: string;
}

interface Props {
    stats: Stats;
    recentTickets: Ticket[];
}

export default function Dashboard({ stats, recentTickets }: Props) {
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

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
            case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
            case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
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

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'submitted': return <Clock className="h-4 w-4" />;
            case 'processed': return <Clock className="h-4 w-4" />;
            case 'repairing': return <Wrench className="h-4 w-4" />;
            case 'done': return <CheckCircle className="h-4 w-4" />;
            case 'rejected': return <XCircle className="h-4 w-4" />;
            default: return <FileText className="h-4 w-4" />;
        }
    };

    // Calculate percentages for status distribution
    const statusData = [
        { status: 'Dikirim', count: stats.submitted, color: 'bg-gray-500', icon: Clock },
        { status: 'Diproses', count: stats.processed, color: 'bg-blue-500', icon: Clock },
        { status: 'Diperbaiki', count: stats.repairing, color: 'bg-yellow-500', icon: Wrench },
        { status: 'Selesai', count: stats.done, color: 'bg-green-500', icon: CheckCircle },
        { status: 'Ditolak', count: stats.rejected, color: 'bg-red-500', icon: XCircle },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dasbor Pengguna" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl px-4 pt-4 pb-20   md:p-4 bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-slate-950 dark:via-blue-950 dark:to-cyan-950 transition-colors duration-300">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">Dasbor Saya</h1>
                        <p className="text-muted-foreground text-sm md:text-base dark:text-gray-400">Pusat kontrol helpdesk Anda. Lacak tiket dan ajukan permintaan baru.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <PushSubscribeButton />
                        <Link href="/tickets/create" className="w-full sm:w-auto">
                            <Button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-500 dark:to-cyan-600 shadow-xl w-full sm:w-auto rounded-xl font-bold">
                                <Plus className="h-4 w-4" />
                                Buat Tiket
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                    <Card
                        className="cursor-pointer hover:shadow-lg hover:border-blue-500 transition-all border-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 dark:border dark:border-blue-800/50"
                        onClick={() => router.visit('/user/tickets')}
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100">Total Tiket</CardTitle>
                            <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.total_tickets}</div>
                            <p className="text-xs text-blue-600 dark:text-blue-400/80">Tiket yang diajukan</p>
                        </CardContent>
                    </Card>

                    <Card
                        className="cursor-pointer hover:shadow-lg hover:border-emerald-500 transition-all border-0 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 dark:border dark:border-emerald-800/50"
                        onClick={() => router.visit('/user/tickets?status=done')}
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
                        className="cursor-pointer hover:shadow-lg hover:border-amber-500 transition-all border-0 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 dark:border dark:border-amber-800/50"
                        onClick={() => router.visit('/user/tickets?status=processed,repairing')}
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-amber-900 dark:text-amber-100">Sedang Dikerjakan</CardTitle>
                            <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">{stats.pending_response}</div>
                            <p className="text-xs text-amber-600 dark:text-amber-400/80">Sedang dikerjakan</p>
                        </CardContent>
                    </Card>

                    <Card
                        className="cursor-pointer hover:shadow-lg hover:border-green-500 transition-all border-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 dark:border dark:border-green-800/50"
                        onClick={() => router.visit('/user/tickets?status=done')}
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-green-900 dark:text-green-100">Selesai</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.done}</div>
                            <p className="text-xs text-green-600 dark:text-green-400/80">Berhasil diselesaikan</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Status Overview */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                    <Card className="border-0 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 dark:border dark:border-indigo-800/50 shadow-md">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-indigo-900 dark:text-indigo-100">
                                <BarChart3 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                Ringkasan Status Tiket
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {statusData.map((item) => (
                                    <div key={item.status} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <item.icon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                            <span className="text-sm font-medium text-indigo-900 dark:text-indigo-200">{item.status}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-indigo-700 dark:text-indigo-300 font-semibold">{item.count}</span>
                                            <div className="w-20 bg-indigo-200 dark:bg-indigo-900/50 rounded-full h-2">
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

                    <Card className="border-0 bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-purple-900/20 dark:to-indigo-800/20 dark:border dark:border-indigo-800/50 shadow-md">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-purple-900 dark:text-purple-100">
                                <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                Ringkasan Aktivitas
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between group">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20">
                                            <CheckCircle className="h-4 w-4 text-emerald-500" />
                                        </div>
                                        <span className="text-sm text-slate-700 dark:text-slate-300">Selesai minggu ini</span>
                                    </div>
                                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{stats.completed_this_week}</span>
                                </div>
                                <div className="flex items-center justify-between group">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 rounded-lg bg-blue-500/10 dark:bg-blue-500/20">
                                            <Clock className="h-4 w-4 text-blue-500" />
                                        </div>
                                        <span className="text-sm text-slate-700 dark:text-slate-300">Menunggu respon</span>
                                    </div>
                                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{stats.pending_response}</span>
                                </div>
                                <div className="flex items-center justify-between group">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 rounded-lg bg-amber-500/10 dark:bg-amber-500/20">
                                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                                        </div>
                                        <span className="text-sm text-slate-700 dark:text-slate-300">Memprioritaskan</span>
                                    </div>
                                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{stats.high_priority}</span>
                                </div>
                                <div className="flex items-center justify-between group">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 rounded-lg bg-red-500/10 dark:bg-red-500/20">
                                            <XCircle className="h-4 w-4 text-red-500" />
                                        </div>
                                        <span className="text-sm text-slate-700 dark:text-slate-300">Dibatalkan/Ditolak</span>
                                    </div>
                                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{stats.rejected}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Tickets */}
                <Card className="border-0 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900/40 dark:to-blue-900/20 dark:border dark:border-blue-800/30 shadow-xl overflow-hidden">
                    <CardHeader className="border-b border-blue-100 dark:border-blue-900/30 bg-white/40 dark:bg-slate-800/40">
                        <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
                            <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            Tiket Terbaru Saya
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-blue-50 dark:divide-blue-900/20">
                            {recentTickets.map((ticket) => (
                                <div key={ticket.id} className="p-5 hover:bg-white dark:hover:bg-slate-800 transition-all group">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                                <span className="font-black text-blue-700 dark:text-blue-400 tracking-tighter text-sm uppercase">#{ticket.ticket_number}</span>
                                                <Badge className={`${getStatusColor(ticket.status)} border-0 text-[10px] font-bold uppercase`}>
                                                    {getStatusIcon(ticket.status)}
                                                    <span className="ml-1">{getStatusText(ticket.status)}</span>
                                                </Badge>
                                                <Badge className={`${getPriorityColor(ticket.priority)} border-0 text-[10px] font-bold uppercase`}>
                                                    {getPriorityText(ticket.priority)}
                                                </Badge>
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors uppercase tracking-tight">{ticket.title}</h3>
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                                <span>Kategori: {ticket.category.name}</span>
                                                {ticket.assignees && ticket.assignees.length > 0 && (
                                                    <span>Ditugaskan: {ticket.assignees.map(a => a.name).join(', ')}</span>
                                                )}
                                                {ticket.progress && ticket.progress.length > 0 && (
                                                    <span className="text-blue-600 dark:text-blue-400">Update: {new Date(ticket.progress[0].created_at).toLocaleDateString()}</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="shrink-0">
                                            <Link href={`/user/tickets/${ticket.id}`} className="w-full md:w-auto">
                                                <Button variant="outline" size="sm" className="w-full md:w-auto justify-center border-blue-200 dark:border-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-xl font-bold text-blue-600 dark:text-blue-400 h-10 px-6">
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    Lihat Detail
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {recentTickets.length === 0 && (
                            <div className="text-center py-8">
                                <FileText className="h-12 w-12 text-blue-200 mx-auto mb-4" />
                                <p className="text-blue-800">Tidak ada tiket ditemukan.</p>
                                <Link href="/tickets/create">
                                    <Button className="mt-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Buat Tiket Pertama Anda
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}