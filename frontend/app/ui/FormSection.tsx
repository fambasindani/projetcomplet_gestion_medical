'use client';

import React from 'react';

interface FormSectionProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

/**
 * Bloc de formulaire standard (carte blanche avec titre optionnel).
 */
export default function FormSection({ title, description, icon, children, className = '' }: FormSectionProps) {
  return (
    <section className={`rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 ${className}`}>
      {(title || icon) && (
        <div className="mb-5">
          <h3 className="flex items-center gap-2 text-base font-semibold text-slate-800">
            {icon && <span className="text-indigo-500">{icon}</span>}
            {title}
          </h3>
          {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
        </div>
      )}
      <div className="space-y-4">{children}</div>
    </section>
  );
}
