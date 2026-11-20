import { type ReactNode, useEffect, useRef } from 'react';
import { cn } from '@/lib/cn';
import type { Status } from './api';

export const STATUS_STYLE: Record<Status, string> = {
  new: 'bg-sky-50 text-sky-800 ring-sky-600/20',
  contacted: 'bg-amber-50 text-amber-800 ring-amber-600/20',
  scheduled: 'bg-emerald-50 text-emerald-800 ring-emerald-600/20',
  closed: 'bg-navy-50 text-navy-700 ring-navy-900/10',
  spam: 'bg-red-50 text-red-800 ring-red-600/20',
};

export function StatusBadge({ status }: { status: Status }) {
  return <span className={cn('inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ring-1 ring-inset', STATUS_STYLE[status])}>{status}</span>;
}

export const btn =
  'inline-flex h-10 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50';
export const btnPrimary = `${btn} bg-emerald-600 text-white hover:bg-emerald-700`;
export const btnSecondary = `${btn} border border-navy-900/15 bg-white text-navy-900 hover:border-navy-900/30 hover:bg-navy-50`;
export const btnDanger = `${btn} border border-red-600/30 bg-white text-red-700 hover:bg-red-50`;

export function Alert({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
      {children}
    </p>
  );
}

/** Modal-style side panel with focus handling and Escape to close. */
export function Drawer({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      prev?.focus();
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-navy-950/50" onClick={onClose} aria-hidden />
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative flex h-full w-full max-w-lg flex-col overflow-y-auto bg-white shadow-lift outline-none"
      >
        {children}
      </div>
    </div>
  );
}

/** Small in-page confirmation, used instead of window.confirm. */
export function ConfirmDelete({ label, onConfirm, onCancel, busy }: { label: string; onConfirm: () => void; onCancel: () => void; busy?: boolean }) {
  return (
    <div role="alertdialog" aria-label="Confirm delete" className="rounded-2xl border border-red-600/30 bg-red-50 p-4 text-sm">
      <p className="font-medium text-red-900">{label}</p>
      <p className="mt-1 text-red-800">This cannot be undone.</p>
      <div className="mt-3 flex gap-2">
        <button type="button" className={cn(btn, 'bg-red-700 text-white hover:bg-red-800')} onClick={onConfirm} disabled={busy}>
          {busy ? 'Deleting…' : 'Yes, delete'}
        </button>
        <button type="button" className={btnSecondary} onClick={onCancel} disabled={busy}>
          Cancel
        </button>
      </div>
    </div>
  );
}
