'use client';

import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name?: string;
  error?: string;
  icon?: React.ReactNode;
  required?: boolean;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  name,
  error,
  icon,
  required,
  className = '',
  ...props
}) => {
  const fieldName = name ?? label.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
  return (
    <div className={className}>
      <label htmlFor={fieldName} className="mb-1.5 block text-sm font-semibold text-gray-800">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="group relative">
        {icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex w-11 items-center justify-center rounded-l-xl bg-gray-50 text-gray-400 transition-colors group-focus-within:bg-indigo-50 group-focus-within:text-indigo-500">
            {icon}
          </div>
        )}
        <input
          id={fieldName}
          name={fieldName}
          className={`
            block w-full rounded-xl border py-3 text-sm text-gray-800 shadow-sm outline-none transition-all duration-200 placeholder:text-gray-400
            ${icon ? 'pl-11' : 'px-4'}
            ${error
              ? 'border-red-300 bg-red-50/30 focus:border-red-500 focus:ring-4 focus:ring-red-100'
              : 'border-gray-200 bg-white hover:border-indigo-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100'
            }
          `}
          aria-invalid={!!error}
          {...props}
        />
        {error && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <FaExclamationTriangle className="h-4 w-4 text-red-500" />
          </div>
        )}
      </div>
      {error && <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
};