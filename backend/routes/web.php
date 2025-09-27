<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Add a login route for authentication redirects
Route::get('/login', function () {
    return response()->json(['message' => 'Please use the API login endpoint'], 401);
})->name('login');
