<?php

// Test script to debug the update issue
require_once 'vendor/autoload.php';

use Illuminate\Database\Capsule\Manager as DB;

// Database configuration
$capsule = new DB;
$capsule->addConnection([
    'driver' => 'mysql',
    'host' => 'localhost',
    'port' => '8203',
    'database' => 'vibecode-full-stack-starter-kit_app',
    'username' => 'root',
    'password' => 'vibecode-full-stack-starter-kit_mysql_pass',
    'charset' => 'utf8mb4',
    'collation' => 'utf8mb4_unicode_ci',
    'prefix' => '',
]);

$capsule->setAsGlobal();
$capsule->bootEloquent();

// Test the update
echo "Before update:\n";
$tool = DB::table('tools_tools')->where('id', 123)->first();
print_r($tool);

echo "\nUpdating...\n";
$result = DB::table('tools_tools')
    ->where('id', 123)
    ->update(['name' => 'Test Update ' . date('H:i:s')]);

echo "Update result: " . $result . "\n";

echo "\nAfter update:\n";
$tool = DB::table('tools_tools')->where('id', 123)->first();
print_r($tool);
