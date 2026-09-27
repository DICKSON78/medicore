<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        // Sync the live consultations.patient_direction enum with the values the
        // application actually uses: Direct to Doctor (default), Direct to Dental Lab
        // (used for the direct-to-lab dispense auto-complete), and Referral (MoH/DPR
        // report flag). The previous enum only allowed 'Direct to Optician', which no
        // longer matches any code path.
        DB::statement("ALTER TABLE consultations MODIFY patient_direction ENUM('Direct to Doctor','Direct to Dental Lab','Referral') NOT NULL DEFAULT 'Direct to Doctor'");
    }

    public function down()
    {
        DB::statement("ALTER TABLE consultations MODIFY patient_direction ENUM('Direct to Doctor','Direct to Optician') NOT NULL DEFAULT 'Direct to Doctor'");
    }
};
