import { ArrowUpRight, CalendarClock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';
import { type Analytics, adminApi, type Enquiry, type EnquiryFilters, fmtDay, type Stats } from './api';
import { Alert } from './ui';

const CONTENT_LABELS: Record<string, string> = {
  articles: 'Articles',
  homeFaqs: 'Home FAQs',
  educationFaqs: 'Learn FAQs',
  services: 'Services',
  whyChooseUs: 'Why choose us',
  journeySteps: 'How it works',
  settings: 'Site settings',
  seo: 'SEO',
};

const shortDate = (ymd: string) => new Date(`${ymd}T00:00:00Z`).toLocaleDateString('en-IN', { timeZone: 'UTC', day: 'numeric', month: 'short' });

/** A dashboard number that opens the matching, pre-filtered list when clicked. */
function StatCard({ label, value, sub, onClick, highlight }: { label: string; value: string | number; sub?: string; onClick: () => void; highlight?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'card group flex flex-col p-5 text-left transition-all hover:-translate-y-0.5 hover:border-emerald-600/40 hover:shadow-lift',
        highlight && 'border-emerald-600/40 bg-emerald-50/50',
      )}
    >
      <span className="flex items-center justify-between text-sm font-medium text-ink-muted">
        {label}
        <ArrowUpRight className="h-4 w-4 text-ink-subtle transition-colors group-hover:text-emerald-700" aria-hidden />
      </span>
      <span className="tabular mt-1 text-3xl font-bold text-navy-900">{value}</span>
      {sub && <span className="mt-1 text-xs text-ink-subtle">{sub}</span>}
    </button>
  );
}

const ago = (iso: string) => {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60_000));
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  const days = Math.round(hrs / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
};

/** 12-week stacked bar chart with a data table for screen readers and keyboard users. */
function WeeklyChart({ weeks }: { weeks: Analytics['weeks'] }) {
  const max = Math.max(1, ...weeks.map((w) => w.enquiries + w.consultations));
  const W = 560;
  const H = 160;
  const bw = W / weeks.length;
  return (
    <div className="card p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-bold">Enquiries per week</h2>
        <div className="flex gap-4 text-xs text-ink-muted">
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-chart-invested" aria-hidden /> Enquiries</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-chart-value" aria-hidden /> Consultations</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H + 22}`} className="w-full" role="img" aria-label="Stacked bar chart of enquiries and consultation requests for each of the last 12 weeks">
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <line key={f} x1={0} x2={W} y1={H - H * f} y2={H - H * f} stroke="#E9EDF0" strokeWidth={1} />
        ))}
        {weeks.map((w, i) => {
          const eh = (w.enquiries / max) * H;
          const ch = (w.consultations / max) * H;
          const x = i * bw + bw * 0.18;
          const width = bw * 0.64;
          return (
            <g key={w.weekStart}>
              <title>{`Week of ${shortDate(w.weekStart)}: ${w.enquiries} enquiries, ${w.consultations} consultations`}</title>
              <rect x={x} y={H - eh} width={width} height={eh} rx={2} fill="#5B7BC0" />
              <rect x={x} y={H - eh - ch} width={width} height={ch} rx={2} fill="#087F5B" />
              {(i % 2 === 0 || weeks.length < 8) && (
                <text x={x + width / 2} y={H + 16} textAnchor="middle" fontSize={10} fill="#646E84">
                  {shortDate(w.weekStart)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <details className="mt-3 text-sm">
        <summary className="cursor-pointer font-medium text-emerald-700">View as table</summary>
        <table className="tabular mt-2 w-full text-left text-sm">
          <thead>
            <tr className="text-xs uppercase text-ink-subtle">
              <th className="py-1">Week of</th>
              <th>Enquiries</th>
              <th>Consultations</th>
            </tr>
          </thead>
          <tbody>
            {weeks.map((w) => (
              <tr key={w.weekStart} className="border-t border-navy-900/10">
                <td className="py-1">{shortDate(w.weekStart)}</td>
                <td>{w.enquiries}</td>
                <td>{w.consultations}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}

export function Dashboard({ onOpenEnquiries }: { onOpenEnquiries: (preset?: Partial<EnquiryFilters>) => void }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [an, setAn] = useState<Analytics | null>(null);
  const [custom, setCustom] = useState<Record<string, string> | null>(null);
  const [waiting, setWaiting] = useState<Enquiry[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let live = true;
    Promise.all([adminApi.stats(), adminApi.analytics(), adminApi.customised(), adminApi.listEnquiries({ status: 'new', type: '', q: '', period: '', upcoming: false, page: 1 })])
      .then(([s, a, c, w]) => {
        if (!live) return;
        setStats(s);
        setAn(a);
        setCustom(c);
        setWaiting(w.items.slice(0, 5));
      })
      .catch((e) => live && setError(e instanceof Error ? e.message : 'Could not load the dashboard.'));
    return () => {
      live = false;
    };
  }, []);

  if (error) return <Alert>{error}</Alert>;
  if (!stats || !an || !custom) return <p className="py-10 text-center text-ink-muted" role="status">Loading…</p>;

  const topMax = Math.max(1, ...an.topics.map((t) => t.count));
  const { today, week, month } = stats.periods;
  const waitingCount = stats.byStatus.new;

  return (
    <div className="space-y-6">
      <section aria-label="Enquiries received" className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Today" value={today.count} sub={`Yesterday: ${today.previous}`} onClick={() => onOpenEnquiries({ period: 'today' })} />
        <StatCard label="This week" value={week.count} sub={`Last week: ${week.previous}`} onClick={() => onOpenEnquiries({ period: 'week' })} />
        <StatCard label="This month" value={month.count} sub={`Last month: ${month.previous}`} onClick={() => onOpenEnquiries({ period: 'month' })} />
      </section>

      <section aria-label="Needs attention" className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Waiting for a reply"
          value={waitingCount}
          sub={waitingCount ? 'Status: new' : 'All caught up'}
          highlight={waitingCount > 0}
          onClick={() => onOpenEnquiries({ status: 'new' })}
        />
        <StatCard label="Upcoming consultations" value={stats.upcomingConsultations} sub="Open requests from today onwards" onClick={() => onOpenEnquiries({ upcoming: true })} />
        <StatCard
          label="All enquiries"
          value={stats.total}
          sub={an.responseRate === null ? undefined : `${an.responseRate}% handled (spam excluded)`}
          onClick={() => onOpenEnquiries()}
        />
      </section>

      <section className="card p-5 sm:p-6" aria-labelledby="waiting-h">
        <div className="mb-3 flex items-center justify-between">
          <h2 id="waiting-h" className="text-base font-bold">Waiting for a reply</h2>
          {waitingCount > 0 && (
            <button type="button" className="text-sm font-medium text-emerald-700 hover:underline" onClick={() => onOpenEnquiries({ status: 'new' })}>
              View all {waitingCount}
            </button>
          )}
        </div>
        {waiting.length === 0 ? (
          <p className="text-sm text-ink-muted">Nothing is waiting. New enquiries from the website will show up here.</p>
        ) : (
          <ul className="divide-y divide-navy-900/10">
            {waiting.map((e) => (
              <li key={e.id}>
                <button type="button" onClick={() => onOpenEnquiries({ status: 'new', q: e.name })} className="flex w-full items-start gap-3 py-3 text-left transition-colors hover:bg-navy-50/60 sm:items-center">
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate font-semibold text-navy-900">{e.name}</span>
                      {e.type === 'consultation' && (
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-gold-100 px-2 py-0.5 text-xs font-semibold text-gold-700">
                          <CalendarClock className="h-3 w-3" aria-hidden /> {fmtDay(e.preferredDate)}
                        </span>
                      )}
                    </span>
                    <span className="block truncate text-sm text-ink-muted">{e.message || e.topic}</span>
                  </span>
                  <span className="shrink-0 text-xs text-ink-subtle">{ago(e.createdAt)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <WeeklyChart weeks={an.weeks} />

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card p-5 sm:p-6" aria-labelledby="topics-h">
          <h2 id="topics-h" className="mb-4 text-base font-bold">What people ask to discuss</h2>
          {an.topics.length === 0 ? (
            <p className="text-sm text-ink-muted">Consultation topics will appear here once requests come in.</p>
          ) : (
            <ul className="space-y-3">
              {an.topics.map((t) => (
                <li key={t.topic}>
                  <div className="flex justify-between gap-3 text-sm">
                    <span className="font-medium text-navy-900">{t.topic}</span>
                    <span className="tabular text-ink-muted">{t.count}</span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-mist" aria-hidden>
                    <div className="h-2 rounded-full bg-emerald-600" style={{ width: `${(t.count / topMax) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card p-5 sm:p-6" aria-labelledby="upcoming-h">
          <div className="mb-4 flex items-center justify-between">
            <h2 id="upcoming-h" className="text-base font-bold">Upcoming consultations</h2>
            <button type="button" className="text-sm font-medium text-emerald-700 hover:underline" onClick={() => onOpenEnquiries({ upcoming: true })}>
              View all
            </button>
          </div>
          {an.upcoming.length === 0 ? (
            <p className="text-sm text-ink-muted">No consultations are scheduled.</p>
          ) : (
            <ul className="divide-y divide-navy-900/10">
              {an.upcoming.map((e) => (
                <li key={e.id}>
                  <button type="button" onClick={() => onOpenEnquiries({ upcoming: true, q: e.name })} className="flex w-full items-start gap-3 py-3 text-left transition-colors hover:bg-navy-50/60">
                    <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-gold-700" aria-hidden />
                    <span className="min-w-0 text-sm">
                      <span className="block font-semibold text-navy-900">{e.name}</span>
                      <span className="block text-ink-muted">
                        {fmtDay(e.preferredDate)} · {e.preferredTime}
                      </span>
                      <span className="block text-ink-subtle">
                        {e.topic} · {e.meetingType} · {e.phone}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="card p-5 sm:p-6" aria-labelledby="content-h">
        <h2 id="content-h" className="mb-1 text-base font-bold">Site content</h2>
        <p className="mb-4 text-sm text-ink-muted">Sections edited in this panel are live; the rest still use the content built into the site.</p>
        <ul className="flex flex-wrap gap-2">
          {Object.entries(CONTENT_LABELS).map(([key, label]) => (
            <li key={key} className={`rounded-full px-3 py-1 text-sm font-medium ring-1 ring-inset ${custom[key] ? 'bg-emerald-50 text-emerald-800 ring-emerald-600/20' : 'bg-navy-50 text-ink-muted ring-navy-900/10'}`}>
              {label}: {custom[key] ? 'edited' : 'built-in'}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
