import { ExternalLink, Plus } from 'lucide-react';
import { useState } from 'react';
import type { Block } from '@/content/articles';
import type { ArticleDoc } from '@/content/runtime';
import { cn } from '@/lib/cn';
import { DocView, removeAt, replaceAt, RowControls, move, SaveBar, SelectField, slugify, TextArea, TextField, Toggle, useDoc } from './editor';
import { btnSecondary } from './ui';

const CATEGORIES = ['Basics', 'Strategy', 'Risk', 'Planning'].map((c) => ({ value: c, label: c }));
const BLOCK_TYPES: { value: Block['type']; label: string }[] = [
  { value: 'p', label: 'Paragraph' },
  { value: 'h2', label: 'Heading' },
  { value: 'h3', label: 'Sub-heading' },
  { value: 'ul', label: 'Bulleted list' },
  { value: 'callout', label: 'Highlighted note' },
];

const newBlock = (type: Block['type']): Block => (type === 'ul' ? { type: 'ul', items: [''] } : ({ type, text: '' } as Block));

function BlockEditor({ block, index, length, onChange, onMove, onDelete }: { block: Block; index: number; length: number; onChange: (b: Block) => void; onMove: (d: -1 | 1) => void; onDelete: () => void }) {
  const changeType = (type: Block['type']) => {
    // Keep the text when switching between text-like blocks, and between list and text.
    const text = block.type === 'ul' ? block.items.join('\n') : block.text;
    onChange(type === 'ul' ? { type: 'ul', items: text.split('\n') } : ({ type, text } as Block));
  };
  return (
    <div className="rounded-2xl border border-navy-900/10 bg-white p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <select className="field-input !w-auto !py-1.5 !text-sm" aria-label={`Block ${index + 1} type`} value={block.type} onChange={(e) => changeType(e.target.value as Block['type'])}>
          {BLOCK_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <RowControls index={index} length={length} onMove={onMove} onDelete={onDelete} what="block" />
      </div>
      {block.type === 'ul' ? (
        <textarea
          className="field-input min-h-[6rem] resize-y"
          aria-label={`Block ${index + 1} list items`}
          placeholder="One bullet per line"
          value={block.items.join('\n')}
          onChange={(e) => onChange({ type: 'ul', items: e.target.value.split('\n') })}
        />
      ) : (
        <textarea
          className={cn('field-input resize-y', block.type === 'p' ? 'min-h-[7rem]' : 'min-h-[3rem]', block.type !== 'p' && 'font-semibold')}
          aria-label={`Block ${index + 1} text`}
          placeholder={block.type === 'p' ? 'Write a paragraph…' : 'Text…'}
          value={block.text}
          onChange={(e) => onChange({ ...block, text: e.target.value } as Block)}
        />
      )}
    </div>
  );
}

function ArticleForm({ article, onChange }: { article: ArticleDoc; onChange: (a: ArticleDoc) => void }) {
  const set = <K extends keyof ArticleDoc>(k: K, v: ArticleDoc[K]) => onChange({ ...article, [k]: v });
  const [slugTouched, setSlugTouched] = useState(true);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          className="sm:col-span-2"
          label="Title"
          value={article.title}
          maxLength={160}
          onChange={(v) => onChange({ ...article, title: v, ...(slugTouched ? {} : { slug: slugify(v) }) })}
        />
        <TextField
          label="URL slug"
          hint="Page address: /education/…"
          value={article.slug}
          maxLength={80}
          onChange={(v) => {
            setSlugTouched(true);
            set('slug', slugify(v));
          }}
        />
        <SelectField label="Category" value={article.category} onChange={(v) => set('category', v as ArticleDoc['category'])} options={CATEGORIES} />
        <TextField label="Reading time (minutes)" type="number" value={String(article.readMinutes)} onChange={(v) => set('readMinutes', Math.max(1, Math.min(120, Number(v) || 1)))} />
        <div className="flex items-end pb-3">
          <Toggle label="Published" hint="Untick to keep it as a draft, hidden from visitors." checked={article.published} onChange={(v) => set('published', v)} />
        </div>
        <TextArea className="sm:col-span-2" label="Summary" hint="Shown on article cards" rows={2} maxLength={400} counter value={article.excerpt} onChange={(v) => set('excerpt', v)} />
      </div>

      <div>
        <h3 className="mb-2 text-base font-semibold">Article content</h3>
        <div className="space-y-3">
          {article.body.map((b, i) => (
            <BlockEditor
              key={i}
              block={b}
              index={i}
              length={article.body.length}
              onChange={(nb) => set('body', replaceAt(article.body, i, nb))}
              onMove={(d) => set('body', move(article.body, i, d))}
              onDelete={() => set('body', removeAt(article.body, i))}
            />
          ))}
          {article.body.length === 0 && <p className="rounded-xl bg-navy-50 px-4 py-6 text-center text-sm text-ink-muted">No content yet. Add a block below.</p>}
        </div>
        <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Add a block">
          {BLOCK_TYPES.map((t) => (
            <button key={t.value} type="button" className={cn(btnSecondary, '!h-9 !px-3.5')} onClick={() => set('body', [...article.body, newBlock(t.value)])}>
              <Plus className="h-3.5 w-3.5" aria-hidden /> {t.label}
            </button>
          ))}
        </div>
      </div>

      <details className="rounded-2xl border border-navy-900/10 p-4">
        <summary className="cursor-pointer text-sm font-semibold text-navy-900">Search engine preview (optional)</summary>
        <div className="mt-4 grid gap-4">
          <TextField label="Page title for Google" hint="Blank = use the article title" maxLength={120} value={article.seoTitle} onChange={(v) => set('seoTitle', v)} />
          <TextArea label="Description for Google" hint="Blank = use the summary" rows={2} maxLength={320} counter value={article.seoDescription} onChange={(v) => set('seoDescription', v)} />
        </div>
      </details>
    </div>
  );
}

export function ArticlesEditor() {
  const doc = useDoc('articles');
  const [selected, setSelected] = useState(0);

  return (
    <DocView doc={doc}>
      {(articles) => {
        const idx = Math.min(selected, Math.max(articles.length - 1, 0));
        const current = articles[idx];
        const add = () => {
          const fresh: ArticleDoc = { slug: '', title: 'Untitled article', excerpt: '', category: 'Basics', readMinutes: 3, body: [{ type: 'p', text: '' }], published: false, seoTitle: '', seoDescription: '' };
          doc.setValue([...articles, fresh]);
          setSelected(articles.length);
        };
        return (
          <>
            <div className="grid gap-6 lg:grid-cols-[18rem_1fr]">
              <aside aria-label="Articles">
                <button type="button" className={cn(btnSecondary, 'mb-3 w-full')} onClick={add}>
                  <Plus className="h-4 w-4" aria-hidden /> New article
                </button>
                <ul className="space-y-1.5">
                  {articles.map((a, i) => (
                    <li key={i}>
                      <button
                        type="button"
                        aria-current={i === idx}
                        onClick={() => setSelected(i)}
                        className={cn('w-full rounded-xl border px-3.5 py-2.5 text-left transition-colors', i === idx ? 'border-emerald-600 bg-emerald-50' : 'border-navy-900/10 bg-white hover:border-navy-900/25')}
                      >
                        <span className="line-clamp-2 text-sm font-semibold text-navy-900">{a.title || 'Untitled'}</span>
                        <span className="mt-1 flex items-center gap-2 text-xs text-ink-subtle">
                          {a.category}
                          {!a.published && <span className="rounded-full bg-amber-100 px-2 py-0.5 font-semibold text-amber-800">Draft</span>}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </aside>

              {current ? (
                <section className="card p-5 sm:p-6" aria-label="Edit article">
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <h2 className="text-lg font-bold">Edit article</h2>
                    <div className="flex items-center gap-2">
                      {current.published && current.slug && (
                        <a href={`/education/${current.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 hover:underline">
                          View <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                        </a>
                      )}
                      <RowControls
                        index={idx}
                        length={articles.length}
                        what="article"
                        onMove={(d) => {
                          doc.setValue(move(articles, idx, d));
                          setSelected(idx + d);
                        }}
                        onDelete={() => {
                          doc.setValue(removeAt(articles, idx));
                          setSelected(Math.max(0, idx - 1));
                        }}
                      />
                    </div>
                  </div>
                  <ArticleForm key={idx} article={current} onChange={(a) => doc.setValue(replaceAt(articles, idx, a))} />
                </section>
              ) : (
                <p className="card px-6 py-16 text-center text-ink-muted">No articles. Add one to get started.</p>
              )}
            </div>
            <SaveBar doc={doc} />
          </>
        );
      }}
    </DocView>
  );
}
