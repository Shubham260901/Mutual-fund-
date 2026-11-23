import { Plus } from 'lucide-react';
import { useState } from 'react';
import type { FaqDoc } from '@/content/runtime';
import { cn } from '@/lib/cn';
import { confirmDiscard, DocView, move, removeAt, replaceAt, RowControls, SaveBar, TextArea, TextField, Toggle, useDoc } from './editor';
import { btnSecondary } from './ui';

type Which = 'homeFaqs' | 'educationFaqs';
const TABS: { id: Which; label: string; where: string }[] = [
  { id: 'homeFaqs', label: 'Home page', where: 'Shown on the Home page under "Questions investors often ask".' },
  { id: 'educationFaqs', label: 'Learn page', where: 'Shown on the Learn / Education page under "Common questions, clear answers".' },
];

function FaqList({ which }: { which: Which }) {
  const doc = useDoc(which);
  return (
    <DocView doc={doc}>
      {(faqs) => {
        const set = (next: FaqDoc[]) => doc.setValue(next);
        return (
          <>
            <ul className="space-y-3">
              {faqs.map((f, i) => (
                <li key={i} className={cn('card p-4 sm:p-5', !f.visible && 'opacity-75')}>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span className="tabular text-sm font-semibold text-ink-subtle">Question {i + 1}</span>
                    <RowControls index={i} length={faqs.length} what="question" onMove={(d) => set(move(faqs, i, d))} onDelete={() => set(removeAt(faqs, i))} />
                  </div>
                  <div className="space-y-3">
                    <TextField label="Question" maxLength={300} value={f.q} onChange={(v) => set(replaceAt(faqs, i, { ...f, q: v }))} />
                    <TextArea label="Answer" rows={4} maxLength={3000} value={f.a} onChange={(v) => set(replaceAt(faqs, i, { ...f, a: v }))} />
                    <Toggle label="Show on the site" checked={f.visible} onChange={(v) => set(replaceAt(faqs, i, { ...f, visible: v }))} />
                  </div>
                </li>
              ))}
            </ul>
            {faqs.length === 0 && <p className="card px-6 py-12 text-center text-ink-muted">No questions yet.</p>}
            <button type="button" className={cn(btnSecondary, 'mt-4')} onClick={() => set([...faqs, { q: '', a: '', visible: true }])}>
              <Plus className="h-4 w-4" aria-hidden /> Add a question
            </button>
            <SaveBar doc={doc} />
          </>
        );
      }}
    </DocView>
  );
}

export function FaqsEditor() {
  const [which, setWhich] = useState<Which>('homeFaqs');
  const tab = TABS.find((t) => t.id === which)!;
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="FAQ lists">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={which === t.id}
            onClick={() => confirmDiscard() && setWhich(t.id)}
            className={cn('rounded-full border px-4 py-2 text-sm font-semibold transition-colors', which === t.id ? 'border-brand-600 bg-brand-50 text-brand-800' : 'border-navy-900/15 text-ink-muted hover:border-navy-900/30')}
          >
            {t.label}
          </button>
        ))}
      </div>
      <p className="text-sm text-ink-muted">{tab.where} Keep answers factual: no guaranteed-return or scheme-promotion claims.</p>
      <FaqList key={which} which={which} />
    </div>
  );
}
