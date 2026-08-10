'use client';

import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  name?: string;
  error?: string;
  required?: boolean;
}

export const FormTextarea: React.FC<FormTextareaProps> = ({
  label,
  name,
  error,
  required,
  className = '',
  ...props
}) => {
  const fieldName = name ?? (label ? label.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') : undefined);
  return (
    <div className={className}>
      {label && (
        <label htmlFor={fieldName} className="mb-1.5 block text-sm font-semibold text-gray-800">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <textarea
        id={fieldName}
        name={fieldName}
        className={`
          block w-full rounded-xl border px-4 py-3 text-sm text-gray-800 shadow-sm outline-none transition-all duration-200 placeholder:text-gray-400
          ${error
            ? 'border-red-300 bg-red-50/30 focus:border-red-500 focus:ring-4 focus:ring-red-100'
            : 'border-gray-200 bg-white hover:border-indigo-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100'
          }
        `}
        aria-invalid={!!error}
        rows={4}
        {...props}
      />
      {error && (
        <div className="flex items-center gap-1.5 mt-1.5 text-xs font-medium text-red-600">
          <FaExclamationTriangle className="h-3.5 w-3.5" /> {error}
        </div>
      )}
    </div>
  );
};