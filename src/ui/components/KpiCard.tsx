'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/ui/components/ui/card';
import { LucideIcon } from 'lucide-react';

type Trend = 'up' | 'down' | 'neutral';

interface KpiCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: Trend;
  trendLabel?: string;
  alert?: boolean;
  className?: string;
  animate?: boolean;
  numericValue?: number;
  sparkline?: number[];
}

function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) return null;

  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;

  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * 100;
      const y = 100 - ((v - min) / range) * 100;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg viewBox="0 0 100 100" className="mt-2 h-8 w-full opacity-80" aria-hidden="true">
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={points}
      />
    </svg>
  );
}

function AnimatedNumber({ value, className }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const start = 0;
    const end = value;
    const duration = 800;
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(start + (end - start) * eased).toString();
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  }, [value]);

  return <span ref={ref} className={className}>{value}</span>;
}

export function KpiCard({
  label,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendLabel,
  alert = false,
  className,
  animate = false,
  numericValue,
  sparkline,
}: KpiCardProps) {
  const trendColor: Record<Trend, string> = {
    up: 'text-emerald-400',
    down: 'text-rose-400',
    neutral: 'text-slate-400',
  };

  const trendArrow: Record<Trend, string> = {
    up: '↑',
    down: '↓',
    neutral: '→',
  };

  return (
    <Card
      className={cn(
        'relative overflow-hidden border transition-all duration-200 hover:scale-[1.02] hover:shadow-xl',
        alert
          ? 'border-orange-500/60 bg-orange-950/20'
          : 'border-white/15 glass',
        className,
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-slate-400">{label}</p>
          {Icon && (
            <Icon
              className={cn('h-4 w-4 shrink-0', alert ? 'text-orange-400' : 'text-slate-500')}
              aria-hidden="true"
            />
          )}
        </div>

        <div className="mt-1">
          {animate && typeof numericValue === 'number' ? (
            <AnimatedNumber value={numericValue} className="text-2xl font-bold text-white" />
          ) : (
            <p className="text-2xl font-bold text-white">{value}</p>
          )}
        </div>

        {(subtitle || trend) && (
          <div className="mt-1 flex items-center gap-1.5">
            {trend && (
              <span
                className={cn('text-xs font-medium', trendColor[trend])}
                aria-label={`Tendência: ${trend}`}
              >
                {trendArrow[trend]}
              </span>
            )}
            {(trendLabel ?? subtitle) && (
              <p className="text-xs text-slate-400 truncate">{trendLabel ?? subtitle}</p>
            )}
          </div>
        )}

        {sparkline && sparkline.length > 1 && (
          <div className={cn('text-sky-300', trend === 'down' && 'text-rose-400', trend === 'up' && 'text-emerald-400')}>
            <Sparkline values={sparkline} />
          </div>
        )}

        {alert && (
          <div className="mt-2 rounded-sm bg-orange-500/10 px-2 py-0.5">
            <p className="text-xs font-semibold text-orange-400" role="alert">
              ⚠ Concentração alta
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
