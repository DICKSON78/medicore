<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\DentalLabOrder;
use App\Models\DentalTreatmentRecord;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class DentalLabDashboardController extends Controller
{
    use ApiResponse;

    public function __invoke(Request $request)
    {
        $user = $request->user();
        $today = Carbon::now()->format('Y-m-d');

        $data = [
            'total_orders' => DentalLabOrder::count(),
            'pending_orders' => DentalLabOrder::where('status', 'Ordered')->count(),
            'in_progress_orders' => DentalLabOrder::where('status', 'In Progress')->count(),
            'ready_for_delivery' => DentalLabOrder::where('status', 'Ready')->count(),
            'today_impressions' => DentalLabOrder::whereDate('impression_date', $today)->count(),
            'today_deliveries' => DentalLabOrder::whereDate('delivery_date', $today)->count(),
            'recent_orders' => DentalLabOrder::with(['consultation', 'orderedBy'])
                ->orderBy('created_at', 'desc')
                ->take(10)
                ->get(),
            'today_treatments' => DentalTreatmentRecord::with(['treatedBy'])
                ->whereDate('treatment_date', $today)
                ->count(),
        ];

        return $this->sendResponse($data, Response::HTTP_OK, 'Success.');
    }
}
