import { STATUS_LABELS, STATUS_COLORS } from '@/lib/constants';

export function Badge({ status }: { status: string }) {
  return (
    <span className={`badge ${STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
