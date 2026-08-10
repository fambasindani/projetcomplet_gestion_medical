'use client';

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
}

const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md hover:from-indigo-600 hover:to-purple-700',
  secondary: 'border border-gray-300 bg-white text-gray-600 hover:bg-gray-50',
  danger: 'bg-red-600 text-white shadow-sm hover:bg-red-700',
  ghost: 'text-gray-600 hover:bg-gray-50',
};

const sizes: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
};

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className = '',
  ...props
}) => {
  return (
    <button
      className={`inline-flex items-center gap-2 rounded-lg font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
};

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  color?: 'indigo' | 'blue' | 'red' | 'green' | 'gray';
}

const iconColors: Record<NonNullable<IconButtonProps['color']>, string> = {
  indigo: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100',
  blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
  red: 'bg-red-50 text-red-600 hover:bg-red-100',
  green: 'bg-green-50 text-green-600 hover:bg-green-100',
  gray: 'bg-gray-50 text-gray-600 hover:bg-gray-100',
};

export const IconButton: React.FC<IconButtonProps> = ({
  color = 'gray',
  children,
  className = '',
  ...props
}) => {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg p-2 transition ${iconColors[color]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
