'use client';
import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { JourneyHeader }   from '@/components/journey/JourneyHeader';
import { JourneyTimeline } from '@/components/journey/JourneyTimeline';
import { ApprovalActions } from '@/components/journey/ApprovalActions';

export default function AssetJourneyPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession({ required: true });
  const [batch, setBatch]         = useState<any>(null);
  const [loading, setLoading]     = useState(true);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  const fetchBatch = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/assets/${params.id}`);
    if (res.ok) setBatch(await res.json());
    setLoading(false);
  }, [params.id]);

  useEffect(() => { fetchBatch(); }, [fetchBatch]);

  if (loading) return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-48 mb-4" />
      <div className="h-10 bg-gray-200 rounded w-96 mb-8" />
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex gap-4 mb-6">
          <div className="w-4 h-4 bg-gray-200 rounded-full mt-1 shrink-0" />
          <div className="flex-1 h-16 bg-gray-200 rounded-xl" />
        </div>
      ))}
    </div>
  );

  if (!batch) return (
    <div className="flex items-center justify-center min-h-screen text-gray-500">
      Asset not found.
    </div>
  );

  const isGM = (session?.user as any)?.role === 'GM';
  const canApprove = isGM && batch.status === 'PENDING_GM_APPROVAL';

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      {/* Approval panel */}
      {canApprove && (
        <ApprovalActions batchId={batch.id} onActionComplete={fetchBatch} />
      )}

      {/* Header */}
      <JourneyHeader batch={batch} />

      {/* Photo row */}
      {batch.photos.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-2 mb-6">
          {batch.photos.map((p: any) => (
            <img
              key={p.id}
              src={p.storageUrl}
              onClick={() => setLightboxSrc(p.storageUrl)}
              className="w-24 h-24 object-cover rounded-xl flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
              alt="Asset photo"
            />
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxSrc && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center"
          onClick={() => setLightboxSrc(null)}
        >
          <img src={lightboxSrc} className="max-h-[90vh] max-w-[90vw] rounded-xl" alt="Full size" />
        </div>
      )}

      {/* Details card */}
      <div className="card mb-6">
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <div><dt className="text-gray-400">Category</dt><dd className="font-medium">{batch.category}</dd></div>
          <div><dt className="text-gray-400">Condition</dt><dd className="font-medium">{batch.condition}</dd></div>
          {batch.yearOfPurchase && <div><dt className="text-gray-400">Year</dt><dd className="font-medium">{batch.yearOfPurchase}</dd></div>}
          {batch.brand && <div><dt className="text-gray-400">Brand</dt><dd className="font-medium">{batch.brand}</dd></div>}
          {batch.locationWithinProperty && <div className="col-span-2"><dt className="text-gray-400">Location</dt><dd className="font-medium">{batch.locationWithinProperty}</dd></div>}
          {batch.notes && <div className="col-span-2"><dt className="text-gray-400">Notes</dt><dd className="font-medium">{batch.notes}</dd></div>}
          {batch.estimatedRecoveryValue && <div><dt className="text-gray-400">Est. Recovery</dt><dd className="font-medium text-green-600">£{Number(batch.estimatedRecoveryValue).toLocaleString()}</dd></div>}
          {batch.actualRecoveryValue && <div><dt className="text-gray-400">Actual Recovery</dt><dd className="font-medium text-green-700">£{Number(batch.actualRecoveryValue).toLocaleString()}</dd></div>}
        </dl>
      </div>

      {/* Timeline */}
      <div className="card mb-6">
        <h2 className="font-semibold text-gray-700 mb-4">Asset Journey</h2>
        <JourneyTimeline events={batch.journeyEvents} />
      </div>

      {/* Print button */}
      <button onClick={() => window.print()} className="no-print btn-secondary max-w-xs">
        Print / Export PDF
      </button>
    </div>
  );
}
