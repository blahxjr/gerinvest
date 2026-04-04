#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, '..', 'src', 'ui', 'components', 'base');

// Create directory recursively
fs.mkdirSync(baseDir, { recursive: true }, (err) => {
  if (err && err.code !== 'EEXIST') {
    console.error('Error creating directory:', err);
    process.exit(1);
  }
});

const files = {
  'index.ts': `export { default as Button } from './Button';
export { default as Card } from './Card';
export { default as Badge } from './Badge';
export { default as Skeleton, KpiCardsSkeleton, ChartsSkeleton, TableSkeleton } from './Skeleton';
export { default as EmptyState } from './EmptyState';
export { default as PageHeader } from './PageHeader';
export { default as KpiCard } from './KpiCard';
`,
  'Button.tsx': `'use client';
import { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  children: ReactNode;
};

const variantClasses: Record<Variant, string> = {
  primary:   'bg-sky-600 hover:bg-sky-500 text-white border-transparent',
  secondary: 'bg-slate-700 hover:bg-slate-600 text-slate-100 border-slate-600',
  danger:    'bg-red-700 hover:bg-red-600 text-white border-transparent',
  ghost:     'bg-transparent hover:bg-slate-700 text-slate-300 border-slate-600',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  className = '',
  ...props
}: Props) {
  return (
    <button
      disabled={disabled || loading}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-lg border font-medium',
        'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        className,
      ].join(' ')}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
      )}
      {children}
    </button>
  );
}
`,
  'Card.tsx': `import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  className?: string;
  padded?: boolean;
};

export default function Card({ children, className = '', padded = true }: Props) {
  return (
    <div
      className={[
        'rounded-xl border border-white/10 bg-slate-800 shadow-lg',
        padded ? 'p-4' : '',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  );
}
`,
  'Badge.tsx': `import { ReactNode } from 'react';

type Variant = 'default' | 'success' | 'warning' | 'danger' | 'info';

type Props = {
  children: ReactNode;
  variant?: Variant;
  className?: string;
};

const variantClasses: Record<Variant, string> = {
  default: 'bg-slate-700 text-slate-200',
  success: 'bg-emerald-900/60 text-emerald-300 border border-emerald-700',
  warning: 'bg-amber-900/60 text-amber-300 border border-amber-700',
  danger:  'bg-red-900/60 text-red-300 border border-red-700',
  info:    'bg-sky-900/60 text-sky-300 border border-sky-700',
};

export default function Badge({ children, variant = 'default', className = '' }: Props) {
  return (
    <span
      className={[
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variantClasses[variant],
        className,
      ].join(' ')}
    >
      {children}
    </span>
  );
}
`,
  'Skeleton.tsx': `type Props = {
  className?: string;
  rows?: number;
};

export default function Skeleton({ className = '', rows = 1 }: Props) {
  if (rows > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className={['h-4 rounded bg-slate-700 animate-pulse', className].join(' ')} />
        ))}
      </div>
    );
  }
  return <div className={['rounded bg-slate-700 animate-pulse', className].join(' ')} />;
}

export function KpiCardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-24 rounded-xl bg-slate-800 animate-pulse" />
      ))}
    </div>
  );
}

export function ChartsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="h-64 rounded-xl bg-slate-800 animate-pulse" />
      <div className="h-64 rounded-xl bg-slate-800 animate-pulse" />
    </div>
  );
}

export function TableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-800 p-4 space-y-3">
      <div className="h-5 w-40 rounded bg-slate-700 animate-pulse" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-10 rounded bg-slate-700/60 animate-pulse" />
      ))}
    </div>
  );
}
`,
  'EmptyState.tsx': `import { ReactNode } from 'react';
import Button from './Button';

type Props = {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  action?: ReactNode;
};

export default function EmptyState({ icon = '📭', title, description, actionLabel, onAction, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
      <span className="text-5xl" aria-hidden="true">{icon}</span>
      <h3 className="text-lg font-semibold text-slate-200">{title}</h3>
      {description && <p className="text-sm text-slate-400 max-w-sm">{description}</p>}
      {action ?? (actionLabel && onAction && <Button onClick={onAction}>{actionLabel}</Button>)}
    </div>
  );
}
`,
  'PageHeader.tsx': `import { ReactNode } from 'react';

type Props = {
  title: string;
  description?: string;
  actions?: ReactNode;
};

export default function PageHeader({ title, description, actions }: Props) {
  return (
    <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold text-sky-300">{title}</h1>
        {description && <p className="text-sm text-slate-400 mt-1">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
`,
  'KpiCard.tsx': `import { ReactNode } from 'react';

type Props = {
  label: string;
  value: string | number;
  icon?: string;
  alert?: boolean;
  sub?: ReactNode;
};

export default function KpiCard({ label, value, icon, alert = false, sub }: Props) {
  return (
    <div
      className={[
        'rounded-xl border p-4 shadow-lg',
        alert ? 'border-red-500 bg-red-900/20' : 'border-white/10 bg-slate-800',
      ].join(' ')}
    >
      <p className={['text-sm', alert ? 'text-red-400' : 'text-slate-400'].join(' ')}>
        {icon && <span aria-hidden="true" className="mr-1">{icon}</span>}
        {label}
      </p>
      <p className={['text-2xl font-bold mt-1', alert ? 'text-red-300' : 'text-white'].join(' ')}>
        {value}
      </p>
      {sub && <div className="mt-1 text-xs text-slate-500">{sub}</div>}
    </div>
  );
}
`,
};

// Create all files synchronously
for (const [filename, content] of Object.entries(files)) {
  const filepath = path.join(baseDir, filename);
  try {
    fs.writeFileSync(filepath, content, 'utf8');
    console.log('✓ Created:', filepath);
  } catch (err) {
    console.error('✗ Error creating', filepath, ':', err.message);
    process.exit(1);
  }
}

console.log('\n✓ All files created successfully in:', baseDir);
