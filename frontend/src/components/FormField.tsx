import React from "react";

interface FormFieldProps {
  label: string;
  name: string;
  type?: "text" | "email" | "password" | "url" | "textarea" | "select";
  placeholder?: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  error?: string;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  options?: { value: string; label: string }[];
  rows?: number;
}

export default function FormField({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  hint,
  required = false,
  disabled = false,
  options = [],
  rows = 4,
}: FormFieldProps) {
  const inputId = `field-${name}`;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;

  const baseClasses = `input ${disabled ? "disabled" : ""} ${
    error ? "border-[var(--danger)]" : ""
  }`;
  const selectClasses = `select ${disabled ? "disabled" : ""} ${
    error ? "border-[var(--danger)]" : ""
  }`;
  const textareaClasses = `textarea ${disabled ? "disabled" : ""} ${
    error ? "border-[var(--danger)]" : ""
  }`;

  const renderInput = () => {
    switch (type) {
      case "textarea":
        return (
          <textarea
            id={inputId}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            rows={rows}
            className={textareaClasses}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={error ? errorId : hint ? hintId : undefined}
          />
        );
      case "select":
        return (
          <select
            id={inputId}
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            disabled={disabled}
            className={selectClasses}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={error ? errorId : hint ? hintId : undefined}
          >
            <option value="">Select {label.toLowerCase()}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      default:
        return (
          <input
            id={inputId}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            className={baseClasses}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={error ? errorId : hint ? hintId : undefined}
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      <label htmlFor={inputId} className="label">
        {label}
        {required && <span className="text-[var(--danger)] ml-1">*</span>}
      </label>
      {renderInput()}
      {hint && !error && (
        <p id={hintId} className="hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
