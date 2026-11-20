import { CalendarClock, ChevronLeft, ChevronRight, Download, Inbox, Loader2, Mail, MessageCircle, Phone, RefreshCw, Search, Trash2, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { cn } from '@/lib/cn';
import { adminApi, type Enquiry, type EnquiryFilters, type EnquiryList, fmtDateTime, fmtDay, STATUSES, type Stats, type Status } from './api';
import { Alert, btnDanger, btnPrimary, btnSecondary, ConfirmDelete, Drawer, StatusBadge } from './ui';

const whatsappHref = (phone: string) => `https://wa.me/91${phone}`;

function Chip({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 py-1 pl-3 pr-1.5 font-medium text-emerald-800 ring-1 ring-inset ring-emerald-600/20">
      {label}
      <button type="button" onClick={onClear} aria-label={`Remove filter: ${label}`} className="rounded-full p-0.5 hover:bg-emerald-100">
        <X className="h-3.5 w-3.5" />
      </button>
    </span>
  );
}

function Detail({ enquiry, onClose, onChanged, onDeleted }: { enquiry: Enquiry; onClose: () => void; onChanged: (e: Enquiry) => void; onDeleted: () => void }) {
  const [notes, setNotes] = useState(enquiry.notes);
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState('');

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setError('');
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  };

  const row = (label: string, value: string) =>
    value ? (
      <div>
        <dt className="text-xs font-semibold uppercase tracking-wide text-ink-subtle">{label}</dt>
        <dd className="mt-0.5 whitespace-pre-wrap break-words text-navy-900">{value}</dd>
      </div>
    ) : null;

  return (
    <Drawer title={`Enquiry from ${enquiry.name}`} onClose={onClose}>
      <div className="flex items-start justify-between gap-4 border-b border-navy-900/10 p-5">
        <div>
          <h2 className="text-xl font-bold">{enquiry.name}</h2>
          <p className="mt-1 text-sm text-ink-muted">
            {enquiry.type === 'consultation' ? 'Consultation request' : 'Enquiry'} · {fmtDateTime(enquiry.createdAt)}
          </p>
        </div>
        <button type="button" onClick={onClose} aria-label="Close" className="rounded-full p-2 text-ink-muted hover:bg-navy-900/5">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-6 p-5">
        <div className="flex flex-wrap gap-2">
          <a className={btnSecondary} href={`tel:+91${enquiry.phone}`}>
            <Phone className="h-4 w-4" aria-hidden /> Call
          </a>
          <a className={btnSecondary} href={whatsappHref(enquiry.phone)} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="h-4 w-4" aria-hidden /> WhatsApp
          </a>
          <a className={btnSecondary} href={`mailto:${enquiry.email}`}>
            <Mail className="h-4 w-4" aria-hidden /> Email
          </a>
        </div>

        <dl className="grid gap-4 sm:grid-cols-2">
          {row('Phone', enquiry.phone)}
          {row('Email', enquiry.email)}
          {enquiry.type === 'consultation' && (
            <>
              {row('Topic', enquiry.topic)}
              {row('Meeting type', enquiry.meetingType)}
              {row('Preferred date', fmtDay(enquiry.preferredDate))}
              {row('Preferred time', enquiry.preferredTime)}
            </>
          )}
          <div className="sm:col-span-2">{row('Message', enquiry.message)}</div>
        </dl>

        <div>
          <label className="field-label" htmlFor="enq-status">
            Status
          </label>
          <select
            id="enq-status"
            className="field-input capitalize"
            value={enquiry.status}
            disabled={busy}
            onChange={(e) => run(async () => onChanged(await adminApi.updateEnquiry(enquiry.id, { status: e.target.value as Status })))}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="field-label" htmlFor="enq-notes">
            Private notes
          </label>
          <textarea
            id="enq-notes"
            className="field-input min-h-[7rem] resize-y"
            maxLength={5000}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Call outcome, follow-up date, anything to remember. Never shown to the visitor."
          />
          <button type="button" className={cn(btnPrimary, 'mt-2')} disabled={busy || notes === enquiry.notes} onClick={() => run(async () => onChanged(await adminApi.updateEnquiry(enquiry.id, { notes })))}>
            {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />} Save notes
          </button>
        </div>

        {error && <Alert>{error}</Alert>}

        <div className="border-t border-navy-900/10 pt-5">
          {confirming ? (
            <ConfirmDelete
              label={`Delete the enquiry from ${enquiry.name}?`}
              busy={busy}
              onCancel={() => setConfirming(false)}
              onConfirm={() =>
                run(async () => {
                  await adminApi.deleteEnquiry(enquiry.id);
                  onDeleted();
                })
              }
            />
          ) : (
            <button type="button" className={btnDanger} onClick={() => setConfirming(true)}>
              <Trash2 className="h-4 w-4" aria-hidden /> Delete enquiry
            </button>
          )}
        </div>
      </div>
    </Drawer>
  );
}

export const NO_FILTERS: EnquiryFilters = { status: '', type: '', q: '', period: '', upcoming: false, page: 1 };

const PERIOD_LABEL: Record<string, string> = { today: 'Today', week: 'This week', month: 'This month' };

/** `initial` presets the filters, e.g. when arriving from a dashboard card. */
export function EnquiriesPanel({ initial }: { initial?: Partial<EnquiryFilters> }) {
  const [filters, setFilters] = useState<EnquiryFilters>({ ...NO_FILTERS, ...initial });
  const [search, setSearch] = useState(initial?.q ?? '');
  const [list, setList] = useState<EnquiryList | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [selected, setSelected] = useState<Enquiry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [l, s] = await Promise.all([adminApi.listEnquiries(filters), adminApi.stats()]);
      // Deleting the last row of a page leaves it empty: step back one page.
      if (!l.items.length && l.page > 1) return setFilters((f) => ({ ...f, page: l.page - 1 }));
      setList(l);
      setStats(s);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load enquiries.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => void load(), [load]);

  // Debounce the search box.
  useEffect(() => {
    const t = setTimeout(() => setFilters((f) => (f.q === search.trim() ? f : { ...f, q: search.trim(), page: 1 })), 300);
    return () => clearTimeout(t);
  }, [search]);

  const setFilter = (patch: Partial<EnquiryFilters>) => setFilters((f) => ({ ...f, ...patch, page: 1 }));
  const pages = list ? Math.max(1, Math.ceil(list.total / list.pageSize)) : 1;

  return (
    <div className="space-y-6">
      <div className="card p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by status">
            {['', ...STATUSES].map((s) => {
              const active = filters.status === s;
              const count = s === '' ? stats?.total : stats?.byStatus[s as Status];
              return (
                <button
                  key={s || 'all'}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setFilter({ status: s })}
                  className={cn(
                    'rounded-full border px-3.5 py-1.5 text-sm font-medium capitalize transition-colors',
                    active ? 'border-emerald-600 bg-emerald-50 text-emerald-800' : 'border-navy-900/15 text-ink-muted hover:border-navy-900/30',
                  )}
                >
                  {s || 'All'} {count !== undefined && <span className="tabular ml-1 text-xs opacity-70">{count}</span>}
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" aria-hidden />
              <input
                className="field-input !h-10 !py-0 pl-9 sm:w-60"
                type="search"
                placeholder="Search name, phone, email…"
                aria-label="Search enquiries"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select className="field-input !h-10 !w-auto !py-0" aria-label="Filter by date received" value={filters.period} onChange={(e) => setFilter({ period: e.target.value })}>
              <option value="">Any date</option>
              <option value="today">Today</option>
              <option value="week">This week</option>
              <option value="month">This month</option>
            </select>
            <select className="field-input !h-10 !w-auto !py-0" aria-label="Filter by type" value={filters.type} onChange={(e) => setFilter({ type: e.target.value })}>
              <option value="">All types</option>
              <option value="enquiry">Enquiries</option>
              <option value="consultation">Consultations</option>
            </select>
            <button type="button" className={btnSecondary} onClick={() => void load()} aria-label="Refresh">
              <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} aria-hidden />
            </button>
            <a className={btnSecondary} href={adminApi.exportUrl(filters)} download>
              <Download className="h-4 w-4" aria-hidden /> Export CSV
            </a>
          </div>
        </div>

        {(filters.upcoming || filters.period || filters.status || filters.type || filters.q) && (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm" aria-label="Active filters">
            <span className="text-ink-subtle">Showing:</span>
            {filters.upcoming && <Chip label="Upcoming consultations" onClear={() => setFilter({ upcoming: false })} />}
            {filters.period && <Chip label={`Received ${PERIOD_LABEL[filters.period].toLowerCase()}`} onClear={() => setFilter({ period: '' })} />}
            {filters.status && <Chip label={`Status: ${filters.status}`} onClear={() => setFilter({ status: '' })} />}
            {filters.type && <Chip label={filters.type === 'consultation' ? 'Consultations' : 'Enquiries'} onClear={() => setFilter({ type: '' })} />}
            {filters.q && <Chip label={`“${filters.q}”`} onClear={() => { setSearch(''); setFilter({ q: '' }); }} />}
            <button type="button" className="font-medium text-emerald-700 hover:underline" onClick={() => { setSearch(''); setFilters(NO_FILTERS); }}>
              Clear all
            </button>
          </div>
        )}

        {error && <div className="mt-4"><Alert>{error}</Alert></div>}

        <div className="mt-4 overflow-hidden rounded-2xl border border-navy-900/10" aria-busy={loading}>
          {list && list.items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-6 py-16 text-center text-ink-muted">
              <Inbox className="h-8 w-8" aria-hidden />
              <p className="font-medium text-navy-900">No enquiries found</p>
              <p className="text-sm">{filters.status || filters.type || filters.q || filters.period || filters.upcoming ? 'Try clearing the filters.' : 'New enquiries from the website will appear here.'}</p>
            </div>
          ) : (
            <ul className="divide-y divide-navy-900/10">
              {(list?.items ?? []).map((e) => (
                <li key={e.id}>
                  <button type="button" onClick={() => setSelected(e)} className="flex w-full flex-col gap-1 px-4 py-3.5 text-left transition-colors hover:bg-navy-50 sm:flex-row sm:items-center sm:gap-4">
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="flex items-center gap-2">
                        <span className={cn('truncate font-semibold text-navy-900', e.status === 'new' && 'font-bold')}>{e.name}</span>
                        {e.type === 'consultation' && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-gold-100 px-2 py-0.5 text-xs font-semibold text-gold-700">
                            <CalendarClock className="h-3 w-3" aria-hidden /> {fmtDay(e.preferredDate)}
                          </span>
                        )}
                      </span>
                      <span className="truncate text-sm text-ink-muted">{e.message || e.topic}</span>
                    </span>
                    <span className="text-sm text-ink-muted sm:w-32">{e.phone}</span>
                    <span className="text-xs text-ink-subtle sm:w-36">{fmtDateTime(e.createdAt)}</span>
                    <StatusBadge status={e.status} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {list && list.total > list.pageSize && (
          <div className="mt-4 flex items-center justify-between text-sm text-ink-muted">
            <span className="tabular">
              Page {list.page} of {pages} · {list.total} results
            </span>
            <div className="flex gap-2">
              <button type="button" className={btnSecondary} disabled={list.page <= 1} onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}>
                <ChevronLeft className="h-4 w-4" aria-hidden /> Previous
              </button>
              <button type="button" className={btnSecondary} disabled={list.page >= pages} onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}>
                Next <ChevronRight className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </div>
        )}
      </div>

      {selected && (
        <Detail
          key={selected.id}
          enquiry={selected}
          onClose={() => setSelected(null)}
          onChanged={(e) => {
            setSelected(e);
            void load();
          }}
          onDeleted={() => {
            setSelected(null);
            void load();
          }}
        />
      )}
    </div>
  );
}
