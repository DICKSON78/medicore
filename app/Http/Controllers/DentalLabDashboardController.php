<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\PatientPaymentCacheItem;
use App\Models\Consultation;
use App\Models\DentalLabOrder;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class DentalLabDashboardController extends Controller
{
    use ApiResponse;

    public function __invoke(Request $request)
    {
        $request->validate([
            'start_date' => 'sometimes|date_format:Y-m-d',
            'end_date' => 'sometimes|date_format:Y-m-d'
        ]);

        $user = $request->user();

        if (!$user || $user->is_admin) {
            $clinic_id = $request->clinic_id;
        } else {
            $clinic_id = $user->clinic_id;
        }

        $start_date = $request->start_date ?? Carbon::now()->startOfWeek()->format('Y-m-d');
        $end_date = $request->end_date ?? Carbon::now()->endOfWeek()->format('Y-m-d');
        $today = Carbon::today()->format('Y-m-d');

        $data = [
            'summary' => [
                'total_lab_orders' => 0,
                'lab_orders_today' => 0,
                'completed_orders' => 0,
                'pending_orders' => 0,
                'in_progress_orders' => 0,
                'scheduled_appointments' => 0,
                'total_revenue' => 0,
                'items_dispensed' => 0,
            ],
            'statistics' => [
                'orders_by_status' => [],
                'revenue_trend' => [],
                'top_items_dispensed' => [],
                'orders_trend' => [],
            ],
        ];

        // Total lab orders
        $data['summary']['total_lab_orders'] = DentalLabOrder::query()
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->whereHas('consultation.creator', function ($q) use ($clinic_id) {
                    $q->where('clinic_id', $clinic_id);
                });
            })
            ->whereBetween('created_at', [$start_date, $end_date])
            ->count();

        // Lab orders today
        $data['summary']['lab_orders_today'] = DentalLabOrder::query()
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->whereHas('consultation.creator', function ($q) use ($clinic_id) {
                    $q->where('clinic_id', $clinic_id);
                });
            })
            ->whereDate('created_at', $today)
            ->count();

        // Completed orders
        $data['summary']['completed_orders'] = DentalLabOrder::query()
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->whereHas('consultation.creator', function ($q) use ($clinic_id) {
                    $q->where('clinic_id', $clinic_id);
                });
            })
            ->where('status', 'Completed')
            ->whereBetween('created_at', [$start_date, $end_date])
            ->count();

        // Pending orders
        $data['summary']['pending_orders'] = DentalLabOrder::query()
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->whereHas('consultation.creator', function ($q) use ($clinic_id) {
                    $q->where('clinic_id', $clinic_id);
                });
            })
            ->where('status', 'Pending')
            ->whereBetween('created_at', [$start_date, $end_date])
            ->count();

        // In progress orders
        $data['summary']['in_progress_orders'] = DentalLabOrder::query()
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->whereHas('consultation.creator', function ($q) use ($clinic_id) {
                    $q->where('clinic_id', $clinic_id);
                });
            })
            ->where('status', 'In Progress')
            ->whereBetween('created_at', [$start_date, $end_date])
            ->count();

        // Total revenue from dental lab items
        $data['summary']['total_revenue'] = PatientPaymentCacheItem::query()
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->whereHas('creator', function ($q) use ($clinic_id) {
                    $q->where('clinic_id', $clinic_id);
                });
            })
            ->whereHas('consultation_type', function ($query) {
                $query->where('name', 'Dental Lab');
            })
            ->where('status', 'Served')
            ->whereBetween('served_at', [$start_date, $end_date])
            ->sum(DB::raw('unit_price * quantity'));

        // Items dispensed
        $data['summary']['items_dispensed'] = PatientPaymentCacheItem::query()
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->whereHas('creator', function ($q) use ($clinic_id) {
                    $q->where('clinic_id', $clinic_id);
                });
            })
            ->whereHas('consultation_type', function ($query) {
                $query->where('name', 'Dental Lab');
            })
            ->where('status', 'Served')
            ->whereBetween('served_at', [$start_date, $end_date])
            ->count();

        // Orders by status
        $data['statistics']['orders_by_status'] = DentalLabOrder::query()
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->whereHas('consultation.creator', function ($q) use ($clinic_id) {
                    $q->where('clinic_id', $clinic_id);
                });
            })
            ->whereBetween('created_at', [$start_date, $end_date])
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get();

        // Top items dispensed
        $data['statistics']['top_items_dispensed'] = PatientPaymentCacheItem::query()
            ->when($clinic_id, function ($query) use ($clinic_id) {
                $query->whereHas('creator', function ($q) use ($clinic_id) {
                    $q->where('clinic_id', $clinic_id);
                });
            })
            ->whereHas('consultation_type', function ($query) {
                $query->where('name', 'Dental Lab');
            })
            ->where('patient_payment_cache_items.status', 'Served')
            ->whereBetween('patient_payment_cache_items.served_at', [$start_date, $end_date])
            ->join('items', 'patient_payment_cache_items.item_id', '=', 'items.id')
            ->select('items.name as item_name', DB::raw('count(*) as count'), DB::raw('sum(patient_payment_cache_items.unit_price * patient_payment_cache_items.quantity) as total_revenue'))
            ->groupBy('items.id', 'items.name')
            ->orderBy('count', 'desc')
            ->limit(10)
            ->get();

        // Revenue trend (last 7 days)
        $data['statistics']['revenue_trend'] = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i)->format('Y-m-d');
            $revenue = PatientPaymentCacheItem::query()
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->whereHas('creator', function ($q) use ($clinic_id) {
                        $q->where('clinic_id', $clinic_id);
                    });
                })
                ->whereHas('consultation_type', function ($query) {
                    $query->where('name', 'Dental Lab');
                })
                ->where('status', 'Served')
                ->whereDate('served_at', $date)
                ->sum(DB::raw('unit_price * quantity'));

            $data['statistics']['revenue_trend'][] = [
                'date' => $date,
                'revenue' => $revenue
            ];
        }

        // Orders trend (last 7 days)
        $data['statistics']['orders_trend'] = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i)->format('Y-m-d');
            $count = DentalLabOrder::query()
                ->when($clinic_id, function ($query) use ($clinic_id) {
                    $query->whereHas('consultation.creator', function ($q) use ($clinic_id) {
                        $q->where('clinic_id', $clinic_id);
                    });
                })
                ->whereDate('created_at', $date)
                ->count();

            $data['statistics']['orders_trend'][] = [
                'date' => $date,
                'count' => $count
            ];
        }

        return $this->sendResponse($data, Response::HTTP_OK, 'Dental lab dashboard data retrieved successfully.');
    }
}
