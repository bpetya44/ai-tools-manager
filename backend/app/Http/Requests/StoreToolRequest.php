<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreToolRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Authorization will be handled by middleware
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:120',
            'url' => 'required|url|max:255',
            'category_id' => 'required|exists:tools_categories,id',
            'description' => 'nullable|string|max:500',
        ];
    }

    /**
     * Get custom error messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'The tool name is required.',
            'name.max' => 'The tool name may not be greater than 120 characters.',
            'url.required' => 'The tool URL is required.',
            'url.url' => 'The tool URL must be a valid URL.',
            'url.max' => 'The tool URL may not be greater than 255 characters.',
            'category_id.required' => 'Please select a category.',
            'category_id.exists' => 'The selected category is invalid.',
            'description.max' => 'The description may not be greater than 500 characters.',
        ];
    }
}