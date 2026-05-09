<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\PatientItemBillPayment;
use App\Models\PatientItemPayment;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class PaymentCenterReportsController extends Controller
{
    use ApiResponse;

    public function getCashCollectionReport(Request $request)
    {
        $request->validate([
            'per_page' => 'sometimes|integer|min:0',
            'page' => 'sometimes|integer|min:1',
            'start_date' => 'sometimes|date_format:Y-m-d',
            'end_date' => 'sometimes|date_format:Y-m-d'
        ]);

        $user = $request->user();
        $per_page = $request->per_page ?? 25;
        $clinic_id = $request->clinic_id;
        $payment_channel_id = $request->payment_channel_id;
        $patient_name = $request->patient_name;
        $patient_id = $request->patient_id;
        $patient_gender = $request->patient_gender;
        $patient_phone = $request->patient_phone;
        $start_date = $request->start_date ?? Carbon::today()->format('Y-m-d');
        $end_date = $request->end_date ?? Carbon::today()->format('Y-m-d');

        // Regular cash payments (non-installment)
        $item_payments = PatientItemPayment::with(['channel', 'creator'])
            ->join('patient_payment_cache_items as ppci', 'ppci.item_payment_id', '=', 'patient_item_payments.id')
            ->join('items as it', 'ppci.item_id', '=', 'it.id')
            ->join('patient_payment_cache as ppc', 'ppci.payment_cache_id', '=', 'ppc.id')
            ->join('patient_check_ins as pch', 'ppc.check_in_id', '=', 'pch.id')
            ->join('patients as pt', 'pch.patient_id', '=', 'pt.id');

        // Installment payments - onyesha TU zile ambazo bill imekuwa Cleared siku hiyo hiyo
        $bill_payments = PatientItemBillPayment::with(['channel', 'creator'])
            ->join('patient_item_bills as pib', 'patient_item_bill_payments.bill_id', '=', 'pib.id')
            ->join('patient_payment_cache_items as ppci', 'ppci.bill_id', '=', 'pib.id')
            ->join('items as it', 'ppci.item_id', '=', 'it.id')
            ->join('patient_payment_cache as ppc', 'ppci.payment_cache_id', '=', 'ppc.id')
            ->join('patient_check_ins as pch', 'ppc.check_in_id', '=', 'pch.id')
            ->join('patients as pt', 'pch.patient_id', '=', 'pt.id')
            // Onyesha tu bills zilizokamilika (Cleared)
            ->where('pib.status', 'Cleared')
            // Cleared_at lazima iwe siku moja na payment husika
            ->whereRaw('DATE(pib.cleared_at) = DATE(patient_item_bill_payments.created_at)');

        if ($user->is_admin) {
            $item_payments->with(['creator.clinic']);

            if ($clinic_id) {
                $item_payments->whereHas('creator', function ($query) use ($clinic_id) {
                    $query->where('clinic_id', $clinic_id);
                });
                $bill_payments->whereHas('creator', function ($query) use ($clinic_id) {
                    $query->where('clinic_id', $clinic_id);
                });
            }
        } else {
            $item_payments->whereHas('creator', function ($query) use ($user) {
                $query->where('clinic_id', $user->clinic_id);
            });
            $bill_payments->whereHas('creator', function ($query) use ($user) {
                $query->where('clinic_id', $user->clinic_id);
            });
        }

        if ($payment_channel_id) {
            $item_payments->where('patient_item_payments.channel_id', $payment_channel_id);
            $bill_payments->where('patient_item_bill_payments.channel_id', $payment_channel_id);
        }

        if ($patient_name) {
            $item_payments->whereRaw('concat(pt.first_name, coalesce(pt.middle_name, ""), pt.last_name) like ?', [str_replace(' ', '', '%' . $patient_name . '%')]);
            $bill_payments->whereRaw('concat(pt.first_name, coalesce(pt.middle_name, ""), pt.last_name) like ?', [str_replace(' ', '', '%' . $patient_name . '%')]);
        }

        if ($patient_id) {
            $item_payments->where('pch.patient_id', $patient_id);
            $bill_payments->where('pch.patient_id', $patient_id);
        }

        if ($patient_gender) {
            $item_payments->where('pt.gender', $patient_gender);
            $bill_payments->where('pt.gender', $patient_gender);
        }

        if ($patient_phone) {
            $item_payments->where('pt.phone', 'like', '%' . $patient_phone . '%');
            $bill_payments->where('pt.phone', 'like', '%' . $patient_phone . '%');
        }

        if ($start_date) {
            $item_payments->whereDate('patient_item_payments.created_at', '>=', $start_date);
            $bill_payments->whereDate('patient_item_bill_payments.created_at', '>=', $start_date);
        }

        if ($end_date) {
            $item_payments->whereDate('patient_item_payments.created_at', '<=', $end_date);
            $bill_payments->whereDate('patient_item_bill_payments.created_at', '<=', $end_date);
        }

        $item_payments->select(
            DB::raw("'Cash' as transaction_type"),
            'pt.first_name', 'pt.middle_name', 'pt.last_name',
            'pch.patient_id', 'channel_id',
            'patient_item_payments.amount',
            'patient_item_payments.discount',
            'patient_item_payments.created_at',
            'patient_item_payments.created_by',
            DB::raw('group_concat(it.name separator ", ") as items')
        )->groupBy('patient_item_payments.id');

        $bill_payments->select(
            DB::raw("'Installment Completed' as transaction_type"),
            'pt.first_name', 'pt.middle_name', 'pt.last_name',
            'pch.patient_id', 'channel_id',
            'patient_item_bill_payments.amount',
            DB::raw('0 as discount'),
            'patient_item_bill_payments.created_at',
            'patient_item_bill_payments.created_by',
            DB::raw('group_concat(it.name separator ", ") as items')
        )->groupBy('patient_item_bill_payments.id');

        $data = $item_payments->union($bill_payments);
        $data->orderBy('created_at', 'desc');
        $data = $data->paginate($per_page);
        return $this->sendResponse($data, Response::HTTP_OK, 'Success.');
    }
}