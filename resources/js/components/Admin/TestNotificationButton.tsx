import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Send, Users } from 'lucide-react';

export function TestNotificationButton() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState('Pengumuman APLIKASI SIPERKASA');
    const [message, setMessage] = useState('Halo! Semua Personil Dimohon untuk segera login ke aplikasi SIPERKASA untuk melakukan absensi.');
    const [recipientType, setRecipientType] = useState('all');

    const handleSend = async () => {
        try {
            setLoading(true);
            const csrfMeta = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null;

            const response = await fetch('/admin/notifications/test', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfMeta?.content || '',
                },
                body: JSON.stringify({ title, message, recipient_type: recipientType }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Gagal mengirim notifikasi');
            }

            toast.success(result.message || 'Notifikasi berhasil dikirim!');
            setOpen(false);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Terjadi kesalahan');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <Send className="h-4 w-4" />
                    Kirim Notifikasi
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Kirim Notifikasi</DialogTitle>
                    <DialogDescription>
                        Ini akan mengirimkan notifikasi push (FCM) dan notifikasi sistem ke SEMUA user yang terdaftar.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="recipient">Tujuan Pengiriman</Label>
                        <Select value={recipientType} onValueChange={setRecipientType}>
                            <SelectTrigger id="recipient">
                                <SelectValue placeholder="Pilih tujuan..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua User Terdaftar</SelectItem>
                                <SelectItem value="technician">Semua Teknisi</SelectItem>
                                <SelectItem value="user">Semua User Biasa</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="title">Judul Notifikasi</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Masukkan judul..."
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="message">Pesan Notifikasi</Label>
                        <Textarea
                            id="message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Masukkan pesan..."
                            className="min-h-[100px]"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                        Batal
                    </Button>
                    <Button type="button" onClick={handleSend} disabled={loading}>
                        {loading ? 'Mengirim...' : 'Kirim Sekarang'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
