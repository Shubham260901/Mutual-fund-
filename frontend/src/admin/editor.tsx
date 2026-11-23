import { ArrowDown, ArrowUp, Check, Loader2, RotateCcw, Save, Trash2 } from 'lucide-react';
import { type Dispatch, type ReactNode, type SetStateAction, useCallback, useEffect, useId, useRef, useState } from 'react';
import { type ContentKey, type ContentMap, DEFAULTS } from '@/content/runtime';
import { cn } from '@/lib/cn';
import { adminApi } from './api';
import { Alert, btnPrimary, btnSecondary, ConfirmDelete } from './ui';

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));

/** True while any open editor has unsaved changes. */
const unsaved = { current: false };

/** Asks before navigating away from an editor with unsaved changes. Returns true when it is OK to go. */
export function confirmDiscard(): boolean {
  return !unsaved.current || window.confirm('You have unsaved changes. Leave without saving?');
}

/**
 * Loads one editable content document, tracks unsaved changes, and saves / resets it.
 * A document that was never customised starts from the site's built-in content.
 */
export function useDoc<K extends ContentKey>(key: K) {
  const [value, setValue] = useState<ContentMap[K] | null>(null);
  const [saved, setSaved] = useState('');
  const [custom, setCustom] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    let live = true;
    setValue(null);
    setLoadError('');
    adminApi
      .getContent(key)
      .then((v) => {
        if (!live) return;
        const doc = v ?? clone(DEFAULTS[key]);
        setValue(doc);
        setSaved(JSON.stringify(doc));
        setCustom(v !== null);
      })
      .catch((e) => live && setLoadError(e instanceof Error ? e.message : 'Could not load.'));
    return () => {
      live = false;
    };
  }, [key]);

  const dirty = value !== null && JSON.stringify(value) !== saved;

  // Warn before closing the tab (or switching section) with unsaved changes.
  useEffect(() => {
    unsaved.current = dirty;
    return () => {
      unsaved.current = false;
    };
  }, [dirty]);
  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [dirty]);

  const save = useCallback(async () => {
    if (value === null) return;
    setBusy(true);
    setError('');
    try {
      const stored = await adminApi.saveContent(key, value);
      setValue(stored);
      setSaved(JSON.stringify(stored));
      setCustom(true);
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2500);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save.');
    } finally {
      setBusy(false);
    }
  }, [key, value]);

  const discard = () => {
    setValue(saved ? (JSON.parse(saved) as ContentMap[K]) : null);
    setError('');
  };

  const reset = async () => {
    setBusy(true);
    setError('');
    try {
      await adminApi.resetContent(key);
      const doc = clone(DEFAULTS[key]);
      setValue(doc);
      setSaved(JSON.stringify(doc));
      setCustom(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not reset.');
    } finally {
      setBusy(false);
    }
  };

  return { value, setValue, dirty, custom, loadError, busy, error, justSaved, save, discard, reset } satisfies Doc<K>;
}

export interface Doc<K extends ContentKey> {
  value: ContentMap[K] | null;
  setValue: Dispatch<SetStateAction<ContentMap[K] | null>>;
  /** Unsaved edits exist. */
  dirty: boolean;
  /** Stored in the database (as opposed to showing the built-in content). */
  custom: boolean;
  loadError: string;
  busy: boolean;
  error: string;
  justSaved: boolean;
  save: () => Promise<void>;
  discard: () => void;
  reset: () => Promise<void>;
}

/** Save / discard / reset bar, pinned to the bottom of the viewport while editing. */
export function SaveBar({ doc, resetLabel = 'Reset to built-in content' }: { doc: Omit<Doc<ContentKey>, 'value' | 'setValue' | 'loadError'>; resetLabel?: string }) {
  const [confirming, setConfirming] = useState(false);
  return (
    <div className="sticky bottom-0 z-20 -mx-4 mt-8 border-t border-navy-900/10 bg-white/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
      {doc.error && (
        <div className="mb-3">
          <Alert>{doc.error}</Alert>
        </div>
      )}
      {confirming && (
        <div className="mb-3">
          <ConfirmDelete
            label="Discard all your edits here and go back to the content built into the site?"
            busy={doc.busy}
            onCancel={() => setConfirming(false)}
            onConfirm={async () => {
              await doc.reset();
              setConfirming(false);
            }}
          />
        </div>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" className={btnPrimary} disabled={!doc.dirty || doc.busy} onClick={() => void doc.save()}>
          {doc.busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Save className="h-4 w-4" aria-hidden />}
          Save changes
        </button>
        <button type="button" className={btnSecondary} disabled={!doc.dirty || doc.busy} onClick={doc.discard}>
          Discard
        </button>
        {doc.custom && (
          <button type="button" className={cn(btnSecondary, 'ml-auto')} disabled={doc.busy} onClick={() => setConfirming(true)}>
            <RotateCcw className="h-4 w-4" aria-hidden /> {resetLabel}
          </button>
        )}
        <span className="text-sm" role="status" aria-live="polite">
          {doc.justSaved ? (
            <span className="inline-flex items-center gap-1 font-medium text-brand-700">
              <Check className="h-4 w-4" aria-hidden /> Saved. Live on the site now.
            </span>
          ) : doc.dirty ? (
            <span className="font-medium text-amber-700">Unsaved changes</span>
          ) : (
            <span className="text-ink-subtle">{doc.custom ? 'Edited from the built-in version' : 'Showing built-in content'}</span>
          )}
        </span>
      </div>
    </div>
  );
}

/** Wraps an editor: handles loading and load errors. */
export function DocView<T>({ doc, children }: { doc: { value: T | null; loadError: string }; children: (value: T) => ReactNode }) {
  if (doc.loadError) return <Alert>{doc.loadError}</Alert>;
  if (doc.value === null) {
    return (
      <p className="py-10 text-center text-ink-muted" role="status">
        Loading…
      </p>
    );
  }
  return <>{children(doc.value)}</>;
}

/* ── Form fields ─────────────────────────────────────────────────────── */

interface FieldProps {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  maxLength?: number;
  placeholder?: string;
  type?: string;
  className?: string;
}

function FieldShell({ label, hint, id, children, className }: { label: string; hint?: string; id: string; children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="field-label" htmlFor={id}>
        {label}
        {hint && <span className="ml-1.5 text-xs font-normal text-ink-subtle">{hint}</span>}
      </label>
      {children}
    </div>
  );
}

export function TextField({ label, hint, value, onChange, maxLength, placeholder, type = 'text', className }: FieldProps) {
  const id = useId();
  return (
    <FieldShell label={label} hint={hint} id={id} className={className}>
      <input id={id} className="field-input" type={type} value={value} maxLength={maxLength} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </FieldShell>
  );
}

export function TextArea({ label, hint, value, onChange, maxLength, placeholder, rows = 4, className, counter }: FieldProps & { rows?: number; counter?: boolean }) {
  const id = useId();
  return (
    <FieldShell label={label} hint={hint} id={id} className={className}>
      <textarea id={id} className="field-input resize-y" rows={rows} value={value} maxLength={maxLength} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      {counter && maxLength && (
        <p className="tabular mt-1 text-right text-xs text-ink-subtle" aria-hidden>
          {value.length} / {maxLength}
        </p>
      )}
    </FieldShell>
  );
}

export function SelectField({ label, value, onChange, options, className }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; className?: string }) {
  const id = useId();
  return (
    <FieldShell label={label} id={id} className={className}>
      <select id={id} className="field-input" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

export function Toggle({ label, checked, onChange, hint }: { label: string; checked: boolean; onChange: (v: boolean) => void; hint?: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 text-sm">
      <input type="checkbox" className="mt-0.5 h-4 w-4 shrink-0 accent-brand-600" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>
        <span className="font-medium text-navy-900">{label}</span>
        {hint && <span className="block text-xs text-ink-subtle">{hint}</span>}
      </span>
    </label>
  );
}

/** Collapsible section: native <details> keeps keyboard and screen reader support for free. */
export function Section({ title, children, defaultOpen = true, description }: { title: string; children: ReactNode; defaultOpen?: boolean; description?: string }) {
  return (
    <details open={defaultOpen} className="card group p-5 sm:p-6">
      <summary className="cursor-pointer list-none text-lg font-bold text-navy-900 [&::-webkit-details-marker]:hidden">
        {title}
        {description && <span className="mt-1 block text-sm font-normal text-ink-muted">{description}</span>}
      </summary>
      <div className="mt-5 space-y-4">{children}</div>
    </details>
  );
}

/* ── List helpers ────────────────────────────────────────────────────── */

export const move = <T,>(arr: T[], i: number, dir: -1 | 1): T[] => {
  const j = i + dir;
  if (j < 0 || j >= arr.length) return arr;
  const next = [...arr];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
};
export const replaceAt = <T,>(arr: T[], i: number, item: T): T[] => arr.map((x, k) => (k === i ? item : x));
export const removeAt = <T,>(arr: T[], i: number): T[] => arr.filter((_, k) => k !== i);

const iconBtn = 'rounded-full p-2 text-ink-muted transition-colors hover:bg-navy-900/5 disabled:pointer-events-none disabled:opacity-30';

/** Up / down / delete controls for one list row. Deleting asks for confirmation inline. */
export function RowControls({ index, length, onMove, onDelete, what }: { index: number; length: number; onMove: (dir: -1 | 1) => void; onDelete: () => void; what: string }) {
  const [confirming, setConfirming] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(timer.current), []);
  return (
    <div className="flex items-center gap-0.5">
      <button type="button" className={iconBtn} disabled={index === 0} onClick={() => onMove(-1)} aria-label={`Move ${what} up`}>
        <ArrowUp className="h-4 w-4" />
      </button>
      <button type="button" className={iconBtn} disabled={index === length - 1} onClick={() => onMove(1)} aria-label={`Move ${what} down`}>
        <ArrowDown className="h-4 w-4" />
      </button>
      {confirming ? (
        <span className="ml-1 flex items-center gap-1 text-xs">
          <button type="button" className="rounded-full bg-red-700 px-3 py-1.5 font-semibold text-white hover:bg-red-800" onClick={onDelete}>
            Delete {what}?
          </button>
          <button type="button" className="rounded-full px-2 py-1.5 font-medium text-ink-muted hover:bg-navy-900/5" onClick={() => setConfirming(false)}>
            Keep
          </button>
        </span>
      ) : (
        <button
          type="button"
          className={cn(iconBtn, 'hover:!bg-red-50 hover:text-red-700')}
          onClick={() => {
            setConfirming(true);
            clearTimeout(timer.current);
            timer.current = setTimeout(() => setConfirming(false), 6000);
          }}
          aria-label={`Delete ${what}`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
