'use client';
import { useState } from 'react';

interface Props {
  batchId: string;
  onActionComplete: () => void;
}

export function ApprovalActions({ batchId, onActionComplete }: Props) {
  const [action,  setAction]  = useState<'approve' | 'reject' | null>(null);
  const [reason,  setReason]  = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const confirm = async () => {
    if (!action) return;
    if (action === 'reject' && reason.length < 10) {
      setError('Reason must be at least 10 characters.'); return;
    }
    setLoading(true); setError(null);
    const res = await fetch(`/api/assets/${batchId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, comment: action === 'reject' ? reason : undefined }),
    });
    setLoading(false);
    if (res.ok) { setAction(null); setReason(''); onActionComplete(); }
    else        { setError('Something went wrong. Please try again.'); }
  };

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6">
      <h2 className="font-semibold text-amber-800 mb-3">⏳ This asset is awaiting your approval.</h2>

      {!action && (
        <div className="flex gap-3">
          <button onClick={() => setAction('approve')}
            className="flex-1 py-3 bg-green-500 text-white rounded-xl font-medium min-h-[44px]">
            ✓ Approve
          </button>
          <button onClick={() => setAction('reject')}
            className="flex-1 py-3 border border-red-300 text-red-600 rounded-xl font-medium min-h-[44px]">
            ✗ Reject
          </button>
        </div>
      )}

      {action && (
        <div className="mt-2">
          {action === 'reject' && (
            <textarea
              className="w-full input-field text-sm mb-3" rows={3}
              placeholder="Reason for rejection (required, min 10 chars)"
              value={reason}
              onChange={e => setReason(e.target.value)}
            />
          )}
          {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
          <div className="flex gap-2">
            <button onClick={confirm} disabled={loading}
              className={`flex-1 py-3 rounded-xl font-medium text-white min-h-[44px] ${action === 'approve' ? 'bg-green-500' : 'bg-red-500'}`}>
              {loading ? 'Processing…' : action === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
            </button>
            <button onClick={() => { setAction(null); setReason(''); setError(null); }}
              className="px-4 py-3 border rounded-xl text-sm min-h-[44px]">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
