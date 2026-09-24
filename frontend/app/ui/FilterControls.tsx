'use client';

import React from 'react';

export const filterInputClass =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100';

interface FilterPanelProps {
  children: React.ReactNode;
  className?: string;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({ children, className = '' }) => {
  return (
    <div className={`mt-5 border-t border-slate-100 pt-5 ${className}`}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">{children}</div>
    </div>
  );
};

type FilterInputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const FilterInput: React.FC<FilterInputProps> = ({ className = '', ...props }) => {
  return <input className={`${filterInputClass} ${className}`} {...props} />;
};

type FilterSelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export const FilterSelect: React.FC<FilterSelectProps> = ({ className = '', children, ...props }) => {
  return (
    <select className={`${filterInputClass} ${className}`} {...props}>
      {children}
    </select>
  );
};
