<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DentalOption extends Model
{
    use HasFactory;

    protected $fillable = [
        'category',
        'label',
        'value',
        'sort_order',
        'status',
    ];

    public function scopeActive($query)
    {
        return $query->where('status', 'Active');
    }
}