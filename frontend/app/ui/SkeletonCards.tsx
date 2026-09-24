'use client';

import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

interface SkeletonCardsProps {
  cards?: number;
}

const SkeletonCards: React.FC<SkeletonCardsProps> = ({ cards = 4 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: cards }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <Skeleton height={6} className="!rounded-none" />
          <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center">
            <div className="flex items-center gap-4">
              <Skeleton circle height={48} width={48} />
              <div className="space-y-2">
                <Skeleton height={16} width={180} />
                <Skeleton height={12} width={220} />
              </div>
            </div>
            <div className="grid flex-1 grid-cols-2 gap-3 md:grid-cols-4">
              {Array.from({ length: 4 }).map((__, j) => (
                <div key={j} className="space-y-2">
                  <Skeleton height={10} width={50} />
                  <Skeleton height={13} width={80} />
                </div>
              ))}
            </div>
            <div className="flex shrink-0 gap-2">
              <Skeleton height={36} width={140} borderRadius={8} />
              <Skeleton height={36} width={36} borderRadius={8} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonCards;
