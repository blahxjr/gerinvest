import React from 'react';

function SkeletonBlock({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-slate-700 ${className}`} />;
}

export function KpiCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-white/10 bg-slate-800 p-4 shadow-lg">
          <SkeletonBlock className="h-4 w-24 mb-2" />
          <SkeletonBlock className="h-8 w-32" />
        </div>
      ))}
    </div>
  );
}

export function ChartsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-white/10 bg-slate-800 p-4 shadow-lg">
          <SkeletonBlock className="h-5 w-40 mb-3" />
          <SkeletonBlock className="h-64 w-full" />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-800 p-4 shadow-lg">
      <SkeletonBlock className="h-5 w-40 mb-4" />
      {Array.from({ length: 8 }).map((_, i) => (
        <SkeletonBlock key={i} className="h-8 w-full mb-2" />
      ))}
    </div>
  );
}

export default SkeletonBlock;
