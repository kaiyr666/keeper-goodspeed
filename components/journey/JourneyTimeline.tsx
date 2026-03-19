import { formatDistanceToNow } from 'date-fns';

const EVENT_LABELS: Record<string, string> = {
  SUBMITTED:    'Submitted',
  APPROVED_DEPT:'Department Approved',
  APPROVED_GM:  'GM Approved',
  REJECTED:     'Rejected',
  LISTED:       'Listed',
  COMPLETED:    'Completed',
  COMMENT_ADDED:'Comment Added',
};

const DOT_COLORS: Record<string, string> = {
  SUBMITTED:     'bg-blue-500',
  APPROVED_DEPT: 'bg-teal-500',
  APPROVED_GM:   'bg-green-500',
  REJECTED:      'bg-red-500',
  LISTED:        'bg-purple-500',
  COMPLETED:     'bg-emerald-500',
  COMMENT_ADDED: 'bg-gray-400',
};

export function JourneyTimeline({ events }: { events: any[] }) {
  const reversed = [...events].reverse();

  return (
    <div className="space-y-4">
      {reversed.map((ev: any, i: number) => (
        <div key={ev.id} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className={`w-3.5 h-3.5 rounded-full flex-shrink-0 mt-1 ${DOT_COLORS[ev.eventType] ?? 'bg-gray-400'}`} />
            {i < reversed.length - 1 && <div className="flex-1 w-0.5 bg-gray-200 mt-1" />}
          </div>
          <div className="flex-1 pb-4">
            <p className="font-semibold text-gray-800">{EVENT_LABELS[ev.eventType] ?? ev.eventType}</p>
            {ev.performedBy && (
              <p className="text-sm text-gray-500">by {ev.performedBy.fullName}</p>
            )}
            <p className="text-xs text-gray-400">{formatDistanceToNow(new Date(ev.createdAt))} ago</p>
            {ev.comment && (
              <blockquote className="mt-2 pl-3 border-l-2 border-gray-200 text-sm text-gray-600 italic">
                {ev.comment}
              </blockquote>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
