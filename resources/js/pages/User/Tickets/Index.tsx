import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { router, Link } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { CheckCircle, Clock, Wrench, AlertTriangle, Plus, Eye, XCircle, FileText } from 'lucide-react';
import Pagination from '@/components/Pagination';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dasbor', href: '/dashboard' },
    { title: 'Daftar Tiket', href: '/user/tickets' },
];

interface Ticket {
    id: number;
    ticket_number: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    location: string;
    category: { name: string };
    assignees: { name: string }[];
    created_at: string;
    updated_at: string;
    progress?: Array<{
        status: string;
        note?: string;
        created_at: string;
    }>;
}

interface Props {
    tickets: {
        data: Ticket[];
        links: any[];
    };
    filters: {
        search: string;
        status: string;
        priority: string;
    };
    stats: {
        total: number;
        open: number;
        in_progress: number;
        resolved: number;
    };
}

export default function Index({ tickets, filters, stats }: Props) {
    const handleFilter = () => {
        router.get('/user/tickets', {
            search: filters.search,
            status: filters.status,
            priority: filters.priority,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'submitted': return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900/50';
            case 'processed': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/50';
            case 'repairing': return 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-900/50';
            case 'done': return 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-900/50';
            case 'rejected': return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/50';
            default: return 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-900/50';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'low': return 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-900/50';
            case 'medium': return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900/50';
            case 'high': return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/50';
            default: return 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-900/50';
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Daftar Tiket" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl px-4 pt-4 pb-20   md:p-4 bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-slate-950 dark:via-blue-950 dark:to-cyan-950 transition-colors duration-300">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">Daftar Tiket</h1>
                    <Link href="/tickets/create">
                        <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg dark:from-blue-500 dark:to-blue-600">
                            <Plus className="mr-2 h-4 w-4" />
                            Buat Tiket Baru
                        </Button>
                    </Link>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                    <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 dark:border dark:border-blue-800/50 shadow-md">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100">Total Tiket</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.total}</div>
                            <p className="text-xs text-blue-600 dark:text-blue-400/80">Semua tiket saya</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 dark:border dark:border-amber-800/50 shadow-md">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-amber-900 dark:text-amber-100">Terbuka</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">{stats.open}</div>
                            <p className="text-xs text-amber-600 dark:text-amber-400/80">Menunggu respons</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 dark:border dark:border-purple-800/50 shadow-md">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-purple-900 dark:text-purple-100">Sedang Dikerjakan</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">{stats.in_progress}</div>
                            <p className="text-xs text-purple-600 dark:text-purple-400/80">Sedang dikerjakan</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 dark:border dark:border-green-800/50 shadow-md">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-green-900 dark:text-green-100">Diselesaikan</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.resolved}</div>
                            <p className="text-xs text-green-600 dark:text-green-400/80">Tiket selesai</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 bg-gradient-to-r from-white to-blue-50 dark:from-slate-900 dark:to-slate-800 p-4 rounded-xl border border-blue-100 dark:border-slate-800 shadow-sm transition-colors">
                    <Input
                        placeholder="Cari tiket..."
                        className="dark:bg-slate-900 dark:border-slate-700"
                        value={filters.search}
                        onChange={(e) => router.get('/user/tickets', {
                            ...filters,
                            search: e.target.value
                        }, { preserveState: true, replace: true })}
                    />
                    <Select
                        value={filters.status}
                        onValueChange={(value) => router.get('/user/tickets', {
                            ...filters,
                            status: value
                        }, { preserveState: true, replace: true })}
                    >
                        <SelectTrigger className="w-full md:w-40 dark:bg-slate-900 dark:border-slate-700">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Status</SelectItem>
                            <SelectItem value="submitted">Diajukan</SelectItem>
                            <SelectItem value="processed">Diproses</SelectItem>
                            <SelectItem value="repairing">Diperbaiki</SelectItem>
                            <SelectItem value="done">Selesai</SelectItem>
                            <SelectItem value="rejected">Ditolak</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select
                        value={filters.priority}
                        onValueChange={(value) => router.get('/user/tickets', {
                            ...filters,
                            priority: value
                        }, { preserveState: true, replace: true })}
                    >
                        <SelectTrigger className="w-full md:w-40 dark:bg-slate-900 dark:border-slate-700">
                            <SelectValue placeholder="Prioritas" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Prioritas</SelectItem>
                            <SelectItem value="low">Rendah</SelectItem>
                            <SelectItem value="medium">Sedang</SelectItem>
                            <SelectItem value="high">Tinggi</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Tickets List */}
                <div className="space-y-4">
                    {tickets.data.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">Tidak ada tiket ditemukan</h3>
                                <p className="text-muted-foreground text-center mb-4">
                                    Anda belum membuat tiket apapun, atau tidak ada tiket yang cocok dengan filter Anda.
                                </p>
                                <Link href="/tickets/create">
                                    <Button>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Buat Tiket Pertama Anda
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ) : (
                        tickets.data.map((ticket) => (
                            <div key={ticket.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border border-blue-100 dark:border-slate-800 rounded-xl bg-white/60 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-900 transition-all gap-3 shadow-sm group">
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-2 mb-3">
                                        <span className="font-bold text-blue-900 dark:text-blue-300 mr-2">{ticket.ticket_number}</span>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Badge variant="outline" className={`${getStatusColor(ticket.status)} whitespace-nowrap border dark:bg-transparent`}>
                                                {getStatusIcon(ticket.status)}
                                                <span className="ml-1.5 font-semibold text-xs transition-colors">{getStatusText(ticket.status)}</span>
                                            </Badge>
                                            <Badge variant="outline" className={`${getPriorityColor(ticket.priority)} whitespace-nowrap border dark:bg-transparent`}>
                                                <span className="font-semibold text-xs transition-colors">{getPriorityText(ticket.priority) || 'Belum Diatur'}</span>
                                            </Badge>
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-700 dark:text-slate-200 mb-1 break-words font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{ticket.title}</p>
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 text-xs text-slate-500 dark:text-slate-400">
                                        <span className="flex items-center gap-1.5">
                                            <FileText className="h-3 w-3" />
                                            Kategori: {ticket.category.name}
                                        </span>

                                        {ticket.progress && ticket.progress.length > 0 && (
                                            <span className="flex items-center gap-1.5">
                                                <Clock className="h-3 w-3" />
                                                Pembaruan terakhir: {new Date(ticket.progress[0].created_at).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex-shrink-0 w-full md:w-auto mt-3 md:mt-0 md:ml-4">
                                    <Link href={`/user/tickets/${ticket.id}`}>
                                        <Button variant="outline" size="sm" className="w-full md:w-auto justify-center border-blue-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-slate-800 text-blue-600 dark:text-blue-400 font-semibold group-hover:border-blue-400 transition-all shadow-sm">
                                            <Eye className="h-4 w-4" />
                                            <span className="sm:not-sr-only ml-2">Lihat Detail</span>
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Pagination */}
                <Pagination links={tickets.links} />
            </div>
        </AppLayout>
    );
}