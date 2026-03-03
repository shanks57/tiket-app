<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use App\Models\TicketCategory;
use App\Models\Sla;
use App\Models\User;
use App\Models\TicketProgress;
use App\Models\TicketAttachment;
use App\Notifications\TicketCreatedWebPush;
use App\Notifications\TicketUpdatedWebPush;
use App\Helpers\TicketHelper;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth as FacadesAuth;
use Illuminate\Support\Facades\Log;

class TicketController extends Controller
{
    public function index(Request $request)
    {
        $query = Ticket::with(['user', 'category', 'assignees']);

        // Search
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('ticket_number', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($request->has('status') && $request->status && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filter by priority
        if ($request->has('priority') && $request->priority && $request->priority !== 'all') {
            $query->where('priority', $request->priority);
        }

        // Filter by assigned user
        if ($request->has('assigned_to') && $request->assigned_to) {
            if ($request->assigned_to === 'me') {
                $query->whereHas('assignees', function($q) use ($request) {
                    $q->where('users.id', $request->user()->id);
                });
            } elseif ($request->assigned_to === 'unassigned') {
                $query->doesntHave('assignees');
            } else {
                $query->whereHas('assignees', function($q) use ($request) {
                    $q->where('users.id', $request->assigned_to);
                });
            }
        }

        // Filter by date range
        if ($request->has('date_from') && $request->date_from) {
            $dateFrom = $request->date_from;
            switch ($dateFrom) {
                case 'today':
                    $query->whereDate('created_at', Carbon::today());
                    break;
                case '7days':
                    $query->where('created_at', '>=', Carbon::now()->subDays(7));
                    break;
                case '14days':
                    $query->where('created_at', '>=', Carbon::now()->subDays(14));
                    break;
                case '30days':
                    $query->where('created_at', '>=', Carbon::now()->subDays(30));
                    break;
            }
        }

        $tickets = $query->paginate(10);

        // Counts
        $openCount = Ticket::where('status', 'submitted')->count();
        $inProgressCount = Ticket::whereIn('status', ['processed', 'repairing'])->count();
        $resolvedTodayCount = Ticket::where('status', 'done')
            ->whereDate('resolved_at', Carbon::today())
            ->count();
        $totalCount = Ticket::count();

        return Inertia::render('Admin/Tickets/Index', [
            'tickets' => $tickets,
            'filters' => $request->only(['search', 'status', 'priority', 'assigned_to', 'date_from']),
            'users' => User::where('role', 'technician')->select('id', 'name')->get(),
            'counts' => [
                'open' => $openCount,
                'in_progress' => $inProgressCount,
                'resolved_today' => $resolvedTodayCount,
                'total' => $totalCount,
            ],
        ]);
    }

    public function create()
    {
        $categories = TicketCategory::with('subcategories')->get();
        $slas = Sla::all();

        return Inertia::render('Tickets/Create', [
            'categories' => $categories,
            'slas' => $slas,
        ]);
    }

    public function store(Request $request)
    {
        // Debug: Log the request data
        Log::info('Ticket store request data:', $request->all());

        try {
            $request->validate([
                'category_id' => 'required|exists:ticket_categories,id',
                'subcategory_id' => 'nullable|exists:ticket_subcategories,id',
                'title' => 'required|string|max:255',
                'description' => 'required|string',
                'location' => 'required|string|max:255',
                // Priority will be determined by technician, not user
                'priority' => 'nullable|in:low,medium,high',
                'attachments' => 'nullable|array',
                'attachments.*' => 'file|mimes:jpeg,png,jpg,gif,pdf,doc,docx,txt|max:10240', // 10MB max
            ]);

            Log::info('Validation passed');
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation failed:', $e->errors());
            throw $e;
        }
        $user = FacadesAuth::user();

        if (!$user) {
            Log::error('No authenticated user');
            return redirect()->route('login');
        }

        // Debug: Log the user
        Log::info('Authenticated user:', ['id' => $user->id, 'name' => $user->name]);

        // Get SLA based on priority
        $sla = Sla::where('priority', $request->priority)->first();

        // No automatic assignment, technicians pick it up or are assigned later

        try {
            $ticket = Ticket::create([
                'ticket_number' => 'TICK-' . strtoupper(uniqid()),
                'user_id' => $user->id,
                'category_id' => $request->category_id,
                'subcategory_id' => $request->subcategory_id ? (int) $request->subcategory_id : null,
                'sla_id' => $sla ? $sla->id : null,
                'title' => $request->title,
                'description' => $request->description,
                'location' => $request->location,
                'priority' => $request->priority ?? null,
                'status' => 'submitted',
            ]);

            // Create initial progress entry
            TicketProgress::create([
                'ticket_id' => $ticket->id,
                'status' => 'submitted',
                'note' => 'Tiket berhasil diajukan',
                'updated_by' => $user->id,
            ]);

            // Debug: Log ticket creation
            Log::info('Ticket created:', ['id' => $ticket->id, 'ticket_number' => $ticket->ticket_number]);

        } catch (\Exception $e) {
            Log::error('Ticket creation failed:', ['error' => $e->getMessage()]);
            return redirect()->back()->with('error', 'Gagal membuat tiket: ' . $e->getMessage());
        }

        // Handle file uploads
        if ($request->hasFile('attachments')) {
            \Log::info('Processing attachments:', ['count' => count($request->file('attachments'))]);

            foreach ($request->file('attachments') as $file) {
                $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
                $originalName = preg_replace('/[^A-Za-z0-9\-]/', '_', $originalName);
                $extension = $file->getClientOriginalExtension();
                $timestamp = now()->format('YmdHis');
                $newFileName = "{$originalName}_{$timestamp}.{$extension}";
                
                $path = $file->storeAs('ticket-attachments', $newFileName, 'public');

                TicketAttachment::create([
                    'ticket_id' => $ticket->id,
                    'file_path' => $path,
                    'file_type' => $file->getMimeType(),
                    'uploaded_by' => $user->id,
                ]);

                \Log::info('Attachment created:', ['path' => $path, 'type' => $file->getMimeType()]);
            }
        }

        // Notify all technicians without exception
        $technicians = User::where('role', 'technician')->get();

        foreach ($technicians as $technician) {
            try {
                $technician->notify(new TicketCreatedWebPush($ticket));
            } catch (\Exception $e) {
                \Log::error("Failed to notify technician {$technician->id}: " . $e->getMessage());
            }
        }

        return redirect()->route('dashboard')->with('success', 'Tiket berhasil dibuat. Nomor tiket: ' . $ticket->ticket_number);
    }

    public function assign(Request $request, Ticket $ticket)
    {
        if ($ticket->status === 'done') {
            return back()->with('error', 'Tiket telah selesai dan tidak dapat diubah penugasannya.');
        }

        $request->validate([
            'assignees' => 'required|array',
            'assignees.*' => 'exists:users,id',
        ]);

        $ticket->assignees()->sync($request->assignees);
        $ticket->update([
            'status' => 'processed',
            'responded_at' => now(),
        ]);

        // Notify the newly assigned technicians and ticket owner
        $assignees = User::whereIn('id', $request->assignees)->get();
        foreach ($assignees as $assignee) {
            $assignee->notify(new TicketUpdatedWebPush($ticket, 'Anda ditugaskan ke tiket ini.'));
        }

        if ($ticket->user && !$assignees->contains('id', $ticket->user->id)) {
            $ticket->user->notify(new TicketUpdatedWebPush($ticket, 'Tiket Anda telah ditugaskan.'));
        }

        return redirect()->back()->with('success', 'Penugasan berhasil diperbarui.');
    }


    public function update(Request $request, Ticket $ticket)
    {
        if ($ticket->status === 'done') {
            return back()->with('error', 'Tiket telah selesai dan tidak dapat diperbarui.');
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'category_id' => 'required|exists:ticket_categories,id',
            'priority' => 'required|in:low,medium,high',
            'location' => 'required|string|max:255',
            'assignees' => 'nullable|array',
            'assignees.*' => 'exists:users,id',
            'status' => 'required|in:submitted,processed,repairing,done,rejected',
        ]);

        $user = FacadesAuth::user();

        $oldStatus = $ticket->status;
        $ticket->update($request->only([
            'title',
            'description',
            'category_id',
            'priority',
            'location',
            'status'
        ]));

        if ($request->has('assignees')) {
            $ticket->assignees()->sync($request->assignees);
        }

        // Create progress entry if status changed
        if ($oldStatus !== $request->status) {
            TicketProgress::create([
                'ticket_id' => $ticket->id,
                'status' => $request->status,
                'note' => 'Status diperbarui dari ' . TicketHelper::translateStatus($oldStatus) . ' ke ' . TicketHelper::translateStatus($request->status),
                'updated_by' => $user->id,
            ]);
        }

        // Notify ticket owner & assignee (if different from actor)
        if ($ticket->user && $ticket->user->id !== $user->id) {
            $ticket->user->notify(new TicketUpdatedWebPush($ticket, 'Tiket Anda diperbarui'));
        }

        if ($ticket->assignees->count() > 0) {
            foreach ($ticket->assignees as $assigned) {
                if ($assigned->id !== $user->id) {
                    $assigned->notify(new TicketUpdatedWebPush($ticket, 'Tiket yang Anda tangani diperbarui'));
                }
            }
        }

        return redirect()->back()->with('success', 'Tiket berhasil diperbarui.');
    }

    public function updateStatus(Request $request, Ticket $ticket)
    {
        if ($ticket->status === 'done') {
            return back()->with('error', 'Tiket telah selesai dan statusnya tidak dapat diubah.');
        }

        $request->validate([
            'status' => 'required|in:submitted,processed,repairing,done,rejected',
        ]);

        $user = FacadesAuth::user();

        // Check if technician is assigned to this ticket or is admin
        if ($user->role === 'technician' && !$ticket->assignees->contains('id', $user->id)) {
            abort(403, 'Anda hanya dapat memperbarui tiket yang ditugaskan kepada Anda.');
        }

        $oldStatus = $ticket->status;
        $ticket->update(['status' => $request->status]);

        // Set resolved_at if status is done
        if ($request->status === 'done') {
            $ticket->update(['resolved_at' => now()]);
        }

        // Create progress entry
        TicketProgress::create([
            'ticket_id' => $ticket->id,
            'status' => $request->status,
            'note' => 'Status diperbarui dari ' . TicketHelper::translateStatus($oldStatus) . ' ke ' . TicketHelper::translateStatus($request->status),
            'updated_by' => $user->id,
        ]);

        // Notify ticket owner (if they didn't perform the action)
        if ($ticket->user && $ticket->user->id !== $user->id) {
            $ticket->user->notify(new TicketUpdatedWebPush($ticket, 'Status tiket: ' . TicketHelper::translateStatus($ticket->status)));
        }

        // Notify assignees (if exists and not the actor)
        foreach ($ticket->assignees as $assignee) {
            if ($assignee->id !== $user->id) {
                $assignee->notify(new TicketUpdatedWebPush($ticket, 'Status tiket: ' . TicketHelper::translateStatus($ticket->status)));
            }
        }

        return redirect()->back()->with('success', 'Status tiket berhasil diperbarui.');
    }

    public function addProgress(Request $request, Ticket $ticket)
    {
        if ($ticket->status === 'done') {
            return back()->with('error', 'Tiket telah selesai dan tidak dapat ditambah progresnya.');
        }

        $request->validate([
            'note' => 'required|string|max:1000',
        ]);

        $user = FacadesAuth::user();

        // Check if technician is assigned to this ticket or is admin
        if ($user->role === 'technician' && !$ticket->assignees->contains('id', $user->id)) {
            abort(403, 'You can only add progress to tickets assigned to you.');
        }

        TicketProgress::create([
            'ticket_id' => $ticket->id,
            'status' => $ticket->status,
            'note' => $request->note,
            'updated_by' => $user->id,
        ]);

        // Notify ticket owner & assignee (except the actor)
        $participants = collect([$ticket->user])->merge($ticket->assignees)->filter();
        $participants->unique('id')->each(function ($participant) use ($user, $ticket, $request) {
            if ($participant->id === $user->id)
                return;
            $participant->notify(new TicketUpdatedWebPush($ticket, 'Progres baru: ' . \Illuminate\Support\Str::limit($request->note, 100)));
        });

        return redirect()->back()->with('success', 'Progres berhasil ditambahkan.');
    }

    public function claim(Request $request, Ticket $ticket)
    {
        $user = $request->user();

        if ($user->role !== 'technician') {
            abort(403, 'Hanya teknisi yang dapat mengambil tiket.');
        }

        if ($ticket->status === 'done') {
            return back()->with('error', 'Tiket telah selesai.');
        }

        if ($ticket->assignees->contains('id', $user->id)) {
            return back()->with('error', 'Anda sudah ditugaskan ke tiket ini.');
        }

        $ticket->assignees()->attach($user->id);

        if ($ticket->status === 'submitted') {
            $ticket->update([
                'status' => 'processed',
                'responded_at' => now(),
            ]);
        }

        // Create progress entry
        TicketProgress::create([
            'ticket_id' => $ticket->id,
            'status' => $ticket->status,
            'note' => $user->name . ' mengambil tiket ini.',
            'updated_by' => $user->id,
        ]);

        // Notify ticket owner
        if ($ticket->user && $ticket->user->id !== $user->id) {
            $ticket->user->notify(new TicketUpdatedWebPush($ticket, "Tiket Anda telah diambil oleh {$user->name}."));
        }

        return redirect()->back()->with('success', 'Berhasil mengambil tiket.');
    }

    public function userTickets(Request $request)
    {
        $user = $request->user();

        $query = Ticket::with([
            'category',
            'assignees',
            'progress' => function ($query) {
                $query->latest()->limit(1);
            }
        ]);

        // Visibility rules:
        // - admin/technician: see all tickets (handled elsewhere / via admin UI)
        // - regular user: see site-wide active (not-done) tickets + any tickets they created (including done)
        if ($user->role === 'user') {
            $query->where(function ($q) use ($user) {
                $q->whereIn('status', ['submitted', 'processed', 'repairing'])
                    ->orWhere('user_id', $user->id);
            });
        }


        // Search
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('ticket_number', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($request->has('status') && $request->status && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filter by priority
        if ($request->has('priority') && $request->priority && $request->priority !== 'all') {
            $query->where('priority', $request->priority);
        }


        $tickets = $query->orderBy('updated_at', 'desc')->paginate(10);

        // Visibility-aware counts
        $countQuery = Ticket::query();
        if ($user->role === 'user') {
            $countQuery->where(function ($q) use ($user) {
                $q->whereIn('status', ['submitted', 'processed', 'repairing'])
                    ->orWhere('user_id', $user->id);
            });
        }

        $totalTickets = (clone $countQuery)->count();
        $openTickets = (clone $countQuery)->whereIn('status', ['submitted', 'processed'])->count();
        $resolvedTickets = (clone $countQuery)->where('status', 'done')->count();
        $inProgressTickets = (clone $countQuery)->where('status', 'repairing')->count();

        return Inertia::render('User/Tickets/Index', [
            'tickets' => $tickets,
            'filters' => $request->only(['search', 'status', 'priority']),
            'stats' => [
                'total' => $totalTickets,
                'open' => $openTickets,
                'in_progress' => $inProgressTickets,
                'resolved' => $resolvedTickets,
            ],
        ]);
    }

    public function show(Request $request, Ticket $ticket)
    {
        $user = $request->user();

        // Check permissions based on role
        if ($user->role === 'user') {
            // Regular users may view:
            // - any ticket they created
            // - any ticket that is still active (not 'done')
            if ($ticket->user_id !== $user->id && $ticket->status === 'done') {
                abort(403, 'Anda tidak diizinkan melihat tiket ini.');
            }
        }
        // Note: technicians and admins may view any ticket (technician update actions remain restricted elsewhere).

        $ticket->load([
            'user',
            'category',
            'assignees',
            'sla',
            'progress.updatedBy',
            'attachments.uploadedBy',
            'comments' => function ($query) {
                $query->with(['user', 'attachments.uploadedBy'])->orderBy('created_at', 'asc');
            }
        ]);

        // Return different views based on user role
        if ($user->role === 'user') {
            return Inertia::render('User/Tickets/Show', [
                'ticket' => $ticket,
                'progress' => $ticket->progress,
                'attachments' => $ticket->attachments,
                'comments' => $ticket->comments,
            ]);
        } elseif ($user->role === 'technician') {
            return Inertia::render('Admin/Tickets/Show', [
                'ticket' => $ticket,
                'progress' => $ticket->progress,
                'attachments' => $ticket->attachments,
                'comments' => $ticket->comments,
                'categories' => TicketCategory::all(),
                'users' => User::where('role', 'technician')->get(),
            ]);
        } else {
            // Admin
            return Inertia::render('Admin/Tickets/Show', [
                'ticket' => $ticket,
                'progress' => $ticket->progress,
                'attachments' => $ticket->attachments,
                'comments' => $ticket->comments,
                'categories' => TicketCategory::all(),
                'users' => User::where('role', 'technician')->get(),
            ]);
        }
    }
}
