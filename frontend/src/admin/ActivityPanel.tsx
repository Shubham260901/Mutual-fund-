import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { type ActivityEntry, adminApi, fmtDateTime } from './api';
import { Alert, btnSecondary } from './ui';

export function ActivityPanel() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<{ items: ActivityEntry[]; total: number; pageSize: number } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let live = true;
    adminApi
      .activity(page)
      .then((d) => live && setData(d))
      .catch((e) => live && setError(e instanceof Error ? e.message : 'Could not load activity.'));
    return () => {
      live = false;
    };
  }, [page]);

  if (error) return <Alert>{error}</Alert>;
  if (!data) return <p className="py-10 text-center text-ink-muted" role="status">Loading…</p>;
  const pages = Math.max(1, Math.ceil(data.total / data.pageSize));

  return (
    <div className="card p-4 sm:p-5">
      <p className="mb-3 text-sm text-ink-muted">A record of changes made in this panel. The most recent 5,000 entries are kept.</p>
      {data.items.length === 0 ? (
        <p className="py-10 text-center text-ink-muted">Nothing recorded yet.</p>
      ) : (
        <ul className="divide-y divide-navy-900/10 overflow-hidden rounded-2xl border border-navy-900/10">
          {data.items.map((a) => (
            <li key={a.id} className="flex flex-col gap-0.5 px-4 py-3 sm:flex-row sm:items-center sm:gap-4">
              <span className="font-semibold text-navy-900 sm:w-56">{a.action}</span>
              <span className="min-w-0 flex-1 break-words text-sm text-ink-muted">{a.detail}</span>
              <time dateTime={a.at} className="text-xs text-ink-subtle sm:w-40 sm:text-right">
                {fmtDateTime(a.at)}
              </time>
            </li>
          ))}
        </ul>
      )}
      {data.total > data.pageSize && (
        <div className="mt-4 flex items-center justify-between text-sm text-ink-muted">
          <span className="tabular">
            Page {page} of {pages}
          </span>
          <div className="flex gap-2">
            <button type="button" className={btnSecondary} disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft className="h-4 w-4" aria-hidden /> Newer
            </button>
            <button type="button" className={btnSecondary} disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
              Older <ChevronRight className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
