import { Suspense } from 'react';
import ProventosClient from './ProventosClient';
import { AppLayout } from '@/ui/components/AppLayout';

export default function ProventosPage() {
  return (
    <AppLayout>
      <Suspense fallback={
        <div className="space-y-4">
          <div className="h-8 w-48 rounded-lg bg-slate-800 animate-pulse" />
          <div className="h-64 rounded-xl bg-slate-800 animate-pulse" />
        </div>
      }>
        <ProventosClient />
      </Suspense>
    </AppLayout>
  );
}
