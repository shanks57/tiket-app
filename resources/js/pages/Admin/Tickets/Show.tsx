import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { router, useForm } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { FileText, X, Wrench, MessageSquare, Clock } from 'lucide-react';
import { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { SharedData } from '@/types';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dasbor', href: '/dashboard' },
    { title: 'Tiket', href: '/admin/tickets' },
    { title: 'Detail Tiket', href: '#' },
];

interface Ticket {
    id: number;
    ticket_number: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    location: string;
    user: { name: string; username: string };
    category: { id: number; name: string };
    assignees: { id: number; name: string }[];
    sla: { priority: string; response_time_minutes: number; resolution_time_minutes: number } | null;
    created_at: string;
    responded_at: string | null;
    resolved_at: string | null;
}

interface Progress {
    id: number;
    status: string;
    note: string | null;
    updated_by: { name: string };
    created_at: string;
}

interface Attachment {
    id: number;
    file_path: string;
    file_type: string;
    uploaded_by: { name: string };
    created_at: string;
}

interface Comment {
    id: number;
    comment: string;
    user: { name: string; role: string };
    attachments: Attachment[];
    created_at: string;
}

interface Props {
    ticket: Ticket;
    progress: Progress[];
    attachments: Attachment[];
    comments: Comment[];
    categories: { id: number; name: string }[];
    users: { id: number; name: string }[];
}

export default function Show({ ticket, progress, attachments, comments, categories, users }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        title: ticket.title,
        description: ticket.description,
        category_id: ticket.category.id.toString(),
        priority: ticket.priority || '',
        location: ticket.location,
        assignees: ticket.assignees?.map(a => a.id.toString()) || [],
        status: ticket.status,
    });

    const { data: commentData, setData: setCommentData, post: postComment, processing: commentProcessing, reset: resetComment } = useForm({
        comment: '',
        attachments: [] as File[],
    });

    const [selectedAttachment, setSelectedAttachment] = useState<Attachment | null>(null);

    const isCompleted = ticket.status === 'done';

    // Multiple select toggle helper
    const toggleAssignee = (userId: string) => {
        const currentAssignees = data.assignees;
        if (currentAssignees.includes(userId)) {
            setData('assignees', currentAssignees.filter(id => id !== userId));
        } else {
            setData('assignees', [...currentAssignees, userId]);
        }
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/tickets/${ticket.id}`, {
            onSuccess: () => {
                toast.success('Tiket berhasil diperbarui!');
            },
            onError: () => {
                toast.error('Gagal memperbarui tiket.');
            }
        });
    };

    const handleCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('comment', commentData.comment);

        if (commentData.attachments && commentData.attachments.length > 0) {
            commentData.attachments.forEach((file, index) => {
                formData.append(`attachments[${index}]`, file);
            });
        }

        postComment(`/tickets/${ticket.id}/comments`, {
            forceFormData: true,
            onSuccess: () => {
                resetComment();
                toast.success('Komentar berhasil ditambahkan!');
            },
            onError: () => {
                toast.error('Gagal menambahkan komentar.');
            }
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

    const isImageFile = (filePath: string) => {
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
        return imageExtensions.some(ext => filePath.toLowerCase().endsWith(ext));
    };

    const isVideoFile = (filePath: string) => {
        const videoExtensions = ['.mp4', '.avi', '.mov', '.mkv', '.webm', '.flv'];
        return videoExtensions.some(ext => filePath.toLowerCase().endsWith(ext));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Tiket #${ticket.ticket_number}`} />
            <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 pt-4 px-4 pb-20   md:p-4 rounded-xl transition-colors duration-300">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">Tiket #{ticket.ticket_number}</h1>
                        <Badge variant="outline" className={`${getStatusColor(ticket.status)} border whitespace-nowrap dark:bg-transparent font-bold`}>
                            {getStatusText(ticket.status)}
                        </Badge>
                    </div>
                    {!isCompleted && !ticket.assignees.some(a => a.id === usePage<SharedData>().props.auth.user.id) && (
                        <Button
                            onClick={() => router.post(`/admin/tickets/${ticket.id}/claim`, {}, {
                                onSuccess: () => {
                                    toast.success('Berhasil mengambil tiket ini!');
                                },
                                onError: () => {
                                    toast.error('Gagal mengambil tiket.');
                                }
                            })}
                            className="bg-green-600 hover:bg-green-700 text-white"
                        >
                            Ambil Tiket Ini
                        </Button>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Ticket Details Form */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="border-0 bg-gradient-to-br from-white to-blue-50 dark:from-slate-900 dark:to-slate-800 dark:border dark:border-slate-800 shadow-lg">
                            <CardHeader className="border-b border-blue-50 dark:border-slate-700/50 pb-4">
                                <CardTitle className="text-blue-900 dark:text-blue-100 flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    Informasi Tiket
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                {isCompleted && (
                                    <div className="mb-6 p-4 bg-red-50/50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-900/50 flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                        <p className="text-sm font-semibold tracking-tight">Tiket sudah dalam kondisi SELESAI dan tidak dapat dimodifikasi kembali.</p>
                                    </div>
                                )}
                                <form onSubmit={handleUpdate} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="title" className="text-blue-900 dark:text-blue-200 font-bold text-xs uppercase tracking-wider">Judul Laporan</Label>
                                            <Input
                                                id="title"
                                                value={data.title}
                                                onChange={(e) => setData('title', e.target.value)}
                                                required
                                                disabled={isCompleted}
                                                className="border-blue-100 dark:border-slate-700 dark:bg-slate-950 focus:border-blue-500 focus:ring-blue-500 rounded-xl h-11"
                                            />
                                            {errors.title && <p className="text-red-500 text-[11px] mt-1 font-bold">{errors.title}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="category_id" className="text-blue-900 dark:text-blue-200 font-bold text-xs uppercase tracking-wider">Kategori Masalah</Label>
                                            <Select value={data.category_id} onValueChange={(value) => setData('category_id', value)} disabled={isCompleted}>
                                                <SelectTrigger className="border-blue-100 dark:border-slate-700 dark:bg-slate-950 focus:border-blue-500 focus:ring-blue-500 rounded-xl h-11">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="dark:bg-slate-900 dark:border-slate-800">
                                                    {categories.map((category) => (
                                                        <SelectItem key={category.id} value={category.id.toString()}>
                                                            {category.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.category_id && <p className="text-red-500 text-[11px] mt-1 font-bold">{errors.category_id}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="priority" className="text-blue-900 dark:text-blue-200 font-bold text-xs uppercase tracking-wider">Tingkat Prioritas</Label>
                                            <Select value={data.priority} onValueChange={(value) => setData('priority', value)} disabled={isCompleted}>
                                                <SelectTrigger className="border-blue-100 dark:border-slate-700 dark:bg-slate-950 rounded-xl h-11">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="dark:bg-slate-900 dark:border-slate-800">
                                                    <SelectItem value="low">Rendah</SelectItem>
                                                    <SelectItem value="medium">Sedang</SelectItem>
                                                    <SelectItem value="high">Tinggi</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {errors.priority && <p className="text-red-500 text-[11px] mt-1 font-bold">{errors.priority}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="status" className="text-blue-900 dark:text-blue-200 font-bold text-xs uppercase tracking-wider">Status Tiket</Label>
                                            <Select value={data.status} onValueChange={(value) => setData('status', value)} disabled={isCompleted}>
                                                <SelectTrigger className="border-blue-100 dark:border-slate-700 dark:bg-slate-950 rounded-xl h-11">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="dark:bg-slate-900 dark:border-slate-800">
                                                    <SelectItem value="submitted">Diajukan</SelectItem>
                                                    <SelectItem value="processed">Diproses</SelectItem>
                                                    <SelectItem value="repairing">Diperbaiki</SelectItem>
                                                    <SelectItem value="done">Selesai</SelectItem>
                                                    <SelectItem value="rejected">Ditolak</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {errors.status && <p className="text-red-500 text-[11px] mt-1 font-bold">{errors.status}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="location" className="text-blue-900 dark:text-blue-200 font-bold text-xs uppercase tracking-wider">Lokasi Kejadian</Label>
                                            <Input
                                                id="location"
                                                value={data.location}
                                                onChange={(e) => setData('location', e.target.value)}
                                                disabled={isCompleted}
                                                required
                                                className="border-blue-100 dark:border-slate-700 dark:bg-slate-950 rounded-xl h-11"
                                            />
                                            {errors.location && <p className="text-red-500 text-[11px] mt-1 font-bold">{errors.location}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-blue-900 dark:text-blue-200 font-bold text-xs uppercase tracking-wider">Teknisi Penanggung Jawab</Label>
                                            <div className="flex flex-wrap gap-2 pt-1">
                                                {users.map((u) => (
                                                    <Button
                                                        key={`assignee-toggle-${u.id}`}
                                                        type="button"
                                                        variant={data.assignees.includes(u.id.toString()) ? 'default' : 'outline'}
                                                        size="sm"
                                                        disabled={isCompleted}
                                                        onClick={() => toggleAssignee(u.id.toString())}
                                                        className={`rounded-lg h-8 text-[11px] font-bold ${data.assignees.includes(u.id.toString()) ? 'bg-blue-600 dark:bg-blue-700' : 'dark:border-slate-700 dark:text-slate-400'}`}
                                                    >
                                                        {u.name}
                                                    </Button>
                                                ))}
                                            </div>
                                            {errors.assignees && <p className="text-red-500 text-[11px] mt-1 font-bold">{errors.assignees}</p>}
                                        </div>
                                    </div>

                                    <div className="space-y-2 pt-4">
                                        <Label htmlFor="description" className="text-blue-900 dark:text-blue-200 font-bold text-xs uppercase tracking-wider">Deskripsi Lengkap</Label>
                                        <textarea
                                            id="description"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            required
                                            disabled={isCompleted}
                                            rows={6}
                                            className="w-full px-4 py-3 border border-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm leading-relaxed"
                                        />
                                        {errors.description && <p className="text-red-500 text-[11px] mt-1 font-bold">{errors.description}</p>}
                                    </div>

                                    {!isCompleted && (
                                        <Button type="submit" disabled={processing} className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg mt-4">
                                            Simpan Perubahan
                                        </Button>
                                    )}
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Progress Timeline & Activity */}
                    <div className="space-y-6">
                        {/* Progress Timeline */}
                        {/* Progress Timeline */}
                        < Card className="border-0 bg-white/60 dark:bg-slate-900/60 shadow-lg" >
                            <CardHeader className="border-b border-blue-50/50 dark:border-slate-800 pb-3">
                                <CardTitle className="text-sm font-bold dark:text-slate-100 flex items-center gap-2">
                                    <Wrench className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    Linimasa Progres
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-5">
                                <div className="space-y-6">
                                    {progress.map((item, index) => (
                                        <div key={item.id} className="flex gap-4">
                                            <div className="flex flex-col items-center">
                                                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                                                {index < progress.length - 1 && <div className="w-0.5 h-full bg-blue-100 dark:bg-slate-800 my-1"></div>}
                                            </div>
                                            <div className="flex-1 pb-2">
                                                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                                    <Badge variant="outline" className={`${getStatusColor(item.status)} border whitespace-nowrap dark:bg-transparent text-[10px] font-bold`}>
                                                        {getStatusText(item.status).toUpperCase()}
                                                    </Badge>
                                                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight">
                                                        • {item.updated_by.name}
                                                    </span>
                                                </div>
                                                {item.note && (
                                                    <div className="p-3 bg-slate-50 dark:bg-slate-950/50 rounded-lg border border-slate-100 dark:border-slate-800 mb-2">
                                                        <p className="text-xs text-slate-600 dark:text-slate-300 italic leading-relaxed">&ldquo;{item.note}&rdquo;</p>
                                                    </div>
                                                )}
                                                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                                                    {new Date(item.created_at).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Comments Section */}
                        < Card className="border-0 bg-white/60 dark:bg-slate-900/60 shadow-lg" >
                            <CardHeader className="border-b border-blue-50/50 dark:border-slate-800 pb-3">
                                <CardTitle className="text-sm font-bold dark:text-slate-100 flex items-center gap-2">
                                    <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    Diskusi & Komentar
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-5">
                                {/* Add Comment Form */}
                                {!isCompleted ? (
                                    <form onSubmit={handleCommentSubmit} className="mb-8 p-4 bg-blue-50/30 dark:bg-blue-900/10 rounded-xl border border-blue-50 dark:border-blue-900/20">
                                        <div className="space-y-4">
                                            <div>
                                                <Label htmlFor="comment" className="text-xs uppercase font-bold text-blue-900/60 dark:text-slate-400 tracking-widest">Tambah Komentar</Label>
                                                <Textarea
                                                    id="comment"
                                                    value={commentData.comment}
                                                    onChange={(e) => setCommentData('comment', e.target.value)}
                                                    placeholder="Tulis instruksi atau catatan progres..."
                                                    rows={3}
                                                    className="mt-2 text-sm border-blue-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 rounded-xl focus:ring-blue-500"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="comment-attachments" className="text-xs uppercase font-bold text-blue-900/60 dark:text-slate-400 tracking-widest">Lampiran Evidence</Label>
                                                <Input
                                                    id="comment-attachments"
                                                    type="file"
                                                    multiple
                                                    className="mt-2 h-10 text-[11px] border-blue-50 dark:border-slate-800 dark:bg-slate-950 rounded-xl file:text-blue-600 dark:file:text-blue-400 file:font-bold"
                                                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.mp4,.avi,.mov"
                                                    onChange={(e) => setCommentData('attachments', e.target.files ? Array.from(e.target.files) : [])}
                                                />
                                                <p className="text-[10px] text-slate-400 font-bold mt-2">Max 10MB per file • Format: PDF, DOC, JPG, MP4</p>
                                            </div>
                                            <Button type="submit" disabled={commentProcessing} className="w-full h-10 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-bold rounded-xl transition-all">
                                                {commentProcessing ? 'Mengirim...' : 'Kirim Komentar'}
                                            </Button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="mb-8 p-4 border border-dashed rounded-xl bg-slate-50/50 dark:bg-slate-800/20 text-slate-500 dark:text-slate-400 text-center text-xs font-bold uppercase tracking-tighter">
                                        Diskusi ditutup karena tiket sudah selesai.
                                    </div>
                                )}

                                {/* Comments List */}
                                <div className="space-y-6">
                                    {comments.map((comment) => (
                                        <div key={comment.id} className="rounded-xl p-4 bg-white/40 dark:bg-slate-800/40 shadow-sm border border-slate-50 dark:border-slate-800/50">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md">
                                                        {comment.user.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{comment.user.name}</p>
                                                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-tighter">
                                                            {comment.user.role} • {new Date(comment.created_at).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-[13px] text-slate-700 dark:text-slate-300 mb-4 whitespace-pre-wrap leading-relaxed">
                                                {comment.comment}
                                            </p>
                                            {comment.attachments && comment.attachments.length > 0 && (
                                                <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                                                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Lampiran Evidence:</p>
                                                    <div className="grid grid-cols-1 gap-2">
                                                        {comment.attachments.map((attachment) => (
                                                            <div key={attachment.id} className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 rounded-xl group hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
                                                                <div className="flex-1 min-w-0 pr-2">
                                                                    <p className="text-[11px] font-bold truncate text-slate-700 dark:text-slate-300">
                                                                        {attachment.file_path.split('/').pop()}
                                                                    </p>
                                                                </div>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-7 text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 px-3"
                                                                    onClick={() => setSelectedAttachment(attachment)}
                                                                >
                                                                    LIHAT
                                                                </Button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {comments.length === 0 && (
                                        <div className="text-center py-6">
                                            <MessageSquare className="h-8 w-8 text-slate-200 dark:text-slate-800 mx-auto mb-2" />
                                            <p className="text-[11px] text-slate-400 font-bold uppercase">Belum ada diskusi.</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Activity Log */}
                        < Card className="border-0 bg-white/60 dark:bg-slate-900/60 shadow-lg" >
                            <CardHeader className="border-b border-blue-50/50 dark:border-slate-800 pb-3">
                                <CardTitle className="text-sm font-bold dark:text-slate-100 flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    Statistik Waktu
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-5">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-[13px]">
                                        <span className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-tighter">Waktu Lapor:</span>
                                        <span className="text-slate-900 dark:text-slate-200 font-medium">{new Date(ticket.created_at).toLocaleString()}</span>
                                    </div>
                                    {ticket.responded_at && (
                                        <div className="flex justify-between items-center text-[13px]">
                                            <span className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-tighter">Direspons:</span>
                                            <span className="text-blue-600 dark:text-blue-400 font-bold">{new Date(ticket.responded_at).toLocaleString()}</span>
                                        </div>
                                    )}
                                    {ticket.resolved_at && (
                                        <div className="flex justify-between items-center text-[13px]">
                                            <span className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-tighter">Selesai:</span>
                                            <span className="text-green-600 dark:text-green-400 font-bold">{new Date(ticket.resolved_at).toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 mt-2">
                                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">Pelapor: {ticket.user.name} (@{ticket.user.username})</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Attachments */}
                        < Card className="border-0 bg-white/60 dark:bg-slate-900/60 shadow-lg" >
                            <CardHeader className="border-b border-blue-50/50 dark:border-slate-800 pb-3">
                                <CardTitle className="text-sm font-bold dark:text-slate-100 flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    Lampiran Utama
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-5">
                                {attachments.length > 0 ? (
                                    <div className="space-y-3">
                                        {attachments.map((attachment) => (
                                            <div key={attachment.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 rounded-xl group hover:border-blue-200 dark:hover:border-blue-800 transition-all">
                                                <div className="min-w-0 pr-3">
                                                    <p className="text-[11px] font-bold truncate text-slate-800 dark:text-slate-200">{attachment.file_path.split('/').pop()}</p>
                                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase mt-0.5">
                                                        {new Date(attachment.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 px-3 shrink-0"
                                                    onClick={() => setSelectedAttachment(attachment)}
                                                >
                                                    LIHAT
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-6">
                                        <FileText className="h-8 w-8 text-slate-200 dark:text-slate-800 mx-auto mb-2" />
                                        <p className="text-[11px] text-slate-400 font-bold uppercase">Tidak ada lampiran.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Modal Preview Lampiran */}
            {selectedAttachment && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm transition-all animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-white/10">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b dark:border-slate-800 p-5 bg-slate-50/50 dark:bg-slate-900/50">
                            <div className="min-w-0 pr-4">
                                <h2 className="text-lg font-bold truncate text-slate-900 dark:text-slate-100">
                                    {selectedAttachment.file_path.split('/').pop()}
                                </h2>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-tight">
                                    Diupload oleh {selectedAttachment.uploaded_by.name}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedAttachment(null)}
                                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors"
                            >
                                <X className="h-5 w-5 text-slate-500" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-6 flex items-center justify-center bg-slate-100/30 dark:bg-slate-950/30 min-h-[400px]">
                            {isImageFile(selectedAttachment.file_path) ? (
                                <img
                                    src={`/storage/${selectedAttachment.file_path}`}
                                    alt={selectedAttachment.file_path.split('/').pop()}
                                    className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-xl border border-white/5 transition-transform hover:scale-[1.02]"
                                />
                            ) : isVideoFile(selectedAttachment.file_path) ? (
                                <video
                                    controls
                                    className="max-w-full max-h-[60vh] rounded-lg shadow-xl"
                                >
                                    <source src={`/storage/${selectedAttachment.file_path}`} />
                                    Browser Anda tidak mendukung video player.
                                </video>
                            ) : (
                                <div className="text-center p-12 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 shadow-inner">
                                    <FileText className="h-20 w-20 text-blue-100 dark:text-slate-800 mx-auto mb-6" />
                                    <p className="text-slate-600 dark:text-slate-400 font-bold mb-6">Preview tidak tersedia untuk format file ini</p>
                                    <Button asChild className="bg-blue-600 hover:bg-blue-700 h-12 px-8 rounded-xl font-bold">
                                        <a
                                            href={`/storage/${selectedAttachment.file_path}`}
                                            download
                                        >
                                            MUAT TURUN FILE
                                        </a>
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="border-t dark:border-slate-800 p-5 flex gap-3 justify-end items-center bg-slate-50/50 dark:bg-slate-900/50">
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mr-auto uppercase">Security Profile: Static Cloud Scan (CLEAN)</span>
                            <Button
                                variant="outline"
                                onClick={() => setSelectedAttachment(null)}
                                className="h-10 px-6 rounded-xl font-bold dark:border-slate-800 dark:text-slate-100"
                            >
                                TUTUP
                            </Button>
                            <Button
                                asChild
                                className="bg-blue-600 hover:bg-blue-700 h-10 px-6 rounded-xl font-bold"
                            >
                                <a
                                    href={`/storage/${selectedAttachment.file_path}`}
                                    download
                                >
                                    DOWNLOAD
                                </a>
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}