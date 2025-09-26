<?php

namespace App\Exceptions;

use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

class Handler extends ExceptionHandler
{
    /**
     * The list of the inputs that are never flashed to the session on validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     */
    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            //
        });
    }

    /**
     * Render an exception into an HTTP response.
     */
    public function render($request, Throwable $e): Response
    {
        if ($request->expectsJson() || $request->is('api/*')) {
            return $this->handleApiException($request, $e);
        }

        return parent::render($request, $e);
    }

    /**
     * Handle API exceptions with standardized JSON responses.
     */
    protected function handleApiException(Request $request, Throwable $e): JsonResponse
    {
        if ($e instanceof AuthenticationException) {
            return response()->json([
                'code' => 'UNAUTHORIZED',
                'message' => 'Authentication required',
                'details' => null,
            ], 401);
        }

        if ($e instanceof ValidationException) {
            return response()->json([
                'code' => 'VALIDATION_ERROR',
                'message' => 'The given data was invalid',
                'details' => $e->errors(),
            ], 422);
        }

        // Handle other exceptions
        $statusCode = method_exists($e, 'getStatusCode') ? $e->getStatusCode() : 500;

        $response = [
            'code' => $this->getErrorCode($statusCode),
            'message' => $e->getMessage() ?: 'An error occurred',
            'details' => null,
        ];

        // Add stack trace in development
        if (config('app.debug')) {
            $response['debug'] = [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
            ];
        }

        return response()->json($response, $statusCode);
    }

    /**
     * Get error code based on HTTP status code.
     */
    protected function getErrorCode(int $statusCode): string
    {
        return match ($statusCode) {
            400 => 'BAD_REQUEST',
            401 => 'UNAUTHORIZED',
            403 => 'FORBIDDEN',
            404 => 'NOT_FOUND',
            405 => 'METHOD_NOT_ALLOWED',
            422 => 'VALIDATION_ERROR',
            429 => 'TOO_MANY_REQUESTS',
            500 => 'INTERNAL_SERVER_ERROR',
            default => 'UNKNOWN_ERROR',
        };
    }
}
