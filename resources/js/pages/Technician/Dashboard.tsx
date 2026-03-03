import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { router, useForm } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { CheckCircle, Clock, Wrench, AlertTriangle, TrendingUp, FileText, Upload, MessageSquare, Info } from 'lucide-react';
import { SlaInfoModal } from '@/components/sla-info-modal';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dasbor Teknisi',
        href: '/dashboard',
    },
];

interface Stats {
    total_assigned: number;
    pending: number;
    in_progress: number;
    completed_today: number;
    completed_this_week: number;
    overdue: number;
}

interface Ticket {
    id: number;
    ticket_number: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    category: {
        name: string;
    };
    user: {
        name: string;
    };
    sla?: {
        resolution_time_minutes: number;
    };
    progress?: Array<{
        status: string;
        note?: string;
        created_at: string;
    }>;
    created_at: string;
    updated_at: string;
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
    slas: Sla[];
}

export default function Dashboard({ stats, recentTickets, slas = [] }: Props) {
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

    const handleQuickAction = (ticketId: number, action: string, data?: any) => {
        switch (action) {
            case 'start_repair':
                router.post(`/technician/tickets/${ticketId}/status`, { status: 'repairing' });
                break;
            case 'complete':
                router.post(`/technician/tickets/${ticketId}/status`, { status: 'done' });
                break;
            case 'add_note':
                if (data?.note) {
                    router.post(`/technician/tickets/${ticketId}/progress`, { note: data.note });
                }
                break;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dasbor Teknisi" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl px-4 pt-4 pb-20   md:p-4 bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 dark:from-slate-950 dark:via-blue-950 dark:to-emerald-950 transition-colors duration-300">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 dark:from-blue-400 dark:to-emerald-400 bg-clip-text text-transparent">Dasbor Teknisi</h1>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <SlaInfoModal slas={slas} />
                        <Button onClick={() => router.visit('/admin/tickets?assigned_to=me')} variant="outline" className="border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 dark:text-blue-100">
                            Lihat Semua Tiket Saya
                        </Button>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                    <Card
                        className="cursor-pointer hover:shadow-lg hover:border-blue-500 transition-all border-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 dark:border dark:border-blue-800/50"
                        onClick={() => router.visit('/admin/tickets?assigned_to=me')}
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100">Total Ditugaskan</CardTitle>
                            <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.total_assigned}</div>
                            <p className="text-xs text-blue-600 dark:text-blue-400/80">Tiket yang ditugaskan kepada Anda</p>
                        </CardContent>
                    </Card>

                    <Card
                        className="cursor-pointer hover:shadow-lg hover:border-cyan-500 transition-all border-0 bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-800/20 dark:border dark:border-cyan-800/50"
                        onClick={() => router.visit('/admin/tickets?assigned_to=me&status=processed')}
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-cyan-900 dark:text-cyan-100">Menunggu</CardTitle>
                            <Clock className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-cyan-700 dark:text-cyan-300">{stats.pending}</div>
                            <p className="text-xs text-cyan-600 dark:text-cyan-400/80">Menunggu untuk memulai</p>
                        </CardContent>
                    </Card>

                    <Card
                        className="cursor-pointer hover:shadow-lg hover:border-amber-500 transition-all border-0 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 dark:border dark:border-amber-800/50"
                        onClick={() => router.visit('/admin/tickets?assigned_to=me&status=repairing')}
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-amber-900 dark:text-amber-100">Sedang Dikerjakan</CardTitle>
                            <Wrench className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">{stats.in_progress}</div>
                            <p className="text-xs text-amber-600 dark:text-amber-400/80">Sedang diperbaiki</p>
                        </CardContent>
                    </Card>

                    <Card
                        className="cursor-pointer hover:shadow-lg hover:border-emerald-500 transition-all border-0 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 dark:border dark:border-emerald-800/50"
                        onClick={() => router.visit('/admin/tickets?assigned_to=me&status=done&date=today')}
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-emerald-900 dark:text-emerald-100">Selesai Hari Ini</CardTitle>
                            <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{stats.completed_today}</div>
                            <p className="text-xs text-emerald-600 dark:text-emerald-400/80">Selesai hari ini</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Additional Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                    <Card
                        className="cursor-pointer hover:shadow-lg hover:border-green-500 transition-all border-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 dark:border dark:border-green-800/50"
                        onClick={() => router.visit('/admin/tickets?assigned_to=me&status=done&date=week')}
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-green-900 dark:text-green-100">Minggu Ini</CardTitle>
                            <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.completed_this_week}</div>
                            <p className="text-xs text-green-600 dark:text-green-400/80">Selesai minggu ini</p>
                        </CardContent>
                    </Card>

                    <Card
                        className="cursor-pointer hover:shadow-lg hover:border-red-500 transition-all border-0 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 dark:border dark:border-red-800/50"
                        onClick={() => router.visit('/admin/tickets?assigned_to=me&overdue=true')}
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

                    <Card
                        className="cursor-pointer hover:shadow-lg hover:border-indigo-500 transition-all border-0 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 dark:border dark:border-indigo-800/50"
                        onClick={() => router.visit('/admin/tickets?assigned_to=me&status=done')}
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-indigo-900 dark:text-indigo-100">Tingkat Keberhasilan</CardTitle>
                            <CheckCircle className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">
                                {stats.total_assigned > 0
                                    ? Math.round(((stats.completed_this_week + stats.completed_today) / stats.total_assigned) * 100)
                                    : 0}%
                            </div>
                            <Progress
                                value={stats.total_assigned > 0 ? ((stats.completed_this_week + stats.completed_today) / stats.total_assigned) * 100 : 0}
                                className="mt-2 h-2 bg-indigo-200 dark:bg-indigo-900/50 [&>*]:bg-indigo-600 dark:[&>*]:bg-indigo-400"
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Tickets */}
                <Card className="border-0 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900/40 dark:to-blue-900/20 dark:border dark:border-blue-800/30 shadow-xl overflow-hidden">
                    <CardHeader className="border-b border-blue-100 dark:border-blue-900/30 bg-white/40 dark:bg-slate-800/40">
                        <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
                            <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            Tiket Ditugaskan Terbaru
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-blue-50 dark:divide-blue-900/20">
                            {recentTickets.length === 0 ? (
                                <div className="text-center py-12">
                                    <FileText className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                                    <p className="text-muted-foreground font-medium">Belum ada tiket yang ditugaskan.</p>
                                </div>
                            ) : (
                                recentTickets.map((ticket) => (
                                    <div key={ticket.id} className="p-5 hover:bg-white dark:hover:bg-slate-800 transition-all group">
                                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                                    <span className="font-black text-blue-700 dark:text-blue-400 tracking-tighter text-sm uppercase">#{ticket.ticket_number}</span>
                                                    <Badge className={`${getStatusColor(ticket.status)} border-0 text-[10px] font-bold uppercase`}>
                                                        {getStatusText(ticket.status)}
                                                    </Badge>
                                                    <Badge className={`${getPriorityColor(ticket.priority)} border-0 text-[10px] font-bold uppercase`}>
                                                        {getPriorityText(ticket.priority)}
                                                    </Badge>
                                                </div>
                                                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors uppercase tracking-tight">{ticket.title}</h3>
                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mb-3">
                                                    <span className="font-bold">{ticket.category.name}</span>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-1"><Info className="h-3 w-3" /> Pelapor: {ticket.user.name}</span>
                                                </div>
                                                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed bg-slate-50 dark:bg-slate-950/40 p-3 rounded-lg border border-slate-100 dark:border-slate-800/50">{ticket.description}</p>
                                            </div>
                                            <div className="flex flex-row md:flex-col items-center md:items-end gap-2 shrink-0 md:pt-1">
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    className="font-bold rounded-xl dark:bg-slate-800 dark:hover:bg-slate-700"
                                                    onClick={() => router.visit(`/technician/tickets/${ticket.id}`)}
                                                >
                                                    Lihat Detail
                                                </Button>
                                                {ticket.status === 'processed' && (
                                                    <Button
                                                        size="sm"
                                                        className="bg-blue-600 hover:bg-blue-700 font-bold rounded-xl shadow-lg shadow-blue-500/20"
                                                        onClick={() => handleQuickAction(ticket.id, 'start_repair')}
                                                    >
                                                        Mulai Perbaikan
                                                    </Button>
                                                )}
                                                {ticket.status === 'repairing' && (
                                                    <Button
                                                        size="sm"
                                                        className="bg-green-600 hover:bg-green-700 font-bold rounded-xl shadow-lg shadow-green-500/20"
                                                        onClick={() => handleQuickAction(ticket.id, 'complete')}
                                                    >
                                                        Tandai Selesai
                                                    </Button>
                                                )}
                                            </div>
                                        </div>

                                        {ticket.progress && ticket.progress.length > 0 && (
                                            <div className="mt-4 p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100/50 dark:border-blue-900/30 flex items-start gap-3">
                                                <MessageSquare className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs dark:text-slate-300 leading-normal">
                                                        <span className="font-bold text-blue-700 dark:text-blue-400">Update:</span> {ticket.progress[0].note || `Status diubah menjadi ${getStatusText(ticket.progress[0].status)}`}
                                                    </p>
                                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-medium">
                                                        {new Date(ticket.progress[0].created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}