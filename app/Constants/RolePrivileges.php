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
        'Hospital Manager' => [
            'label' => 'Hospital/Clinic Manager',
            'privileges' => [
                'dashboard', 'reception', 'payment_center', 'consultation_room',
                'dental_lab', 'medicine_center', 'procedure_room', 'dispensing',
                'other_dispensing', 'inventory_management', 'marketing',
                'financial_management', 'user_management', 'settings',
            ],
        ],

        // Clinical roles
        'Dental Surgeon' => [
            'label' => 'Dental Surgeon',
            'privileges' => [
                'dashboard', 'consultation_room', 'dental_lab', 'procedure_room',
            ],
        ],
        'Doctor' => [
            'label' => 'Doctor',
            'privileges' => [
                'dashboard', 'consultation_room', 'dental_lab',
            ],
        ],
        'Dental Therapist' => [
            'label' => 'Dental Therapist',
            'privileges' => [
                'dashboard', 'consultation_room', 'dental_lab',
            ],
        ],
        'Oral Health Officer' => [
            'label' => 'Oral Health Officer',
            'privileges' => [
                'dashboard', 'consultation_room', 'dental_lab',
            ],
        ],
        'Clinical Officer' => [
            'label' => 'Clinical Officer',
            'privileges' => [
                'dashboard', 'consultation_room', 'procedure_room',
            ],
        ],
        'Medical Officer' => [
            'label' => 'Medical Officer',
            'privileges' => [
                'dashboard', 'consultation_room', 'procedure_room', 'medicine_center',
            ],
        ],

        // Nursing roles
        'Nurse' => [
            'label' => 'Nurse',
            'privileges' => [
                'dashboard', 'consultation_room', 'procedure_room',
            ],
        ],
        'Dental Nurse' => [
            'label' => 'Dental Nurse',
            'privileges' => [
                'dashboard', 'consultation_room', 'dental_lab', 'procedure_room',
            ],
        ],
        'Theatre Nurse' => [
            'label' => 'Theatre Nurse',
            'privileges' => [
                'dashboard', 'procedure_room', 'consultation_room',
            ],
        ],
        'Anaesthesia Officer' => [
            'label' => 'Anaesthesia Officer',
            'privileges' => [
                'dashboard', 'procedure_room',
            ],
        ],
        'Dental Assistant' => [
            'label' => 'Dental Assistant',
            'privileges' => [
                'dashboard', 'consultation_room', 'dental_lab',
            ],
        ],

        // Lab roles
        'Dental Lab Technician' => [
            'label' => 'Dental Lab Technician',
            'privileges' => [
                'dashboard', 'dental_lab',
            ],
        ],
        'Lab Assistant' => [
            'label' => 'Lab Assistant',
            'privileges' => [
                'dashboard', 'dental_lab',
            ],
        ],

        // Pharmacy roles
        'Pharmacist' => [
            'label' => 'Pharmacist',
            'privileges' => [
                'dashboard', 'medicine_center', 'dispensing', 'inventory_management',
            ],
        ],
        'Pharmacy Technician' => [
            'label' => 'Pharmacy Technician',
            'privileges' => [
                'dashboard', 'medicine_center', 'dispensing',
            ],
        ],
        'Dispensing Assistant' => [
            'label' => 'Dispensing Assistant',
            'privileges' => [
                'dashboard', 'dispensing', 'other_dispensing',
            ],
        ],

        // Administrative roles
        'Receptionist' => [
            'label' => 'Receptionist',
            'privileges' => [
                'dashboard', 'reception',
            ],
        ],
        'Medical Records Officer' => [
            'label' => 'Medical Records Officer',
            'privileges' => [
                'dashboard', 'reception', 'settings',
            ],
        ],
        'Office Administrator' => [
            'label' => 'Office Administrator',
            'privileges' => [
                'dashboard', 'reception', 'settings', 'user_management',
            ],
        ],
        'Secretary' => [
            'label' => 'Secretary',
            'privileges' => [
                'dashboard', 'reception',
            ],
        ],
        'Health Information Officer' => [
            'label' => 'Health Information Officer',
            'privileges' => [
                'dashboard', 'reception', 'consultation_room',
            ],
        ],

        // Finance roles
        'Cashier' => [
            'label' => 'Cashier',
            'privileges' => [
                'dashboard', 'payment_center', 'dispensing', 'other_dispensing',
            ],
        ],
        'Billing Officer' => [
            'label' => 'Billing Officer',
            'privileges' => [
                'dashboard', 'payment_center', 'financial_management',
            ],
        ],
        'Accountant' => [
            'label' => 'Accountant',
            'privileges' => [
                'dashboard', 'financial_management', 'payment_center',
            ],
        ],

        // Inventory/Store roles
        'Inventory Manager' => [
            'label' => 'Inventory Manager',
            'privileges' => [
                'dashboard', 'inventory_management', 'medicine_center',
            ],
        ],
        'Store Keeper' => [
            'label' => 'Store Keeper',
            'privileges' => [
                'dashboard', 'inventory_management',
            ],
        ],

        // Outreach/Marketing roles
        'Marketing Officer' => [
            'label' => 'Marketing Officer',
            'privileges' => [
                'dashboard', 'marketing',
            ],
        ],
        'Community Oral Health Worker' => [
            'label' => 'Community Oral Health Worker',
            'privileges' => [
                'dashboard', 'marketing', 'reception',
            ],
        ],
        'Public Health Officer' => [
            'label' => 'Public Health Officer',
            'privileges' => [
                'dashboard', 'marketing', 'consultation_room',
            ],
        ],

        // Oversight roles
        'Quality Assurance Officer' => [
            'label' => 'Quality Assurance Officer',
            'privileges' => [
                'dashboard', 'settings',
            ],
        ],
        'Compliance Officer' => [
            'label' => 'Compliance Officer',
            'privileges' => [
                'dashboard', 'financial_management', 'settings',
            ],
        ],
        'Training Coordinator' => [
            'label' => 'Training/CME Coordinator',
            'privileges' => [
                'dashboard', 'settings',
            ],
        ],

        // IT roles
        'IT Administrator' => [
            'label' => 'IT Administrator',
            'privileges' => [
                'dashboard', 'settings', 'user_management',
            ],
        ],
        'System Administrator' => [
            'label' => 'System Administrator',
            'privileges' => [
                'dashboard', 'settings', 'user_management',
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
