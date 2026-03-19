import { Badge } from '@/components/ui/Badge';
import { DEPARTMENT_LABELS } from '@/lib/constants';
import { formatDistanceToNow } from 'date-fns';

export function JourneyHeader({ batch }: { batch: any }) {
  return (
    <div className="mb-6">
      <p className="font-mono text-keeper-blue text-sm mb-1">{batch.referenceId}</p>
      <h1 className="text-2xl font-bold text-keeper-navy mb-2">
        {batch.quantity}× {batch.assetType}
      </h1>
      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
        <Badge status={batch.status} />
        <span>{DEPARTMENT_LABELS[batch.department] ?? batch.department}</span>
        <span>by {batch.submittedBy.fullName}</span>
        <span>{formatDistanceToNow(new Date(batch.submittedAt))} ago</span>
      </div>
    </div>
  );
}
