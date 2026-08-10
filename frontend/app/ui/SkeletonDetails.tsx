'use client';

import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const SkeletonDetails: React.FC = () => {
  return (
    <div className="space-y-6 p-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
        <div className="flex items-center gap-4">
          <Skeleton circle height={48} width={48} />
          <div className="flex-1 space-y-2">
            <Skeleton height={20} width="40%" />
            <Skeleton height={14} width="25%" />
          </div>
          <Skeleton height={36} width={110} borderRadius={8} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <Skeleton height={18} width="35%" />
            {Array.from({ length: 4 }).map((__, j) => (
              <div key={j} className="flex items-center justify-between">
                <Skeleton height={13} width="30%" />
                <Skeleton height={13} width="45%" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkeletonDetails;
