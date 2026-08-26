<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Models\Clinic;
use App\Models\ConsultationType;
use App\Models\ItemType;
use App\Models\JobTitle;
use App\Models\PaymentChannel;
use App\Models\PaymentMode;
use App\Models\Preference;
use App\Models\UnitOfMeasure;
use App\Models\User;
use App\Models\UserPrivilege;
use App\Constants\RolePrivileges;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        // \App\Models\User::factory(10)->create();

        $now = Carbon::now()->toDateTimeString();

        Clinic::insert([
            [
                'name' => 'SmartSoft Clinic',
                'phone' => '076855364',
                'email' => 'smartsoft@gmail.com',
                'address' => 'P. O. Box 879 DSM',
                'created_at' => $now,
                'updated_at' => $now
            ],
        ]);

        JobTitle::insert([
            ['clinic_id' => 1, 'name' => 'Receptionist', 'created_at' => $now, 'updated_at' => $now],
            ['clinic_id' => 1, 'name' => 'Doctor', 'created_at' => $now, 'updated_at' => $now],
            ['clinic_id' => 1, 'name' => 'Cashier', 'created_at' => $now, 'updated_at' => $now],
        ]);

        User::insert([
            [
                'clinic_id' => 1,
                'first_name' => 'Admin',
                'last_name' => 'User',
                'role' => 'Admin',
                'username' => 'admin',
                'password' => Hash::make('1234'),
                'gender' => 'Male',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'clinic_id' => 1,
                'first_name' => 'Cashier',
                'last_name' => 'User',
                'role' => 'Cashier',
                'username' => 'cashier',
                'password' => Hash::make('1234'),
                'gender' => 'Female',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'clinic_id' => 1,
                'first_name' => 'Receptionist',
                'last_name' => 'User',
                'role' => 'Receptionist',
                'username' => 'receptionist',
                'password' => Hash::make('1234'),
                'gender' => 'Female',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'clinic_id' => 1,
                'first_name' => 'Doctor',
                'last_name' => 'User',
                'role' => 'Doctor',
                'designation' => 'Doctor',
                'username' => 'doctor',
                'password' => Hash::make('1234'),
                'gender' => 'Male',
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);

        // Assign privileges based on role
        $users = User::all();
        foreach ($users as $user) {
            $privileges = RolePrivileges::getPrivilegesForRole($user->role);
            if (!empty($privileges)) {
                $rows = array_map(fn($p) => ['user_id' => $user->id, 'privilege' => $p], $privileges);
                UserPrivilege::insert($rows);
            }
        }

        ConsultationType::insert([
            ['name' => 'Pharmacy', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Dental Lab', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Procedure', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Others', 'created_at' => $now, 'updated_at' => $now],
        ]);

        PaymentMode::insert(['clinic_id' => 1, 'name' => 'Cash', 'transaction_type' => 'Cash', 'created_at' => $now, 'updated_at' => $now]);

        // Create default payment channels
        PaymentChannel::insert([
            ['clinic_id' => 1, 'name' => 'Cash', 'description' => 'Cash payments', 'status' => 'Active', 'created_at' => $now, 'updated_at' => $now],
            ['clinic_id' => 1, 'name' => 'Credit', 'description' => 'Credit payments', 'status' => 'Active', 'created_at' => $now, 'updated_at' => $now],
            ['clinic_id' => 1, 'name' => 'Bank Transfer', 'description' => 'Bank transfer payments', 'status' => 'Active', 'created_at' => $now, 'updated_at' => $now],
        ]);

        UnitOfMeasure::insert([
            ['name' => 'mg', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Btl', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'PC', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Drops', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Tube', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Kit', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Box', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Ltr', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Cap', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Tin', 'created_at' => $now, 'updated_at' => $now],
        ]);

        ItemType::insert([
            ['name' => 'Service', 'description' => 'Serviced Item', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Pharmaceutical', 'description' => 'Pharmaceutical and Consumable Item', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Dental Materials', 'description' => 'Dental consumable materials', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Dental Prosthetics', 'description' => 'Dental prosthetic items (crowns, bridges, dentures)', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Others', 'description' => 'Other Item', 'created_at' => $now, 'updated_at' => $now],
        ]);

        Preference::insert([
            ['clinic_id' => 1, 'key' => 'CONSULTATION_MESSAGE', 'value' => 'Habari {name}, Hongera na asante kwa kupata huduma kwetu. Ni tumaini letu umepata huduma stahiki. Kwa maoni kuhusu huduma zetu tuma ujumbe au piga simu namba 0676 506 323. Karibu sana.'],
            ['clinic_id' => 1, 'key' => 'PATIENT_TO_RETURN_REMINDER_MESSAGE', 'value' => 'Habari {name}, Tunakukumbusha kurudi kumuona daktari kesho tarehe {date} kwa ajili ya vipimo ili kufuatilia maendeleo ya afya ya meno yako. Wasiliana nasi 0676 506 323.'],
            ['clinic_id' => 1, 'key' => 'SEND_MESSAGES', 'value' => 'No'],
            ['clinic_id' => 1, 'key' => 'SEND_REMINDER_MESSAGES_AT', 'value' => '11:00'],
            ['clinic_id' => 1, 'key' => 'SMS_SENDER_NAME', 'value' => 'INFO'],
            ['clinic_id' => 1, 'key' => 'MARKETING_MODULE', 'value' => 'Yes'],
        ]);

        // Add sample patients
        \App\Models\Patient::insert([
            [
                'clinic_id' => 1,
                'first_name' => 'Alice',
                'last_name' => 'Johnson',
                'phone' => '0712345678',
                'gender' => 'Female',
                'date_of_birth' => '1985-03-15',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'clinic_id' => 1,
                'first_name' => 'Bob',
                'last_name' => 'Williams',
                'phone' => '0723456789',
                'gender' => 'Male',
                'date_of_birth' => '1978-07-22',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'clinic_id' => 1,
                'first_name' => 'Carol',
                'last_name' => 'Brown',
                'phone' => '0734567890',
                'gender' => 'Female',
                'date_of_birth' => '1992-11-08',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'clinic_id' => 1,
                'first_name' => 'David',
                'last_name' => 'Davis',
                'phone' => '0745678901',
                'gender' => 'Male',
                'date_of_birth' => '1980-05-12',
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);

    }
}
