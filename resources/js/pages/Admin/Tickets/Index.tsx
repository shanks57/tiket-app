import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Head, router, useForm, Link } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import Pagination from '@/components/Pagination';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dasbor', href: '/dashboard' },
    { title: 'Tiket', href: '/admin/tickets' },
];

interface Ticket {
    id: number;
    ticket_number: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    location: string;
    user: { name: string };
    category: { name: string };
    assignees: { name: string }[];
}

interface User {
    id: number;
    name: string;
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
        assigned_to: string;
        date_from: string;
    };
    users: User[];
    counts: {
        open: number;
        in_progress: number;
        resolved_today: number;
        total: number;
    };
}

export default function Index({ tickets, filters, users, counts }: Props) {
    const { data, setData, get, processing } = useForm({
        search: filters.search || '',
        status: filters.status || '',
        priority: filters.priority || '',
        assigned_to: filters.assigned_to || '',
        date_from: filters.date_from || '',
    });

    const handleFilter = () => {
        get('/admin/tickets', {
            preserveState: true,
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
            default: return priority || 'Belum Diatur';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tiket Pemeliharaan" />
            <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 pt-4 px-4 pb-20   md:p-4 rounded-xl transition-colors duration-300">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent mb-6 text-center md:text-left">Tiket Pemeliharaan</h1>

                {/* Counts */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 dark:border dark:border-blue-800/50 shadow-md">
                        <CardHeader className="pb-2 text-center md:text-left">
                            <CardTitle className="text-sm font-semibold text-blue-900 dark:text-blue-100">Tiket Terbuka</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center md:text-left">
                            <div className="text-3xl font-bold text-blue-700 dark:text-blue-400">{counts.open}</div>
                        </CardContent>
                    </Card>
                    <Card className="border-0 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/20 dark:border dark:border-amber-800/50 shadow-md">
                        <CardHeader className="pb-2 text-center md:text-left">
                            <CardTitle className="text-sm font-semibold text-amber-900 dark:text-amber-100">Sedang Dikerjakan</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center md:text-left">
                            <div className="text-3xl font-bold text-amber-700 dark:text-amber-400">{counts.in_progress}</div>
                        </CardContent>
                    </Card>
                    <Card className="border-0 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/30 dark:to-green-800/20 dark:border dark:border-green-800/50 shadow-md">
                        <CardHeader className="pb-2 text-center md:text-left">
                            <CardTitle className="text-sm font-semibold text-green-900 dark:text-green-100">Diselesaikan Hari Ini</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center md:text-left">
                            <div className="text-3xl font-bold text-green-700 dark:text-green-400">{counts.resolved_today}</div>
                        </CardContent>
                    </Card>
                    <Card className="border-0 bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-800/20 dark:border dark:border-indigo-800/50 shadow-md">
                        <CardHeader className="pb-2 text-center md:text-left">
                            <CardTitle className="text-sm font-semibold text-purple-900 dark:text-purple-100">Total Tiket</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center md:text-left">
                            <div className="text-3xl font-bold text-purple-700 dark:text-purple-400">{counts.total}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <div className="bg-gradient-to-r from-white to-blue-50 dark:from-slate-900 dark:to-slate-800 p-4 rounded-xl mb-6 flex gap-4 flex-wrap border border-blue-200 dark:border-slate-800 shadow-sm transition-colors">
                    <Input
                        placeholder="Cari tiket..."
                        value={data.search}
                        onChange={(e) => setData('search', e.target.value)}
                        className="border-blue-200 dark:border-slate-700 dark:bg-slate-900 focus:border-blue-500 focus:ring-blue-500 w-full md:w-auto md:flex-1 min-w-[200px]"
                    />
                    <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                        <SelectTrigger className="w-full md:w-32 border-blue-200 dark:border-slate-700 dark:bg-slate-900 focus:border-blue-500 focus:ring-blue-500">
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
                    <Select value={data.priority} onValueChange={(value) => setData('priority', value)}>
                        <SelectTrigger className="w-full md:w-32 border-blue-200 dark:border-slate-700 dark:bg-slate-900 focus:border-blue-500 focus:ring-blue-500">
                            <SelectValue placeholder="Prioritas" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Prioritas</SelectItem>
                            <SelectItem value="low">Rendah</SelectItem>
                            <SelectItem value="medium">Sedang</SelectItem>
                            <SelectItem value="high">Tinggi</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={data.assigned_to} onValueChange={(value) => setData('assigned_to', value)}>
                        <SelectTrigger className="w-full md:w-40 border-blue-200 dark:border-slate-700 dark:bg-slate-900 focus:border-blue-500 focus:ring-blue-500">
                            <SelectValue placeholder="Ditugaskan Ke" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Pengguna</SelectItem>
                            <SelectItem value="me">Ditugaskan kepada Saya</SelectItem>
                            {users.map((user) => (
                                <SelectItem key={user.id} value={user.id.toString()}>
                                    {user.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={data.date_from} onValueChange={(value) => setData('date_from', value)}>
                        <SelectTrigger className="w-full md:w-32 border-blue-200 dark:border-slate-700 dark:bg-slate-900 focus:border-blue-500 focus:ring-blue-500">
                            <SelectValue placeholder="Periode" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Waktu</SelectItem>
                            <SelectItem value="today">Hari Ini</SelectItem>
                            <SelectItem value="7days">7 Hari Terakhir</SelectItem>
                            <SelectItem value="14days">14 Hari Terakhir</SelectItem>
                            <SelectItem value="30days">30 Hari Terakhir</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button onClick={handleFilter} disabled={processing} className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-500 dark:to-blue-600 text-white font-bold shadow-md">
                        Filter
                    </Button>
                </div>

                {/* Create New Ticket Button */}
                <div className="flex justify-end mb-6">
                    <Link href="/tickets/create">
                        <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold">Buat Tiket Baru</Button>
                    </Link>
                </div>

                {/* Tickets */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tickets.data.map((ticket) => (
                        <Link key={ticket.id} href={`/admin/tickets/${ticket.id}`} className="block group">
                            <Card className="border-0 bg-gradient-to-br from-white to-blue-50 dark:from-slate-900 dark:to-slate-800 dark:border dark:border-slate-800 shadow-md hover:shadow-xl dark:hover:border-blue-600/50 transition-all duration-300 transform group-hover:-translate-y-1">
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start mb-2">
                                        <CardTitle className="text-base font-bold text-blue-900 dark:text-blue-100 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{ticket.title}</CardTitle>
                                        <Badge variant="outline" className={`${getStatusColor(ticket.status)} border whitespace-nowrap dark:bg-transparent text-[10px] font-bold`}>
                                            {getStatusText(ticket.status)}
                                        </Badge>
                                    </div>
                                    <div className="text-[11px] font-semibold text-blue-600/70 dark:text-blue-400/70 tracking-wider">
                                        #{ticket.ticket_number} • {ticket.category.name.toUpperCase()}
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed h-8">
                                        {ticket.description}
                                    </p>
                                    <div className="flex justify-between items-center pt-3 border-t border-blue-50 dark:border-slate-700">
                                        <div className="text-sm">
                                            <Badge variant="outline" className={`${getPriorityColor(ticket.priority)} border-0 font-bold dark:bg-transparent text-[10px]`}>
                                                {getPriorityText(ticket.priority)}
                                            </Badge>
                                        </div>
                                        <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tighter">
                                            {ticket.user.name}
                                        </div>
                                    </div>
                                    {ticket.assignees && ticket.assignees.length > 0 && (
                                        <div className="text-[10px] text-blue-600/60 dark:text-blue-400/60 font-medium italic pt-1 text-right">
                                            Ditugaskan ke: {ticket.assignees.map(a => a.name).join(', ')}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>

                {/* Pagination */}
                <Pagination links={tickets.links} />
            </div>
        </AppLayout>
    );
}