import React from 'react';

interface TableContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function TableContainer({ children, className = '' }: TableContainerProps) {
  return (
    <div className={`overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 ${className}`}>
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export function Table({ children, className = '' }: TableProps) {
  return <table className={`w-full text-left text-sm ${className}`}>{children}</table>;
}

interface THeadProps {
  children: React.ReactNode;
}

export function THead({ children }: THeadProps) {
  return <thead className="border-b border-gray-100 bg-gray-50/50">{children}</thead>;
}

interface ThProps {
  children?: React.ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export function Th({ children, align = 'left', className = '' }: ThProps) {
  const alignClass = align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';
  return (
    <th className={`px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 ${alignClass} ${className}`}>
      {children}
    </th>
  );
}

interface TBodyProps {
  children: React.ReactNode;
}

export function TBody({ children }: TBodyProps) {
  return <tbody className="divide-y divide-gray-50">{children}</tbody>;
}

interface TrProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function Tr({ children, onClick, className = '' }: TrProps) {
  return (
    <tr onClick={onClick} className={`transition-colors hover:bg-gray-50/50 ${onClick ? 'cursor-pointer' : ''} ${className}`}>
      {children}
    </tr>
  );
}

interface TdProps {
  children?: React.ReactNode;
  className?: string;
  colSpan?: number;
}

export function Td({ children, className = '', colSpan }: TdProps) {
  return <td className={`px-5 py-3 ${className}`} colSpan={colSpan}>{children}</td>;
}
