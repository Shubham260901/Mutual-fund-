import type { ContentKey, ContentMap } from '@/content/runtime';

/** Typed client for the admin API (backend/src/app.ts). Auth is an HttpOnly cookie set by the server. */

export const STATUSES = ['new', 'contacted', 'scheduled', 'closed', 'spam'] as const;
export type Status = (typeof STATUSES)[number];

export interface Enquiry {
  id: number;
  createdAt: string;
  updatedAt: string;
  type: 'enquiry' | 'consultation';
  name: string;
  email: string;
  phone: string;
  topic: string;
  preferredDate: string;
  preferredTime: string;
  meetingType: string;
  message: string;
  status: Status;
  notes: string;
}

export interface Photo {
  id: number;
  filename: string;
  url: string;
  caption: string;
  alt: string;
  category: string;
  visible: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Stats {
  total: number;
  byStatus: Record<Status, number>;
  consultations: number;
  upcomingConsultations: number;
  /** Received today / this week (from Monday) / this month, India time, with the full previous period. */
  periods: Record<'today' | 'week' | 'month', { count: number; previous: number }>;
  days: { date: string; count: number }[];
}

export interface EnquiryList {
  items: Enquiry[];
  total: number;
  page: number;
  pageSize: number;
}

export interface EnquiryFilters {
  status: string;
  type: string;
  q: string;
  /** '' | 'today' | 'week' | 'month' */
  period: string;
  /** Only open consultations scheduled from today onwards. */
  upcoming: boolean;
  page: number;
}

export interface Analytics {
  weeks: { weekStart: string; enquiries: number; consultations: number }[];
  topics: { topic: string; count: number }[];
  upcoming: Enquiry[];
  responseRate: number | null;
  total: number;
}

export interface ActivityEntry {
  id: number;
  at: string;
  action: string;
  detail: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

let unauthorizedHandler: (() => void) | null = null;
/** Called whenever the server answers 401 to an authenticated request (expired session). */
export const onUnauthorized = (fn: (() => void) | null) => {
  unauthorizedHandler = fn;
};

/** Endpoints used while signed out: a 401 there is a wrong password, not an expired session. */
const PUBLIC_PATHS = ['/login', '/forgot-password', '/reset-password'];

async function request<T>(method: string, path: string, opts: { json?: unknown; body?: Blob; contentType?: string } = {}): Promise<T> {
  const headers: Record<string, string> = { 'x-admin-request': '1' };
  let body: BodyInit | undefined;
  if (opts.json !== undefined) {
    headers['content-type'] = 'application/json';
    body = JSON.stringify(opts.json);
  } else if (opts.body) {
    headers['content-type'] = opts.contentType ?? opts.body.type;
    body = opts.body;
  }

  let res: Response;
  try {
    res = await fetch(`/api/admin${path}`, { method, headers, body, credentials: 'same-origin' });
  } catch {
    throw new ApiError('Cannot reach the server. Is the backend running?', 0);
  }
  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string } & T;
  if (!res.ok) {
    if (res.status === 401 && !PUBLIC_PATHS.includes(path)) unauthorizedHandler?.();
    throw new ApiError(data.error || `Request failed (${res.status})`, res.status);
  }
  return data;
}

const qs = (f: Partial<EnquiryFilters> & { pageSize?: number }) => {
  const p = new URLSearchParams();
  if (f.status) p.set('status', f.status);
  if (f.type) p.set('type', f.type);
  if (f.q) p.set('q', f.q);
  if (f.period) p.set('period', f.period);
  if (f.upcoming) p.set('upcoming', '1');
  if (f.page && f.page > 1) p.set('page', String(f.page));
  if (f.pageSize) p.set('pageSize', String(f.pageSize));
  const s = p.toString();
  return s ? `?${s}` : '';
};

export const adminApi = {
  login: (email: string, password: string) => request<{ ok: true }>('POST', '/login', { json: { email, password } }),
  forgotPassword: (email: string) => request<{ ok: true }>('POST', '/forgot-password', { json: { email } }),
  resetPassword: (token: string, password: string) => request<{ ok: true }>('POST', '/reset-password', { json: { token, password } }),
  logout: () => request<{ ok: true }>('POST', '/logout'),
  me: () => request<{ ok: true }>('GET', '/me'),

  stats: () => request<Stats>('GET', '/stats'),
  listEnquiries: (f: EnquiryFilters) => request<EnquiryList>('GET', `/enquiries${qs({ ...f, pageSize: 15 })}`),
  updateEnquiry: (id: number, patch: { status?: Status; notes?: string }) =>
    request<{ enquiry: Enquiry }>('PATCH', `/enquiries/${id}`, { json: patch }).then((r) => r.enquiry),
  deleteEnquiry: (id: number) => request<{ ok: true }>('DELETE', `/enquiries/${id}`),
  exportUrl: (f: Partial<EnquiryFilters>) => `/api/admin/export.csv${qs(f)}`,

  listPhotos: () => request<{ photos: Photo[] }>('GET', '/gallery').then((r) => r.photos),
  uploadPhoto: (file: Blob, meta: { caption?: string; alt?: string; category?: string } = {}) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries(meta)) if (v) p.set(k, v);
    const s = p.toString();
    return request<{ photo: Photo }>('POST', `/gallery${s ? `?${s}` : ''}`, { body: file }).then((r) => r.photo);
  },
  replacePhoto: (id: number, file: Blob) => request<{ photo: Photo }>('PUT', `/gallery/${id}/image`, { body: file }).then((r) => r.photo),
  updatePhoto: (id: number, patch: Partial<Pick<Photo, 'caption' | 'alt' | 'category' | 'visible'>>) =>
    request<{ photo: Photo }>('PATCH', `/gallery/${id}`, { json: patch }).then((r) => r.photo),
  reorderPhotos: (ids: number[]) => request<{ photos: Photo[] }>('PUT', '/gallery/order', { json: { ids } }).then((r) => r.photos),
  deletePhoto: (id: number) => request<{ ok: true }>('DELETE', `/gallery/${id}`),

  /** Editable site content. `value` is null until the key has been customised (then the built-in default applies). */
  getContent: <K extends ContentKey>(key: K) => request<{ value: ContentMap[K] | null }>('GET', `/content/${key}`).then((r) => r.value),
  saveContent: <K extends ContentKey>(key: K, value: ContentMap[K]) =>
    request<{ value: ContentMap[K] }>('PUT', `/content/${key}`, { json: { value } }).then((r) => r.value),
  resetContent: (key: ContentKey) => request<{ ok: true }>('DELETE', `/content/${key}`),
  customised: () => request<{ customised: Record<string, string> }>('GET', '/content').then((r) => r.customised),
  uploadMedia: (file: Blob) => request<{ url: string }>('POST', '/media', { body: file }).then((r) => r.url),

  analytics: () => request<Analytics>('GET', '/analytics'),
  activity: (page: number) => request<{ items: ActivityEntry[]; total: number; page: number; pageSize: number }>('GET', `/activity?page=${page}`),
};

/* ── Formatting ────────────────────────────────────────────────────────── */

export const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });

export const fmtDay = (ymd: string) =>
  new Date(`${ymd}T00:00:00Z`).toLocaleDateString('en-IN', { timeZone: 'UTC', weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

/* ── Image preparation (the server does not resize) ────────────────────── */

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const MAX_EDGE = 2400;

/**
 * Validates an image file and shrinks large photos before upload: phone photos are often
 * 5 to 12 MB, far more than a web gallery needs. PNGs are kept as-is unless they are huge.
 */
export async function prepareImage(file: File): Promise<Blob> {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error(`${file.name}: only JPEG, PNG or WebP images are allowed.`);

  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) throw new Error(`${file.name}: this file could not be read as an image.`);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const needsShrink = scale < 1 || file.size > 3 * 1024 * 1024;

  if (!needsShrink && file.size <= MAX_UPLOAD_BYTES) {
    bitmap.close();
    return file;
  }
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const type = file.type === 'image/png' ? 'image/webp' : file.type; // keeps PNG transparency, much smaller
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, type, 0.86));
  if (!blob) throw new Error(`${file.name}: could not be resized.`);
  // Only use the re-encoded copy if it is actually smaller (or the original was over the limit).
  if (blob.size < file.size || file.size > MAX_UPLOAD_BYTES) {
    if (blob.size > MAX_UPLOAD_BYTES) throw new Error(`${file.name}: is too large even after resizing (max 8 MB).`);
    return blob;
  }
  return file;
}
