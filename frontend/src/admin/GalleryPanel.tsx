import { ArrowLeft, ArrowRight, Eye, EyeOff, ImagePlus, Loader2, RefreshCw, Trash2, UploadCloud } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { adminApi, type Photo, prepareImage } from './api';
import { Alert, btnDanger, btnPrimary, btnSecondary, ConfirmDelete } from './ui';

const ACCEPT = 'image/jpeg,image/png,image/webp';

function PhotoCard({
  photo,
  index,
  total,
  onChange,
  onMove,
  onDeleted,
  onError,
}: {
  photo: Photo;
  index: number;
  total: number;
  onChange: (p: Photo) => void;
  onMove: (dir: -1 | 1) => void;
  onDeleted: () => void;
  onError: (msg: string) => void;
}) {
  const [caption, setCaption] = useState(photo.caption);
  const [alt, setAlt] = useState(photo.alt);
  const [category, setCategory] = useState(photo.category);
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    try {
      await fn();
    } catch (e) {
      onError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  };

  const dirty = caption !== photo.caption || alt !== photo.alt || category !== photo.category;
  const save = () => run(async () => onChange(await adminApi.updatePhoto(photo.id, { caption, alt, category })));

  const replace = (file: File | undefined) => {
    if (!file) return;
    void run(async () => onChange(await adminApi.replacePhoto(photo.id, await prepareImage(file))));
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <li className={cn('card flex flex-col overflow-hidden', !photo.visible && 'opacity-80')}>
      <div className="relative aspect-[4/3] bg-mist">
        {/* The filename changes on every replace, so the URL is a fresh, cacheable one. */}
        <img src={photo.url} alt={photo.alt || photo.caption || 'Gallery photo'} className="h-full w-full object-cover" loading="lazy" />
        {!photo.visible && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-navy-900/80 px-2.5 py-1 text-xs font-semibold text-white">
            <EyeOff className="h-3 w-3" aria-hidden /> Hidden
          </span>
        )}
        {busy && (
          <span className="absolute inset-0 flex items-center justify-center bg-white/60" role="status" aria-label="Working">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-700" />
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <label className="field-label !mb-1 !text-xs" htmlFor={`cap-${photo.id}`}>
            Caption
          </label>
          <input id={`cap-${photo.id}`} className="field-input !py-2" maxLength={200} value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Shown under the photo" />
        </div>
        <div>
          <label className="field-label !mb-1 !text-xs" htmlFor={`alt-${photo.id}`}>
            Alt text <span className="font-normal text-ink-subtle">(describes the photo for screen readers)</span>
          </label>
          <input id={`alt-${photo.id}`} className="field-input !py-2" maxLength={200} value={alt} onChange={(e) => setAlt(e.target.value)} />
        </div>
        <div>
          <label className="field-label !mb-1 !text-xs" htmlFor={`cat-${photo.id}`}>
            Category <span className="font-normal text-ink-subtle">(optional, for filtering)</span>
          </label>
          <input id={`cat-${photo.id}`} className="field-input !py-2" maxLength={60} value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Events" />
        </div>
        {dirty && (
          <button type="button" className={btnPrimary} onClick={save} disabled={busy}>
            Save changes
          </button>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-navy-900/10 pt-3">
          <button type="button" className={cn(btnSecondary, '!h-9 !px-3')} onClick={() => onMove(-1)} disabled={busy || index === 0} aria-label="Move earlier">
            <ArrowLeft className="h-4 w-4" aria-hidden />
          </button>
          <button type="button" className={cn(btnSecondary, '!h-9 !px-3')} onClick={() => onMove(1)} disabled={busy || index === total - 1} aria-label="Move later">
            <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
          <span className="tabular text-xs text-ink-subtle">
            {index + 1} of {total}
          </span>
          <div className="ml-auto flex flex-wrap gap-2">
            <button
              type="button"
              className={cn(btnSecondary, '!h-9 !px-3')}
              disabled={busy}
              aria-pressed={photo.visible}
              onClick={() => run(async () => onChange(await adminApi.updatePhoto(photo.id, { visible: !photo.visible })))}
            >
              {photo.visible ? <Eye className="h-4 w-4" aria-hidden /> : <EyeOff className="h-4 w-4" aria-hidden />}
              {photo.visible ? 'Shown' : 'Hidden'}
            </button>
            <button type="button" className={cn(btnSecondary, '!h-9 !px-3')} disabled={busy} onClick={() => fileRef.current?.click()}>
              <RefreshCw className="h-4 w-4" aria-hidden /> Change photo
            </button>
            <input ref={fileRef} type="file" accept={ACCEPT} className="sr-only" tabIndex={-1} aria-label={`Choose a new image for ${photo.caption || 'this photo'}`} onChange={(e) => replace(e.target.files?.[0])} />
            <button type="button" className={cn(btnDanger, '!h-9 !px-3')} disabled={busy} onClick={() => setConfirming(true)} aria-label="Delete photo">
              <Trash2 className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>

        {confirming && (
          <ConfirmDelete
            label="Delete this photo from the gallery?"
            busy={busy}
            onCancel={() => setConfirming(false)}
            onConfirm={() =>
              run(async () => {
                await adminApi.deletePhoto(photo.id);
                onDeleted();
              })
            }
          />
        )}
      </div>
    </li>
  );
}

export function GalleryPanel() {
  const [photos, setPhotos] = useState<Photo[] | null>(null);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState<{ done: number; total: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    try {
      setPhotos(await adminApi.listPhotos());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load the gallery.');
    }
  }, []);
  useEffect(() => void load(), [load]);

  const upload = async (files: FileList | File[]) => {
    const list = Array.from(files);
    if (!list.length) return;
    setError('');
    setUploading({ done: 0, total: list.length });
    const failures: string[] = [];
    for (const [i, file] of list.entries()) {
      try {
        const photo = await adminApi.uploadPhoto(await prepareImage(file));
        setPhotos((p) => [...(p ?? []), photo]);
      } catch (e) {
        failures.push(e instanceof Error ? e.message : `${file.name}: upload failed.`);
      }
      setUploading({ done: i + 1, total: list.length });
    }
    setUploading(null);
    if (failures.length) setError(failures.join(' '));
    if (inputRef.current) inputRef.current.value = '';
  };

  const move = async (index: number, dir: -1 | 1) => {
    if (!photos) return;
    const next = [...photos];
    const j = index + dir;
    if (j < 0 || j >= next.length) return;
    [next[index], next[j]] = [next[j], next[index]];
    const previous = photos;
    setPhotos(next); // optimistic
    try {
      setPhotos(await adminApi.reorderPhotos(next.map((p) => p.id)));
    } catch (e) {
      setPhotos(previous);
      setError(e instanceof Error ? e.message : 'Could not reorder.');
    }
  };

  return (
    <div className="space-y-6">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void upload(e.dataTransfer.files);
        }}
        className={cn(
          'card flex flex-col items-center gap-3 border-2 border-dashed px-6 py-10 text-center transition-colors',
          dragging ? 'border-emerald-600 bg-emerald-50' : 'border-navy-900/15',
        )}
      >
        <UploadCloud className="h-9 w-9 text-emerald-700" aria-hidden />
        <div>
          <p className="font-semibold text-navy-900">Drag photos here, or choose files</p>
          <p className="mt-1 text-sm text-ink-muted">JPEG, PNG or WebP. Large photos are resized automatically before upload.</p>
        </div>
        <button type="button" className={btnPrimary} onClick={() => inputRef.current?.click()} disabled={!!uploading}>
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <ImagePlus className="h-4 w-4" aria-hidden />}
          {uploading ? `Uploading ${uploading.done + 1} of ${uploading.total}…` : 'Add photos'}
        </button>
        <input ref={inputRef} type="file" accept={ACCEPT} multiple className="sr-only" tabIndex={-1} aria-label="Choose photos to upload" onChange={(e) => e.target.files && void upload(e.target.files)} />
      </div>

      {error && <Alert>{error}</Alert>}

      {photos === null && !error ? (
        <p className="py-10 text-center text-ink-muted" role="status">
          Loading…
        </p>
      ) : photos && photos.length === 0 ? (
        <p className="py-10 text-center text-ink-muted">No photos yet. Add your first one above.</p>
      ) : (
        photos && (
          <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {photos.map((p, i) => (
              <PhotoCard
                key={p.id}
                photo={p}
                index={i}
                total={photos.length}
                onChange={(np) => setPhotos((all) => all?.map((x) => (x.id === np.id ? np : x)) ?? null)}
                onMove={(d) => void move(i, d)}
                onDeleted={() => setPhotos((all) => all?.filter((x) => x.id !== p.id) ?? null)}
                onError={setError}
              />
            ))}
          </ul>
        )
      )}
    </div>
  );
}
