import { Plus } from 'lucide-react';
import { useState } from 'react';
import { ICON_NAMES, ICONS, type ServiceDoc } from '@/content/runtime';
import { cn } from '@/lib/cn';
import { confirmDiscard, DocView, move, removeAt, replaceAt, RowControls, SaveBar, SelectField, slugify, TextArea, TextField, Toggle, useDoc } from './editor';
import { btnSecondary } from './ui';

const iconOptions = ICON_NAMES.map((n) => ({ value: n, label: n.replace(/([a-z])([A-Z])/g, '$1 $2') }));

function IconPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const Icon = ICONS[value] ?? ICONS.Briefcase;
  return (
    <div className="flex items-end gap-3">
      <span className="mb-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-700" aria-hidden>
        <Icon className="h-6 w-6" />
      </span>
      <SelectField className="flex-1" label="Icon" value={value} onChange={onChange} options={iconOptions} />
    </div>
  );
}

/* ── Services ───────────────────────────────────────────────────────── */

function ServicesList() {
  const doc = useDoc('services');
  return (
    <DocView doc={doc}>
      {(items) => {
        const set = (next: ServiceDoc[]) => doc.setValue(next);
        const update = (i: number, patch: Partial<ServiceDoc>) => set(replaceAt(items, i, { ...items[i], ...patch }));
        return (
          <>
            <p className="mb-4 text-sm text-ink-muted">
              Services appear on the Home and Services pages, and as topics on the consultation form. Keep descriptions factual and avoid naming specific schemes.
            </p>
            <ul className="space-y-4">
              {items.map((s, i) => (
                <li key={i} className={cn('card p-5 sm:p-6', !s.visible && 'opacity-75')}>
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h3 className="text-base font-bold">{s.title || 'New service'}</h3>
                    <RowControls index={i} length={items.length} what="service" onMove={(d) => set(move(items, i, d))} onDelete={() => set(removeAt(items, i))} />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <TextField label="Title" maxLength={120} value={s.title} onChange={(v) => update(i, { title: v })} />
                    <TextField label="ID" hint="Lowercase, used in the page link (#sip)" maxLength={80} value={s.id} onChange={(v) => update(i, { id: slugify(v) })} />
                    <IconPicker value={s.icon} onChange={(v) => update(i, { icon: v })} />
                    <div className="flex items-end pb-3">
                      <Toggle label="Show on the site" checked={s.visible} onChange={(v) => update(i, { visible: v })} />
                    </div>
                    <TextArea className="sm:col-span-2" label="One-line summary" rows={2} maxLength={300} counter value={s.summary} onChange={(v) => update(i, { summary: v })} />
                    <TextArea className="sm:col-span-2" label="Description" rows={4} maxLength={2000} value={s.description} onChange={(v) => update(i, { description: v })} />
                    <TextArea className="sm:col-span-2" label="Key points" hint="One per line" rows={4} value={s.points.join('\n')} onChange={(v) => update(i, { points: v.split('\n') })} />
                    <TextField label="Calculator button label" hint="Optional" maxLength={100} value={s.calculator?.label ?? ''} onChange={(v) => update(i, { calculator: { label: v, to: s.calculator?.to ?? '/calculators' } })} />
                    <SelectField
                      label="Calculator it links to"
                      value={s.calculator?.to ?? '/calculators'}
                      onChange={(v) => update(i, { calculator: { label: s.calculator?.label ?? '', to: v } })}
                      options={[
                        { value: '/calculators', label: 'Calculators page' },
                        { value: '/calculators#sip', label: 'SIP calculator' },
                        { value: '/calculators#lumpsum', label: 'Lump sum calculator' },
                        { value: '/calculators#goal', label: 'Goal planner' },
                        { value: '/calculators#stepup', label: 'Step-up SIP calculator' },
                      ]}
                    />
                  </div>
                </li>
              ))}
            </ul>
            <button
              type="button"
              className={cn(btnSecondary, 'mt-4')}
              onClick={() => set([...items, { id: '', icon: 'Briefcase', title: '', summary: '', description: '', points: [], visible: true }])}
            >
              <Plus className="h-4 w-4" aria-hidden /> Add a service
            </button>
            <SaveBar doc={doc} />
          </>
        );
      }}
    </DocView>
  );
}

/* ── "Why choose us" and "How it works" ─────────────────────────────── */

function WhyList() {
  const doc = useDoc('whyChooseUs');
  return (
    <DocView doc={doc}>
      {(items) => (
        <>
          <p className="mb-4 text-sm text-ink-muted">The short points shown in the "Why us" section of the Home page. Four fit the layout best.</p>
          <ul className="space-y-3">
            {items.map((w, i) => (
              <li key={i} className="card p-5">
                <div className="mb-3 flex justify-end">
                  <RowControls index={i} length={items.length} what="point" onMove={(d) => doc.setValue(move(items, i, d))} onDelete={() => doc.setValue(removeAt(items, i))} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField label="Title" maxLength={100} value={w.title} onChange={(v) => doc.setValue(replaceAt(items, i, { ...w, title: v }))} />
                  <IconPicker value={w.icon} onChange={(v) => doc.setValue(replaceAt(items, i, { ...w, icon: v }))} />
                  <TextArea className="sm:col-span-2" label="Description" rows={3} maxLength={500} value={w.body} onChange={(v) => doc.setValue(replaceAt(items, i, { ...w, body: v }))} />
                </div>
              </li>
            ))}
          </ul>
          <button type="button" className={cn(btnSecondary, 'mt-4')} disabled={items.length >= 12} onClick={() => doc.setValue([...items, { icon: 'Briefcase', title: '', body: '' }])}>
            <Plus className="h-4 w-4" aria-hidden /> Add a point
          </button>
          <SaveBar doc={doc} />
        </>
      )}
    </DocView>
  );
}

function JourneyList() {
  const doc = useDoc('journeySteps');
  return (
    <DocView doc={doc}>
      {(items) => (
        <>
          <p className="mb-4 text-sm text-ink-muted">The numbered steps showing how working with you looks, in order.</p>
          <ol className="space-y-3">
            {items.map((s, i) => (
              <li key={i} className="card p-5">
                <div className="mb-3 flex items-center justify-between">
                  <span className="tabular text-sm font-semibold text-ink-subtle">Step {i + 1}</span>
                  <RowControls index={i} length={items.length} what="step" onMove={(d) => doc.setValue(move(items, i, d))} onDelete={() => doc.setValue(removeAt(items, i))} />
                </div>
                <div className="space-y-4">
                  <TextField label="Title" maxLength={80} value={s.title} onChange={(v) => doc.setValue(replaceAt(items, i, { ...s, title: v }))} />
                  <TextArea label="Description" rows={3} maxLength={500} value={s.body} onChange={(v) => doc.setValue(replaceAt(items, i, { ...s, body: v }))} />
                </div>
              </li>
            ))}
          </ol>
          <button type="button" className={cn(btnSecondary, 'mt-4')} disabled={items.length >= 10} onClick={() => doc.setValue([...items, { title: '', body: '' }])}>
            <Plus className="h-4 w-4" aria-hidden /> Add a step
          </button>
          <SaveBar doc={doc} />
        </>
      )}
    </DocView>
  );
}

type Part = 'services' | 'why' | 'journey';

export function ServicesEditor() {
  const [part, setPart] = useState<Part>('services');
  const tabs: { id: Part; label: string }[] = [
    { id: 'services', label: 'Services' },
    { id: 'why', label: 'Why choose us' },
    { id: 'journey', label: 'How it works' },
  ];
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Service content">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={part === t.id}
            onClick={() => confirmDiscard() && setPart(t.id)}
            className={cn('rounded-full border px-4 py-2 text-sm font-semibold transition-colors', part === t.id ? 'border-brand-600 bg-brand-50 text-brand-800' : 'border-navy-900/15 text-ink-muted hover:border-navy-900/30')}
          >
            {t.label}
          </button>
        ))}
      </div>
      {part === 'services' && <ServicesList />}
      {part === 'why' && <WhyList />}
      {part === 'journey' && <JourneyList />}
    </div>
  );
}
