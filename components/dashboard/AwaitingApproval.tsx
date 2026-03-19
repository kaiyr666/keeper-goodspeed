'use client';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';

export function AwaitingApproval({ batches, onActionComplete }:
  { batches: any[]; onActionComplete: () => void }) {

  type AS = { batchId: string; action: 'approve' | 'reject' } | null;
  const [active,  setActive]  = useState<AS>(null);
  const [reason,  setReason]  = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const confirm = async () => {
    if (!active) return;
    if (active.action === 'reject' && reason.length < 10) {
      setError('Reason must be at least 10 characters.'); return;
    }
    setLoading(true); setError(null);
    const res = await fetch(`/api/assets/${active.batchId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: active.action, comment: active.action === 'reject' ? reason : undefined }),
    });
    setLoading(false);
    if (res.ok) { setActive(null); setReason(''); onActionComplete(); }
    else        { setError('Something went wrong. Please try again.'); }
  };

  if (!batches.length) return null;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6">
      <h2 className="font-semibold text-amber-800 mb-3">⏳ Awaiting Your Sign-off ({batches.length})</h2>
      {batches.map(b => (
        <div key={b.id} className="bg-white rounded-xl border border-amber-100 p-3 mb-2 last:mb-0">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="font-semibold">{b.quantity}× {b.assetType}</p>
              <p className="text-sm text-gray-400">
                {b.submittedBy.fullName} · {formatDistanceToNow(new Date(b.submittedAt))} ago
              </p>
            </div>
            {b.estimatedRecoveryValue && (
              <span className="text-green-600 font-semibold text-sm">
                Est. £{Number(b.estimatedRecoveryValue).toLocaleString()}
              </span>
            )}
          </div>
          {active?.batchId !== b.id && (
            <div className="flex gap-2">
              <button onClick={() => setActive({ batchId: b.id, action: 'approve' })}
                className="flex-1 py-3 bg-green-500 text-white rounded-lg text-sm font-medium min-h-[44px]">
                ✓ Approve
              </button>
              <button onClick={() => setActive({ batchId: b.id, action: 'reject' })}
                className="flex-1 py-3 border border-red-300 text-red-600 rounded-lg text-sm font-medium min-h-[44px]">
                ✗ Reject
              </button>
            </div>
          )}
          {active?.batchId === b.id && active && (
            <div className="mt-2 p-3 bg-gray-50 rounded-lg">
              {active.action === 'reject' && (
                <textarea className="w-full input-field text-sm mb-2" rows={2}
                  placeholder="Reason for rejection (required, min 10 chars)"
                  value={reason} onChange={e => setReason(e.target.value)} />
              )}
              {error && <p className="text-red-500 text-xs mb-2">{error}</p>}
              <div className="flex gap-2">
                <button onClick={confirm} disabled={loading}
                  className={`flex-1 py-3 rounded-lg text-sm font-medium text-white min-h-[44px] ${active.action === 'approve' ? 'bg-green-500' : 'bg-red-500'}`}>
                  {loading ? 'Processing…' : active.action === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
                </button>
                <button onClick={() => { setActive(null); setReason(''); setError(null); }}
                  className="px-4 py-3 border rounded-lg text-sm min-h-[44px]">Cancel</button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
