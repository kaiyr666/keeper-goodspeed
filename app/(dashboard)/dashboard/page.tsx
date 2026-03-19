'use client';
import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { formatDistanceToNow } from 'date-fns';
import type { DashboardData } from '@/types';
import { KpiTile }          from '@/components/dashboard/KpiTile';
import { AwaitingApproval } from '@/components/dashboard/AwaitingApproval';
import { RecentSubmissions } from '@/components/dashboard/RecentSubmissions';
import { CategoryChart }    from '@/components/dashboard/CategoryChart';
import { formatCurrency }   from '@/lib/utils';

function DashboardSkeleton() {
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-64 mb-8" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-gray-200 rounded-2xl" />)}
      </div>
      <div className="h-64 bg-gray-200 rounded-2xl mb-4" />
      <div className="h-48 bg-gray-200 rounded-2xl" />
    </div>
  );
}

export default function DashboardPage() {
  const { data: session } = useSession({ required: true });
  const [data, setData]               = useState<DashboardData | null>(null);
  const [loading, setLoading]         = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchDashboard = useCallback(async (showSkeleton = false) => {
    if (showSkeleton) setLoading(true);
    const res = await fetch('/api/dashboard');
    if (res.ok) { setData(await res.json()); setLastUpdated(new Date()); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchDashboard(true); }, [fetchDashboard]);

  if (loading || !data) return <DashboardSkeleton />;

  const propertyName = (session?.user as any)?.propertyName ?? 'Dashboard';

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-keeper-navy">{propertyName}</h1>
          {lastUpdated && (
            <p className="text-xs text-gray-400 mt-0.5">
              Last updated {formatDistanceToNow(lastUpdated)} ago
            </p>
          )}
        </div>
        <button onClick={() => fetchDashboard(false)} disabled={loading}
          className="text-sm text-keeper-blue hover:underline disabled:opacity-50">
          ↻ Refresh
        </button>
      </div>

      {/* KPI Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KpiTile
          title="Total Active Assets"
          value={data.kpis.totalActive}
          sub={`Pending: ${data.kpis.pendingApproval} · GM: ${data.kpis.pendingGmApproval} · Approved: ${data.kpis.approved}`}
          color="text-keeper-navy"
        />
        <KpiTile
          title="Estimated Recovery"
          value={formatCurrency(data.kpis.estimatedRecoveryValue)}
          sub={`Recovered this month: ${formatCurrency(data.kpis.actualRecoveryValueThisMonth)}`}
          icon="💰"
          color="text-green-600"
        />
        <KpiTile
          title="CO₂ Diverted"
          value={`${data.kpis.co2KgDiverted.toLocaleString()} kg`}
          sub="From completed disposals"
          icon="🌿"
          color="text-teal-600"
        />
        <KpiTile
          title="Landfill Avoided"
          value={`${data.kpis.weightKgDiverted.toLocaleString()} kg`}
          sub="Estimated from completed items"
          icon="🌍"
          color="text-blue-600"
        />
      </div>

      {/* Awaiting approval */}
      {data.awaitingApproval.length > 0 && (
        <AwaitingApproval batches={data.awaitingApproval} onActionComplete={() => fetchDashboard(false)} />
      )}

      {/* Chart + Recent submissions */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <RecentSubmissions batches={data.recentBatches} />
        </div>
        <div>
          <CategoryChart batches={data.recentBatches} />
        </div>
      </div>
    </div>
  );
}
