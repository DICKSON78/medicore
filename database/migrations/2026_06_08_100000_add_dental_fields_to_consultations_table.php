<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddDentalFieldsToConsultationsTable extends Migration
{
    public function up()
    {
        Schema::table('consultations', function (Blueprint $table) {
            $table->text('extra_oral_examination')->nullable()->after('general_health');
            $table->text('tmj_examination')->nullable()->after('extra_oral_examination');
            $table->text('lymph_nodes')->nullable()->after('tmj_examination');
            $table->text('oral_hygiene_status')->nullable()->after('lymph_nodes');
            $table->text('tobacco_use')->nullable()->after('oral_hygiene_status');
            $table->text('alcohol_use')->nullable()->after('tobacco_use');
        });
    }

    public function down()
    {
        Schema::table('consultations', function (Blueprint $table) {
            $table->dropColumn([
                'extra_oral_examination',
                'tmj_examination',
                'lymph_nodes',
                'oral_hygiene_status',
                'tobacco_use',
                'alcohol_use',
            ]);
        });
    }
}
