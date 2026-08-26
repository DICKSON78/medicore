<?php

namespace App\Constants;

class RolePrivileges
{
    const ROLES = [
        'Admin' => [
            'label' => 'Administrator',
            'privileges' => [
                'dashboard', 'reception', 'payment_center', 'consultation_room',
                'dental_lab', 'medicine_center', 'procedure_room', 'dispensing',
                'other_dispensing', 'inventory_management', 'marketing',
                'financial_management', 'user_management', 'settings',
            ],
        ],
        'Doctor' => [
            'label' => 'Doctor',
            'privileges' => [
                'dashboard', 'consultation_room', 'dental_lab',
            ],
        ],
        'Nurse' => [
            'label' => 'Nurse',
            'privileges' => [
                'dashboard', 'consultation_room', 'procedure_room',
            ],
        ],
        'Receptionist' => [
            'label' => 'Receptionist',
            'privileges' => [
                'dashboard', 'reception',
            ],
        ],
        'Cashier' => [
            'label' => 'Cashier',
            'privileges' => [
                'dashboard', 'payment_center', 'dispensing', 'other_dispensing',
            ],
        ],
        'Pharmacist' => [
            'label' => 'Pharmacist',
            'privileges' => [
                'dashboard', 'medicine_center', 'dispensing',
            ],
        ],
        'Dental Lab Technician' => [
            'label' => 'Dental Lab Technician',
            'privileges' => [
                'dashboard', 'dental_lab',
            ],
        ],
        'Accountant' => [
            'label' => 'Accountant',
            'privileges' => [
                'dashboard', 'financial_management',
            ],
        ],
        'Inventory Manager' => [
            'label' => 'Inventory Manager',
            'privileges' => [
                'dashboard', 'inventory_management',
            ],
        ],
        'Marketing Officer' => [
            'label' => 'Marketing Officer',
            'privileges' => [
                'dashboard', 'marketing',
            ],
        ],
    ];

    public static function getPrivilegesForRole(string $role): array
    {
        return self::ROLES[$role]['privileges'] ?? [];
    }

    public static function getRoleLabels(): array
    {
        return array_map(fn($config) => $config['label'], self::ROLES);
    }

    public static function getRoleKeys(): array
    {
        return array_keys(self::ROLES);
    }
}
