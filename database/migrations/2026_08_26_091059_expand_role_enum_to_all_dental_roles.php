<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

class ExpandRoleEnumToAllDentalRoles extends Migration
{
    public function up()
    {
        DB::statement("ALTER TABLE users MODIFY role ENUM('Admin','Doctor','Nurse','Receptionist','Cashier','Pharmacist','Dental Lab Technician','Accountant','Inventory Manager','Marketing Officer') NULL DEFAULT NULL");
    }

    public function down()
    {
        DB::statement("ALTER TABLE users MODIFY role ENUM('Admin','Doctor','Client') NULL DEFAULT NULL");
    }
}
