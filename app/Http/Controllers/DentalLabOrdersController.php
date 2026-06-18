<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\DentalLabOrder;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class DentalLabOrdersController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $request->validate([
            'per_page' => 'sometimes|integer|min:0',
            'page' => 'sometimes|integer|min:1',
            'status' => 'sometimes|string',
            'consultation_id' => 'sometimes|exists:consultations,id',
        ]);

        $per_page = $request->per_page ?? 25;
        $data = DentalLabOrder::with([
            'consultation', 'orderedBy', 'creator',
            'payment_cache_item' => function ($query) {
                $query->with(['payment_cache.check_in.patient']);
            },
        ]);

        if ($request->status) {
            $data->where('status', $request->status);
        }

        if ($request->consultation_id) {
            $data->where('consultation_id', $request->consultation_id);
        }

        $data->orderBy('created_at', 'desc');
        $data = $data->paginate($per_page);
        return $this->sendResponse($data, Response::HTTP_OK, 'Success.');
    }

    public function show($id)
    {
        $data = DentalLabOrder::with([
            'consultation', 'orderedBy', 'creator',
            'payment_cache_item' => function ($query) {
                $query->with(['payment_cache.check_in.patient']);
            },
        ])->findOrFail($id);
        return $this->sendResponse($data, Response::HTTP_OK, 'Success.');
    }

    public function store(Request $request)
    {
        $request->validate([
            'consultation_id' => 'required|exists:consultations,id',
            'order_type' => 'required|string',
            'description' => 'nullable|string',
            'material' => 'nullable|string',
            'shade' => 'nullable|string',
            'tooth_number' => 'nullable|integer',
            'teeth_involved' => 'nullable|array',
            'impression_date' => 'nullable|date_format:Y-m-d',
            'delivery_date' => 'nullable|date_format:Y-m-d',
            'insertion_date' => 'nullable|date_format:Y-m-d',
            'lab_notes' => 'nullable|string',
            'lab_name' => 'nullable|string',
            'cost' => 'nullable|numeric',
        ]);

        $input = $request->all();
        $input['ordered_by'] = $request->user()->id;
        $input['created_by'] = $request->user()->id;
        $data = DentalLabOrder::create($input);

        return $this->sendResponse($data, Response::HTTP_OK, 'Order created successfully.');
    }

    public function update(Request $request, $id)
    {
        $data = DentalLabOrder::findOrFail($id);
        $data->update($request->all());
        return $this->sendResponse($data, Response::HTTP_OK, 'Updated successfully.');
    }

    public function markDelivered($id)
    {
        $data = DentalLabOrder::findOrFail($id);
        $data->update([
            'status' => 'Ready',
            'delivery_date' => now()->format('Y-m-d'),
        ]);
        return $this->sendResponse($data, Response::HTTP_OK, 'Marked as delivered.');
    }

    public function markInserted($id)
    {
        $data = DentalLabOrder::findOrFail($id);
        $data->update([
            'status' => 'Inserted',
            'insertion_date' => now()->format('Y-m-d'),
        ]);
        return $this->sendResponse($data, Response::HTTP_OK, 'Marked as inserted.');
    }

    public function destroy($id)
    {
        DentalLabOrder::findOrFail($id)->delete();
        return $this->sendResponse(null, Response::HTTP_OK, 'Deleted successfully.');
    }
}
