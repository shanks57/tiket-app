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

        \Log::info('[MOBILE_DEVICE] Store Request:', $request->all());

        $user = $request->user() ?? Auth::user();
        if (! $user) {
            \Log::warning('[MOBILE_DEVICE] Unauthorized attempt to register device');
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        try {
            $device = MobileDevice::updateOrCreate(
                ['token' => $request->token],
                [
                    'user_id' => $user->id,
                    'platform' => $request->platform ?? 'unknown',
                    'app_version' => $request->app_version,
                    'last_active_at' => now(),
                ]
            );

            \Log::info('[MOBILE_DEVICE] Device registered successfully:', [
                'id' => $device->id,
                'user_id' => $user->id,
                'token_prefix' => substr($request->token, 0, 10) . '...'
            ]);

            return response()->json(['status' => 'registered', 'id' => $device->id], 201);
        } catch (\Exception $e) {
            \Log::error('[MOBILE_DEVICE] Registration error: ' . $e->getMessage());
            return response()->json(['message' => 'Internal Server Error', 'error' => $e->getMessage()], 500);
        }
    }

    public function destroy(Request $request)
    {
        $request->validate(['token' => 'required|string']);
        $user = $request->user() ?? Auth::user();
        MobileDevice::where('token', $request->token)->where('user_id', $user->id)->delete();
        return response()->json(['status' => 'unregistered']);
    }
}
