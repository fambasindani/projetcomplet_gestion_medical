'use client';

import React from 'react';

interface DetailBannerProps {
  title: string;
  subtitle?: string;
  meta?: string;
  badges?: React.ReactNode;
  children?: React.ReactNode;
}

/**
 * En-tête standard des pages "détails" : bandeau marine + corps optionnel.
 */
export default function DetailBanner({ title, subtitle, meta, badges, children }: DetailBannerProps) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
      <div className="flex flex-wrap items-start justify-between gap-4 bg-slate-900 px-6 py-5 text-white">
        <div className="min-w-0">
          {meta && <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">{meta}</p>}
          <h2 className="text-sm font-semibold sm:text-base">{title}</h2>
          {subtitle && <p className="text-sm text-slate-300">{subtitle}</p>}
        </div>
        {badges && <div className="flex flex-wrap gap-2">{badges}</div>}
      </div>
      {children}
    </div>
  );
}
