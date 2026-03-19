import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/Badge';
import { DEPARTMENT_LABELS } from '@/lib/constants';

export function RecentSubmissions({ batches }: { batches: any[] }) {
  if (!batches.length) return (
    <div className="card text-center text-gray-400 py-8">No submissions yet.</div>
  );

  return (
    <div className="card overflow-hidden p-0">
      <div className="px-4 py-3 border-b border-gray-100">
        <h2 className="font-semibold text-gray-700">Recent Submissions</h2>
      </div>
      <div className="divide-y divide-gray-50">
        {batches.map(b => (
          <Link key={b.id} href={`/assets/${b.id}`}
            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
            {b.photos[0] && (
              <img src={b.photos[0].storageUrl}
                className="w-10 h-10 object-cover rounded-lg flex-shrink-0" alt="" />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-800 truncate">
                  {b.quantity}× {b.assetType}
                </span>
                <Badge status={b.status} />
              </div>
              <div className="text-xs text-gray-400">
                {b.submittedBy.fullName} · {DEPARTMENT_LABELS[b.submittedBy.department] ?? b.submittedBy.department} · {formatDistanceToNow(new Date(b.submittedAt))} ago
              </div>
            </div>
            <span className="font-mono text-xs text-gray-400 flex-shrink-0">{b.referenceId}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
