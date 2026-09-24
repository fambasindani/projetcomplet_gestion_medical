'use client';

import React from 'react';
import type { IconType } from 'react-icons';

interface InfoCardProps {
  icon: IconType;
  label: string;
  value?: React.ReactNode;
  className?: string;
}

/**
 * Carte d'information standard pour les pages "détails"
 * (icône + libellé + valeur).
 */
export function InfoCard({ icon: Icon, label, value, className = '' }: InfoCardProps) {
  return (
    <div className={`flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-4 ${className}`}>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-500">
        <Icon />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
        <p className="break-words text-sm font-medium text-slate-800">{value ?? '—'}</p>
      </div>
    </div>
  );
}

interface InfoGridProps {
  children: React.ReactNode;
  className?: string;
}

/** Grille responsive standard d'InfoCard. */
export function InfoGrid({ children, className = '' }: InfoGridProps) {
  return (
    <div className={`grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3 ${className}`}>
      {children}
    </div>
  );
}
