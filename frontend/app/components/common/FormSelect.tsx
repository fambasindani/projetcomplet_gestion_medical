'use client';

import React from 'react';
import { FaChevronDown, FaExclamationTriangle } from 'react-icons/fa';

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  name?: string;
  options: { value: string | number; label: string }[];
  error?: string;
  icon?: React.ReactNode;
  required?: boolean;
}

export const FormSelect: React.FC<FormSelectProps> = ({
  label,
  name,
  options,
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
        <select
          id={fieldName}
          name={fieldName}
          className={`
            block w-full appearance-none rounded-xl border py-3 pr-10 text-sm text-gray-800 shadow-sm outline-none transition-all duration-200
            ${icon ? 'pl-11' : 'px-4'}
            ${error
              ? 'border-red-300 bg-red-50/30 focus:border-red-500 focus:ring-4 focus:ring-red-100'
              : 'border-gray-200 bg-white hover:border-indigo-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100'
            }
          `}
          aria-invalid={!!error}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          {error ? (
            <FaExclamationTriangle className="h-4 w-4 text-red-500" />
          ) : (
            <FaChevronDown className="h-3.5 w-3.5 text-gray-400" />
          )}
        </div>
      </div>
      {error && <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
};