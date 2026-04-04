import React from 'react';

type BadgeProps = {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
};

const variantClasses: Record<string, string> = {
  default: 'bg-slate-700 text-slate-200',
  success: 'bg-emerald-900/50 text-emerald-300',
  warning: 'bg-amber-900/50 text-amber-300',
  danger: 'bg-red-900/50 text-red-300',
  info: 'bg-sky-900/50 text-sky-300',
};

export default function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
