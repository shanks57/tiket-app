import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { router, useForm } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { ArrowLeft, Clock, User, MapPin, FileText, MessageSquare, Wrench, CheckCircle, XCircle, HelpCircle, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dasbor', href: '/dashboard' },
    { title: 'Daftar Tiket', href: '/user/tickets' },
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
    user: { name: string; email: string };
    category: { name: string };
    assignees: { name: string }[];
    sla: { response_time_minutes: number; resolution_time_minutes: number } | null;
    created_at: string;
    updated_at: string;
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
}

export default function Show({ ticket, progress, attachments, comments }: Props) {
    const { data: commentData, setData: setCommentData, post: postComment, processing: commentProcessing, reset: resetComment } = useForm({
        comment: '',
        attachments: [] as File[],
    });

    const [selectedAttachment, setSelectedAttachment] = useState<Attachment | null>(null);

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
            onSuccess: () => {
                resetComment();
                toast.success('Komentar berhasil ditambahkan!');
            },
            onError: () => {
                toast.error('Gagal menambahkan komentar.');
            },
            forceFormData: true,
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'submitted': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
            case 'processed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
            case 'repairing': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
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
            case 'submitted': return <FileText className="h-4 w-4" />;
            case 'processed': return <Clock className="h-4 w-4" />;
            case 'repairing': return <Wrench className="h-4 w-4" />;
            case 'done': return <CheckCircle className="h-4 w-4" />;
            case 'rejected': return <XCircle className="h-4 w-4" />;
            default: return <HelpCircle className="h-4 w-4" />;
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
            <Head title={`Tiket ${ticket.ticket_number}`} />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl px-4 pt-4 pb-20   md:p-4 bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-slate-950 dark:via-blue-950 dark:to-cyan-950 transition-colors duration-300">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <Button variant="outline" onClick={() => router.visit('/user/tickets')} className="border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 dark:text-blue-100">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Kembali ke Daftar Tiket
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">Tiket #{ticket.ticket_number}</h1>
                        <p className="text-slate-600 dark:text-slate-400">{ticket.title}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Ticket Details */}
                        <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 dark:border dark:border-blue-800/50 shadow-md">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
                                    <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    Detail Tiket
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <Badge className={getStatusColor(ticket.status)}>
                                        {getStatusIcon(ticket.status)} {getStatusText(ticket.status)}
                                    </Badge>
                                    <Badge variant="outline" className={getPriorityColor(ticket.priority)}>
                                        Prioritas {getPriorityText(ticket.priority)}
                                    </Badge>
                                </div>

                                <div>
                                    <h3 className="font-semibold mb-2 dark:text-blue-100">Deskripsi</h3>
                                    <p className="text-sm text-muted-foreground dark:text-slate-300 whitespace-pre-wrap">
                                        {ticket.description}
                                    </p>
                                </div>

                                <Separator className="dark:bg-blue-800/50" />

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-blue-600/70 dark:text-blue-400/70" />
                                        <span className="text-muted-foreground dark:text-slate-400">Lokasi:</span>
                                        <span className="dark:text-slate-200">{ticket.location}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <HelpCircle className="h-4 w-4 text-blue-600/70 dark:text-blue-400/70" />
                                        <span className="text-muted-foreground dark:text-slate-400">Kategori:</span>
                                        <span className="dark:text-slate-200">{ticket.category.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-blue-600/70 dark:text-blue-400/70" />
                                        <span className="text-muted-foreground dark:text-slate-400">Dibuat:</span>
                                        <span className="dark:text-slate-200">{new Date(ticket.created_at).toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-blue-600/70 dark:text-blue-400/70" />
                                        <span className="text-muted-foreground dark:text-slate-400">Ditugaskan ke:</span>
                                        <span className="dark:text-slate-200 font-medium">{ticket.assignees && ticket.assignees.length > 0 ? ticket.assignees.map(a => a.name).join(', ') : 'Belum ditugaskan'}</span>
                                    </div>
                                </div>

                                {ticket.sla && (
                                    <>
                                        <Separator className="dark:bg-blue-800/50" />
                                        <div>
                                            <h4 className="font-semibold mb-2 dark:text-blue-100">Informasi SLA</h4>
                                            <div className="text-sm space-y-1">
                                                <p className="dark:text-slate-300">Waktu Respons: <span className="font-medium">{Math.floor(ticket.sla.response_time_minutes / 60)}j {ticket.sla.response_time_minutes % 60}m</span></p>
                                                <p className="dark:text-slate-300">Waktu Penyelesaian: <span className="font-medium">{Math.floor(ticket.sla.resolution_time_minutes / 60)}j {ticket.sla.resolution_time_minutes % 60}m</span></p>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* Progress Timeline */}
                        <Card className="border-0 bg-white/60 dark:bg-slate-900/60 shadow-md">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                                    <Wrench className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    Linimasa Progres
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {progress.length === 0 ? (
                                    <p className="text-muted-foreground text-center py-4">
                                        Belum ada pembaruan progress.
                                    </p>
                                ) : (
                                    <div className="space-y-4">
                                        {progress.map((item, index) => (
                                            <div key={item.id} className="flex gap-4">
                                                <div className="flex flex-col items-center">
                                                    <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800 flex items-center justify-center text-sm font-semibold">
                                                        {getStatusIcon(item.status)}
                                                    </div>
                                                    {index < progress.length - 1 && (
                                                        <div className="w-0.5 h-full bg-slate-100 dark:bg-slate-800 my-1"></div>
                                                    )}
                                                </div>
                                                <div className="flex-1 pb-6">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <h4 className="font-semibold dark:text-slate-100">
                                                            Status: {getStatusText(item.status)}
                                                        </h4>
                                                        <span className="text-sm text-muted-foreground dark:text-slate-400">
                                                            {new Date(item.created_at).toLocaleString()}
                                                        </span>
                                                    </div>
                                                    {item.note && (
                                                        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800 mt-2">
                                                            <p className="text-sm text-slate-600 dark:text-slate-300 italic">
                                                                &ldquo;{item.note}&rdquo;
                                                            </p>
                                                        </div>
                                                    )}
                                                    <p className="text-xs text-muted-foreground dark:text-slate-500 mt-2 flex items-center gap-1">
                                                        <User className="h-3 w-3" />
                                                        Diperbarui oleh {item.updated_by.name}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Comments Section */}
                        < Card className="border-0 bg-white/60 dark:bg-slate-900/60 shadow-md" >
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                                    <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    Komentar
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {/* Add Comment Form */}
                                {ticket.status !== 'done' ? (
                                    <form onSubmit={handleCommentSubmit} className="mb-8 p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30">
                                        <div className="space-y-4">
                                            <div>
                                                <Label htmlFor="comment" className="dark:text-slate-200">Tambah Komentar</Label>
                                                <Textarea
                                                    id="comment"
                                                    value={commentData.comment}
                                                    onChange={(e) => setCommentData('comment', e.target.value)}
                                                    placeholder="Tulis pesan atau pertanyaan Anda di sini..."
                                                    rows={3}
                                                    className="dark:bg-slate-950 dark:border-slate-800 mt-1.5"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="comment-attachments" className="dark:text-slate-200">Lampiran (opsional)</Label>
                                                <Input
                                                    id="comment-attachments"
                                                    type="file"
                                                    multiple
                                                    className="dark:bg-slate-950 dark:border-slate-800 mt-1.5"
                                                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.mp4,.avi,.mov"
                                                    onChange={(e) => setCommentData('attachments', e.target.files ? Array.from(e.target.files) : [])}
                                                />
                                                <p className="text-[11px] text-muted-foreground mt-1.5 dark:text-slate-500">
                                                    Maksimal 10MB per file. Didukung: PDF, DOC, JPG, PNG, MP4, AVI
                                                </p>
                                            </div>
                                            <Button type="submit" disabled={commentProcessing} className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600">
                                                {commentProcessing ? 'Sedang Mengirim...' : 'Kirim Komentar'}
                                            </Button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="mb-8 p-4 border border-dashed rounded-xl bg-slate-50/50 dark:bg-slate-800/20 text-slate-500 dark:text-slate-400 text-center text-sm font-medium">
                                        Tiket telah selesai. Penambahan komentar sudah ditutup.
                                    </div>
                                )}

                                {/* Comments List */}
                                <div className="space-y-6">
                                    {comments.map((comment) => (
                                        <div key={comment.id} className="border-0 rounded-xl p-5 bg-white/40 dark:bg-slate-800/40 shadow-sm">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md">
                                                        {comment.user.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900 dark:text-slate-100">{comment.user.name}</p>
                                                        <p className="text-[11px] text-muted-foreground dark:text-slate-400 font-medium">
                                                            {comment.user.role.toUpperCase()} • {new Date(comment.created_at).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-[13px] text-slate-700 dark:text-slate-300 mb-4 whitespace-pre-wrap leading-relaxed">
                                                {comment.comment}
                                            </p>
                                            {comment.attachments && comment.attachments.length > 0 && (
                                                <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                                                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Lampiran Komentar:</p>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                        {comment.attachments.map((attachment) => (
                                                            <div key={attachment.id} className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg group hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
                                                                <div className="flex-1 min-w-0 pr-2">
                                                                    <p className="text-xs font-bold truncate text-slate-700 dark:text-slate-300">
                                                                        {attachment.file_path.split('/').pop()}
                                                                    </p>
                                                                </div>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-7 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 px-3"
                                                                    onClick={() => setSelectedAttachment(attachment)}
                                                                >
                                                                    Lihat
                                                                </Button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {comments.length === 0 && (
                                        <div className="text-center py-10">
                                            <MessageSquare className="h-10 w-10 text-slate-200 dark:text-slate-800 mx-auto mb-2" />
                                            <p className="text-muted-foreground text-sm font-medium">Belum ada komentar.</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Attachments */}
                        <Card className="border-0 bg-white/60 dark:bg-slate-900/60 shadow-md overflow-hidden">
                            <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 pb-3">
                                <CardTitle className="text-sm font-bold flex items-center gap-2 dark:text-slate-100">
                                    <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    Lampiran Tiket
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                {attachments.length === 0 ? (
                                    <div className="py-10 text-center">
                                        <FileText className="h-8 w-8 text-slate-200 dark:text-slate-800 mx-auto mb-2" />
                                        <p className="text-[11px] text-muted-foreground font-medium">Tidak ada lampiran.</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {attachments.map((attachment) => (
                                            <div key={attachment.id} className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group">
                                                <div className="flex-1 min-w-0 pr-3">
                                                    <p className="text-xs font-bold truncate text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                                        {attachment.file_path.split('/').pop()}
                                                    </p>
                                                    <p className="text-[10px] text-muted-foreground dark:text-slate-400 mt-0.5">
                                                        {attachment.uploaded_by.name} • {new Date(attachment.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/40"
                                                    onClick={() => setSelectedAttachment(attachment)}
                                                >
                                                    Lihat
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Quick Stats */}
                        <Card className="border-0 bg-gradient-to-br from-indigo-50/50 to-blue-50/50 dark:from-indigo-900/10 dark:to-blue-900/10 dark:border dark:border-indigo-800/20 shadow-md">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-bold dark:text-indigo-100">Informasi Status</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-muted-foreground dark:text-slate-400 font-medium">Status Saat Ini:</span>
                                    <Badge variant="outline" className={`${getStatusColor(ticket.status)} border-0 font-bold`}>
                                        {getStatusText(ticket.status)}
                                    </Badge>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-muted-foreground dark:text-slate-400 font-medium">Prioritas:</span>
                                    <Badge variant="outline" className={`${getPriorityColor(ticket.priority)} border-0 font-bold`}>
                                        {getPriorityText(ticket.priority)}
                                    </Badge>
                                </div>
                                {ticket.responded_at && (
                                    <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                                        <span className="text-muted-foreground dark:text-slate-400 font-medium">Direspons:</span>
                                        <span className="dark:text-slate-300 font-semibold">{new Date(ticket.responded_at).toLocaleDateString()}</span>
                                    </div>
                                )}
                                {ticket.resolved_at && (
                                    <div className="flex justify-between items-center text-xs pt-1">
                                        <span className="text-muted-foreground dark:text-slate-400 font-medium">Diselesaikan:</span>
                                        <span className="dark:text-green-400 font-semibold text-green-600">{new Date(ticket.resolved_at).toLocaleDateString()}</span>
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
                                <p className="text-xs text-slate-500 font-medium">
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
                                    className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-xl border border-white/5"
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
                                            Klik untuk Download
                                        </a>
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="border-t dark:border-slate-800 p-5 flex gap-3 justify-end items-center bg-slate-50/50 dark:bg-slate-900/50">
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mr-auto">UKURAN FILE: DAPAT DIAKSES VIA DOWNLOAD</span>
                            <Button
                                variant="outline"
                                onClick={() => setSelectedAttachment(null)}
                                className="h-10 px-6 rounded-xl font-bold dark:border-slate-800"
                            >
                                Tutup
                            </Button>
                            <Button
                                asChild
                                className="bg-blue-600 hover:bg-blue-700 h-10 px-6 rounded-xl font-bold"
                            >
                                <a
                                    href={`/storage/${selectedAttachment.file_path}`}
                                    download
                                >
                                    Download File
                                </a>
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}