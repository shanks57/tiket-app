<?php

namespace App\Http\Controllers;

use App\Models\MobileDevice;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class MobileDeviceController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'token' => 'required|string',
            'platform' => 'nullable|in:web,android,ios,unknown',
            'app_version' => 'nullable|string',
        ]);

        $user = $request->user() ?? Auth::user();
        if (! $user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $device = MobileDevice::updateOrCreate(
            ['token' => $request->token],
            [
                'user_id' => $user->id,
                'platform' => $request->platform ?? 'unknown',
                'app_version' => $request->app_version,
                'last_active_at' => now(),
            ]
        );

        return response()->json(['status' => 'registered', 'id' => $device->id], 201);
    }

    public function destroy(Request $request)
    {
        $request->validate(['token' => 'required|string']);
        $user = $request->user() ?? Auth::user();
        MobileDevice::where('token', $request->token)->where('user_id', $user->id)->delete();
        return response()->json(['status' => 'unregistered']);
    }
}
