<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\PatientItemBill;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class PatientItemBillsController extends Controller
{
    use ApiResponse;

    /**
     * Display a listing of the resource.
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
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
        $status = $request->status;
        $id = $request->id;
        $patient_name = $request->patient_name;
        $patient_id = $request->patient_id;
        $patient_gender = $request->patient_gender;
        $patient_phone = $request->patient_phone;
        $with_items = $request->with_items;
        $start_date = $request->start_date;
        $end_date = $request->end_date;
        $payment_status = $request->payment_status;

        $data = PatientItemBill::with(['first_item.payment_cache.consultation', 'creator'])->whereHas('first_item');

        if ($user->is_admin) {
            $data->with(['creator.clinic']);

            if ($clinic_id) {
                $data->whereHas('creator', function ($query) use ($clinic_id) {
                    $query->where('clinic_id', $clinic_id);
                });
            }
        } else {
            $data->whereHas('creator', function ($query) use ($user) {
                $query->where('clinic_id', $user->clinic_id);
            });
        }

        if ($status) {
            $data->where('status', $status);
        }

        if ($id) {
            $data->where('id', $id);
        }

        if ($patient_name) {
            $data->whereHas('items.payment_cache.check_in.patient', function ($query) use ($patient_name) {
                $query->fullName('%' . $patient_name . '%');
            });
        }

        if ($patient_id) {
            $data->whereHas('items.payment_cache.check_in', function ($query) use ($patient_id) {
                $query->where('patient_id', $patient_id);
            });
        }

        if ($patient_gender) {
            $data->whereHas('items.payment_cache.check_in.patient', function ($query) use ($patient_gender) {
                $query->where('gender', $patient_gender);
            });
        }

        if ($patient_phone) {
            $data->whereHas('items.payment_cache.check_in.patient', function ($query) use ($patient_phone) {
                $query->where('phone', 'like', '%' . $patient_phone . '%');
            });
        }

        if ($with_items == 'Yes') {
            $data->with(['items' => function ($query) {
                $query->with(['item.unit_of_measure', 'payment_mode', 'creator']);
            }]);
        }

        if ($payment_status === 'partial') {
            $data->whereRaw('(SELECT SUM(amount) FROM patient_item_bill_payments WHERE bill_id = patient_item_bills.id) > 0')
                  ->whereRaw('(SELECT SUM(amount) FROM patient_item_bill_payments WHERE bill_id = patient_item_bills.id) < (patient_item_bills.amount - patient_item_bills.discount)');
        } elseif ($payment_status === 'none') {
            $data->doesntHave('payments');
        } elseif ($payment_status === 'completed') {
            $data->whereRaw('(SELECT SUM(amount) FROM patient_item_bill_payments WHERE bill_id = patient_item_bills.id) >= (patient_item_bills.amount - patient_item_bills.discount)')
                  ->where('status', 'Cleared');
        }

        if ($start_date) {
            $data->whereDate('created_at', '>=', $start_date);
        }

        if ($end_date) {
            $data->whereDate('created_at', '<=', $end_date);
        }

        $data->orderBy('created_at', 'desc');
        $data = $data->paginate($per_page);
        return $this->sendResponse($data, Response::HTTP_OK, 'Success.');
    }

    public function summary(Request $request)
    {
        $user = $request->user();
        $clinic_id = $request->clinic_id;
        $status = $request->status;
        $patient_name = $request->patient_name;
        $patient_id = $request->patient_id;
        $patient_gender = $request->patient_gender;
        $patient_phone = $request->patient_phone;
        $start_date = $request->start_date;
        $end_date = $request->end_date;
        $payment_status = $request->payment_status;

        $data = PatientItemBill::whereHas('first_item');

        if ($user->is_admin) {
            if ($clinic_id) {
                $data->whereHas('creator', function ($query) use ($clinic_id) {
                    $query->where('clinic_id', $clinic_id);
                });
            }
        } else {
            $data->whereHas('creator', function ($query) use ($user) {
                $query->where('clinic_id', $user->clinic_id);
            });
        }

        if ($status) {
            $data->where('status', $status);
        }

        if ($patient_name) {
            $data->whereHas('items.payment_cache.check_in.patient', function ($query) use ($patient_name) {
                $query->fullName('%' . $patient_name . '%');
            });
        }

        if ($patient_id) {
            $data->whereHas('items.payment_cache.check_in', function ($query) use ($patient_id) {
                $query->where('patient_id', $patient_id);
            });
        }

        if ($patient_gender) {
            $data->whereHas('items.payment_cache.check_in.patient', function ($query) use ($patient_gender) {
                $query->where('gender', $patient_gender);
            });
        }

        if ($patient_phone) {
            $data->whereHas('items.payment_cache.check_in.patient', function ($query) use ($patient_phone) {
                $query->where('phone', 'like', '%' . $patient_phone . '%');
            });
        }

        if ($payment_status === 'partial') {
            $data->has('payments');
        } elseif ($payment_status === 'none') {
            $data->doesntHave('payments');
        }

        if ($start_date) {
            $data->whereDate('created_at', '>=', $start_date);
        }

        if ($end_date) {
            $data->whereDate('created_at', '<=', $end_date);
        }

        $totalAmount = $data->sum('amount');
        $totalDiscount = $data->sum('discount');
        
        $billIds = $data->pluck('id');
        $totalPaid = \App\Models\PatientItemBillPayment::whereIn('bill_id', $billIds)->sum('amount');

        $totalDebt = $totalAmount - $totalDiscount - $totalPaid;

        return $this->sendResponse(['total_debt' => $totalDebt], Response::HTTP_OK, 'Success.');
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     *
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $data = PatientItemBill::with(['creator', 'clearer', 'first_item.payment_cache.consultation'])->findOrFail($id);
        return $this->sendResponse($data, Response::HTTP_OK, 'Success.');
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request $request
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $data = PatientItemBill::findOrFail($id);
        $data->update($request->only('discount'));
        return $this->sendResponse($data, Response::HTTP_OK, 'Saved successfully.');
    }

    public function clear(Request $request, $id)
    {
        $data = PatientItemBill::findOrFail($id);
        
        // Calculate total paid amount
        $totalPaid = $data->payments()->sum('amount');
        $amountDue = $data->amount - $data->discount;
        
        // Only clear if fully paid
        if ($totalPaid < $amountDue) {
            return $this->sendResponse(null, Response::HTTP_BAD_REQUEST, 'Cannot clear bill: Payment is incomplete. Amount paid: ' . number_format($totalPaid) . ', Required: ' . number_format($amountDue));
        }
        
        $data->update([
            'status' => 'Cleared',
            'cleared_at' => Carbon::now(),
            'cleared_by' => $request->user()->id,
        ]);

        // Determine next department based on patient's treatment needs when bill is cleared
        if ($data->first_item) {
            $patient = $data->first_item->payment_cache->check_in->patient;
            $waitingTime = $patient->current_waiting_time;
            if ($waitingTime) {
                $this->determineNextDepartment($waitingTime, $data->first_item->payment_cache);
            }
        }

        return $this->sendResponse($data, Response::HTTP_OK, 'Cleared successfully.');
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        //
    }

    /**
     * Determine the next department for a patient based on their treatment needs
     */
    private function determineNextDepartment($waitingTime, $paymentCache)
    {
        // Check if patient has consultation that requires glasses FIRST
        $consultation = $paymentCache->consultation;
        
        // Also check if patient has glass items that require optician attention
        $hasGlassItems = $paymentCache->items()
            ->whereHas('consultation_type', function($query) {
                $query->where('name', 'Glass');
            })
            ->count() > 0;
        
        if (($consultation && $consultation->require_glass === 'Yes') || $hasGlassItems) {
            // Patient needs glasses, send to optician (consultation department) FIRST
            $waitingTime->sendToConsultation();
            
            // If consultation exists, set sent_to_optician_at if not already set
            if ($consultation && !$consultation->sent_to_optician_at) {
                $consultation->update([
                    'sent_to_optician_at' => now(),
                    'sent_to_optician_by' => $consultation->creator_id ?? null,
                ]);
            }
            
            // If no consultation exists but patient has glass items, create one
            if (!$consultation && $hasGlassItems) {
                // Find the first glass item to create consultation
                $glassItem = $paymentCache->items()
                    ->whereHas('consultation_type', function($query) {
                        $query->where('name', 'Glass');
                    })
                    ->first();
                
                if ($glassItem) {
                    $consultation = Consultation::create([
                        'payment_cache_item_id' => $glassItem->id,
                        'patient_direction' => 'Direct to Optician',
                        'created_by' => $glassItem->creator_id ?? 1, // Default to system user if no creator
                        'require_glass' => 'Yes',
                        'sent_to_optician_at' => now(),
                        'sent_to_optician_by' => $glassItem->creator_id ?? 1,
                    ]);
                    
                    $paymentCache->consultation_id = $consultation->id;
                    $paymentCache->save();
                }
            }
            
            \Log::info('Patient moved to consultation (optician) after bill cleared', [
                'patient_id' => $waitingTime->patient_id,
                'patient_name' => $waitingTime->patient->full_name ?? 'Unknown',
                'require_glass' => $consultation ? $consultation->require_glass : 'Yes (auto-created)',
                'sent_to_optician_at' => $consultation ? $consultation->sent_to_optician_at : 'now',
                'has_glass_items' => $hasGlassItems
            ]);
            return;
        }
        
        // Only check for dispensing if patient doesn't have glass items
        $pendingItems = $paymentCache->items()
            ->where('status', '!=', 'Served')
            ->count();
        
        if ($pendingItems > 0) {
            // Patient has items that need dispensing (non-glass items)
            $waitingTime->sendToDispensing();
            \Log::info('Patient moved to dispensing after bill cleared (non-glass items)', [
                'patient_id' => $waitingTime->patient_id,
                'patient_name' => $waitingTime->patient->full_name ?? 'Unknown',
                'pending_items' => $pendingItems
            ]);
            return;
        }

        // Check if patient has consultation that requires glasses
        $consultation = $paymentCache->consultation;
        
        // Also check if patient has glass items that require optician attention
        $hasGlassItems = $paymentCache->items()
            ->whereHas('consultation_type', function($query) {
                $query->where('name', 'Glass');
            })
            ->count() > 0;
        
        if (($consultation && $consultation->require_glass === 'Yes') || $hasGlassItems) {
            // Patient needs glasses, send to optician (consultation department)
            $waitingTime->sendToConsultation();
            
            // If consultation exists, set sent_to_optician_at if not already set
            if ($consultation && !$consultation->sent_to_optician_at) {
                $consultation->update([
                    'sent_to_optician_at' => now(),
                    'sent_to_optician_by' => $consultation->creator_id ?? null,
                ]);
            }
            
            // If no consultation exists but patient has glass items, create one
            if (!$consultation && $hasGlassItems) {
                // Find the first glass item to create consultation
                $glassItem = $paymentCache->items()
                    ->whereHas('consultation_type', function($query) {
                        $query->where('name', 'Glass');
                    })
                    ->first();
                
                if ($glassItem) {
                    $consultation = Consultation::create([
                        'payment_cache_item_id' => $glassItem->id,
                        'patient_direction' => 'Direct to Optician',
                        'created_by' => $glassItem->creator_id ?? 1, // Default to system user if no creator
                        'require_glass' => 'Yes',
                        'sent_to_optician_at' => now(),
                        'sent_to_optician_by' => $glassItem->creator_id ?? 1,
                    ]);
                    
                    $paymentCache->consultation_id = $consultation->id;
                    $paymentCache->save();
                }
            }
            
            \Log::info('Patient moved to consultation (optician) after bill cleared', [
                'patient_id' => $waitingTime->patient_id,
                'patient_name' => $waitingTime->patient->full_name ?? 'Unknown',
                'require_glass' => $consultation ? $consultation->require_glass : 'Yes (auto-created)',
                'sent_to_optician_at' => $consultation ? $consultation->sent_to_optician_at : 'now',
                'has_glass_items' => $hasGlassItems
            ]);
            return;
        }

        // Check if patient has any procedures scheduled
        $hasProcedures = $paymentCache->items()
            ->whereHas('item.consultation_type', function($query) {
                $query->where('name', 'like', '%Surgery%')
                      ->orWhere('name', 'like', '%Procedure%');
            })
            ->count() > 0;
        
        if ($hasProcedures) {
            // Patient has procedures, send to procedure room
            $waitingTime->sendToProcedureRoom();
            \Log::info('Patient moved to procedure room after bill cleared', [
                'patient_id' => $waitingTime->patient_id,
                'patient_name' => $waitingTime->patient->full_name ?? 'Unknown'
            ]);
            return;
        }

        // If no specific treatment needs, return to reception
        $waitingTime->returnToReception('Bill cleared - treatment complete');
        \Log::info('Patient returned to reception after bill cleared - no further treatment needed', [
            'patient_id' => $waitingTime->patient_id,
            'patient_name' => $waitingTime->patient->full_name ?? 'Unknown'
        ]);
    }
}
