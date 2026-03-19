'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/Badge';

export default function MySubmissionsPage() {
  const { data: session } = useSession({ required: true });
  const router = useRouter();
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const role = (session?.user as any)?.role;
    if (role === 'GM') { router.replace('/dashboard'); return; }

    fetch('/api/assets?mine=true')
      .then(r => r.json())
      .then(d => { setBatches(d.batches ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [session, router]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin w-8 h-8 border-4 border-keeper-navy border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-keeper-navy">My Submissions</h1>
        <Link href="/upload" className="text-sm text-keeper-blue hover:underline">+ Upload Assets</Link>
      </div>

      {batches.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 mb-2">You have not submitted any assets yet.</p>
          <p className="text-gray-400 text-sm">
            Tap <Link href="/upload" className="text-keeper-blue hover:underline">Upload Assets</Link> to get started.
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="divide-y divide-gray-50">
            {batches.map(b => (
              <Link key={b.id} href={`/assets/${b.id}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-mono text-xs text-gray-400">{b.referenceId}</span>
                    <Badge status={b.status} />
                  </div>
                  <p className="font-medium text-gray-800 truncate">{b.quantity}× {b.assetType}</p>
                  <p className="text-xs text-gray-400">{formatDistanceToNow(new Date(b.submittedAt))} ago</p>
                </div>
                <span className="text-keeper-blue text-sm">View →</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
