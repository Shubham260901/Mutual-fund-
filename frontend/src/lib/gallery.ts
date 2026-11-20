import { useEffect, useState } from 'react';

/** A visible photo as returned by the public API (GET /api/gallery). */
export interface GalleryPhoto {
  id: number;
  /** Image path, e.g. /uploads/ab12cd.jpg. Use it directly as <img src>. */
  url: string;
  caption: string;
  alt: string;
  /** Free-text group set in the admin panel; empty when unset. Handy for filter tabs. */
  category: string;
}

export async function fetchGallery(signal?: AbortSignal): Promise<GalleryPhoto[]> {
  const res = await fetch('/api/gallery', { signal, headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`Gallery request failed (${res.status})`);
  const data = (await res.json()) as { photos: GalleryPhoto[] };
  return data.photos;
}

/**
 * For the public gallery page:
 *   const { photos, loading, error } = useGallery();
 * Photos arrive already filtered to the visible ones, in the order set in the admin panel.
 */
export function useGallery() {
  const [state, setState] = useState<{ photos: GalleryPhoto[]; loading: boolean; error: string }>({ photos: [], loading: true, error: '' });

  useEffect(() => {
    const ctrl = new AbortController();
    fetchGallery(ctrl.signal)
      .then((photos) => setState({ photos, loading: false, error: '' }))
      .catch((e: unknown) => {
        if (!ctrl.signal.aborted) setState({ photos: [], loading: false, error: e instanceof Error ? e.message : 'Could not load photos.' });
      });
    return () => ctrl.abort();
  }, []);

  return state;
}
