'use client';

import React from 'react';
import { FaChevronLeft, FaChevronRight, FaAngleDoubleLeft, FaAngleDoubleRight } from 'react-icons/fa';

interface PaginationProps {
  pageIndex: number;
  totalPages: number;
  totalCount?: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
}

type PageItem = number | '...';

const Pagination: React.FC<PaginationProps> = ({
  pageIndex,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
}) => {
  const getPageNumbers = (): PageItem[] => {
    const delta = 2;
    const range: number[] = [];
    const rangeWithDots: PageItem[] = [];
    let lastPage: number | undefined;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= pageIndex - delta && i <= pageIndex + delta)) {
        range.push(i);
      }
    }

    range.forEach((pageNumber) => {
      if (lastPage !== undefined) {
        if (pageNumber - lastPage === 2) {
          rangeWithDots.push(lastPage + 1);
        } else if (pageNumber - lastPage > 2) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(pageNumber);
      lastPage = pageNumber;
    });

    return rangeWithDots;
  };

  const start = totalCount !== undefined ? (pageIndex - 1) * (pageSize ?? 10) + 1 : undefined;
  const end = totalCount !== undefined ? Math.min(pageIndex * (pageSize ?? 10), totalCount) : undefined;

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col items-center justify-between gap-4 rounded-lg border-t border-gray-200 bg-white px-4 py-3 sm:flex-row sm:px-6">
      {/* Info text */}
      {start !== undefined && end !== undefined && (
        <div className="text-sm text-gray-500">
          Affichage de <strong className="font-semibold text-indigo-600">{start}-{end}</strong> sur{' '}
          <strong className="font-semibold text-indigo-600">{totalCount}</strong> éléments
        </div>
      )}

      {/* Pagination buttons */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(1)}
          disabled={pageIndex === 1}
          className="rounded-md border border-gray-300 p-2 text-gray-500 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FaAngleDoubleLeft size={14} />
        </button>
        <button
          onClick={() => onPageChange(pageIndex - 1)}
          disabled={pageIndex === 1}
          className="rounded-md border border-gray-300 p-2 text-gray-500 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FaChevronLeft size={14} />
        </button>

        {getPageNumbers().map((page, idx) =>
          typeof page === 'number' ? (
            <button
              key={idx}
              onClick={() => onPageChange(page)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                page === pageIndex
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {page}
            </button>
          ) : (
            <span key={idx} className="px-2 text-gray-400">...</span>
          )
        )}

        <button
          onClick={() => onPageChange(pageIndex + 1)}
          disabled={pageIndex === totalPages}
          className="rounded-md border border-gray-300 p-2 text-gray-500 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FaChevronRight size={14} />
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={pageIndex === totalPages}
          className="rounded-md border border-gray-300 p-2 text-gray-500 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FaAngleDoubleRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;