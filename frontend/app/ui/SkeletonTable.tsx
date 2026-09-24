'use client';

import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

interface SkeletonTableProps {
  columns?: number;
  rows?: number;
  withHeader?: boolean;
}

const SkeletonTable: React.FC<SkeletonTableProps> = ({ columns = 6, rows = 8, withHeader = true }) => {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
      {withHeader && (
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <Skeleton height={20} width={220} />
          <div className="flex gap-2">
            <Skeleton height={36} width={110} borderRadius={8} />
            <Skeleton height={36} width={130} borderRadius={8} />
          </div>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50/50">
            <tr>
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="px-5 py-3">
                  <Skeleton height={12} width={90} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {Array.from({ length: rows }).map((_, r) => (
              <tr key={r}>
                {Array.from({ length: columns }).map((_, c) => (
                  <td key={c} className="px-5 py-4">
                    <Skeleton height={14} width={`${85 - (c % 3) * 15}%`} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
        <Skeleton height={14} width={180} />
        <div className="flex gap-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} height={32} width={32} borderRadius={6} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SkeletonTable;
