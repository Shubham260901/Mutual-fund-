import { BarChart3, BookOpen, Briefcase, ExternalLink, HelpCircle, History, Images, Inbox, Loader2, LogOut, type LucideIcon, Search, Settings } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';
import { ActivityPanel } from './ActivityPanel';
import { adminApi, ApiError, type EnquiryFilters, onUnauthorized } from './api';
import { ArticlesEditor } from './ArticlesEditor';
import { Dashboard } from './Dashboard';
import { confirmDiscard } from './editor';
import { EnquiriesPanel } from './EnquiriesPanel';
import { FaqsEditor } from './FaqsEditor';
import { GalleryPanel } from './GalleryPanel';
import { Login } from './Login';
import { SeoEditor } from './SeoEditor';
import { ServicesEditor } from './ServicesEditor';
import { SettingsEditor } from './SettingsEditor';
import { btnSecondary } from './ui';

type Tab = 'dashboard' | 'enquiries' | 'activity' | 'articles' | 'faqs' | 'services' | 'gallery' | 'settings' | 'seo';

interface TabDef {
  id: Tab;
  label: string;
  title: string;
  icon: LucideIcon;
}

const GROUPS: { label: string; tabs: TabDef[] }[] = [
  {
    label: 'Overview',
    tabs: [
      { id: 'dashboard', label: 'Dashboard', title: 'Dashboard', icon: BarChart3 },
      { id: 'enquiries', label: 'Enquiries', title: 'Enquiries', icon: Inbox },
      { id: 'activity', label: 'Activity log', title: 'Activity log', icon: History },
    ],
  },
  {
    label: 'Content',
    tabs: [
      { id: 'articles', label: 'Articles', title: 'Education articles', icon: BookOpen },
      { id: 'faqs', label: 'FAQs', title: 'Frequently asked questions', icon: HelpCircle },
      { id: 'services', label: 'Services', title: 'Services & how it works', icon: Briefcase },
      { id: 'gallery', label: 'Gallery', title: 'Photo gallery', icon: Images },
    ],
  },
  {
    label: 'Site',
    tabs: [
      { id: 'settings', label: 'Settings', title: 'Site settings', icon: Settings },
      { id: 'seo', label: 'SEO', title: 'Search engine (SEO)', icon: Search },
    ],
  },
];
const ALL_TABS = GROUPS.flatMap((g) => g.tabs);
const isTab = (v: string): v is Tab => ALL_TABS.some((t) => t.id === v);
const tabFromHash = (): Tab => {
  const h = window.location.hash.slice(1);
  return isTab(h) ? h : 'dashboard';
};

/** Keeps the admin area out of search engine results. */
function useNoIndex() {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = 'Admin';
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => {
      meta.remove();
      document.title = prevTitle;
    };
  }, []);
}

export default function AdminApp() {
  useNoIndex();
  const [auth, setAuth] = useState<'loading' | 'out' | 'in' | 'offline'>('loading');
  const [tab, setTab] = useState<Tab>(tabFromHash);
  /** Filters handed to the Enquiries tab by a dashboard card. */
  const [preset, setPreset] = useState<Partial<EnquiryFilters> | undefined>();

  useEffect(() => {
    onUnauthorized(() => setAuth('out'));
    adminApi
      .me()
      .then(() => setAuth('in'))
      .catch((e) => setAuth(e instanceof ApiError && (e.status === 0 || e.status >= 500) ? 'offline' : 'out'));
    return () => onUnauthorized(null);
  }, []);

  // Back/forward buttons and manual hash edits.
  useEffect(() => {
    const onHash = () => setTab(tabFromHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const go = (t: Tab, filters?: Partial<EnquiryFilters>) => {
    if (t === tab || !confirmDiscard()) return;
    setPreset(filters);
    history.pushState(null, '', `#${t}`);
    setTab(t);
    window.scrollTo({ top: 0 });
  };

  if (auth === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ivory" role="status" aria-label="Loading">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-700" />
      </div>
    );
  }
  if (auth === 'offline') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ivory px-4 text-center">
        <div className="card max-w-md p-8">
          <h1 className="text-xl font-bold">Cannot reach the server</h1>
          <p className="mt-2 text-ink-muted">
            The admin panel needs the backend running. From the project folder, run <code className="rounded bg-mist px-1.5 py-0.5 text-sm">npm run dev</code>.
          </p>
          <button type="button" className={cn(btnSecondary, 'mt-5')} onClick={() => window.location.reload()}>
            Try again
          </button>
        </div>
      </div>
    );
  }
  if (auth === 'out') return <Login onSuccess={() => setAuth('in')} />;

  const current = ALL_TABS.find((t) => t.id === tab)!;

  return (
    <div className="min-h-screen bg-ivory lg:grid lg:grid-cols-[15rem_1fr]">
      <aside className="border-b border-navy-900/10 bg-white lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-4 py-4 lg:block lg:px-5 lg:py-6">
          <span className="font-display text-lg font-bold text-navy-900">Admin</span>
          <div className="flex gap-2 lg:mt-4 lg:flex-col">
            <a href="/" target="_blank" rel="noopener noreferrer" className={cn(btnSecondary, '!h-9 !px-3')}>
              <ExternalLink className="h-4 w-4" aria-hidden /> View site
            </a>
            <button
              type="button"
              className={cn(btnSecondary, '!h-9 !px-3')}
              onClick={async () => {
                if (!confirmDiscard()) return;
                await adminApi.logout().catch(() => {});
                setAuth('out');
              }}
            >
              <LogOut className="h-4 w-4" aria-hidden /> Sign out
            </button>
          </div>
        </div>
        <nav aria-label="Admin sections" className="flex gap-1 overflow-x-auto px-3 pb-3 lg:block lg:space-y-5 lg:overflow-visible lg:px-3 lg:pb-6">
          {GROUPS.map((g) => (
            <div key={g.label} className="flex gap-1 lg:block">
              <p className="hidden px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-ink-subtle lg:block">{g.label}</p>
              {g.tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  aria-current={tab === id ? 'page' : undefined}
                  onClick={() => go(id)}
                  className={cn(
                    'flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-semibold transition-colors lg:w-full',
                    tab === id ? 'bg-emerald-50 text-emerald-800' : 'text-ink-muted hover:bg-navy-900/5',
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden /> {label}
                </button>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      <main className="min-w-0 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <h1 className="mb-6 text-2xl font-bold">{current.title}</h1>
          {tab === 'dashboard' && <Dashboard onOpenEnquiries={(f) => go('enquiries', f)} />}
          {tab === 'enquiries' && <EnquiriesPanel key={JSON.stringify(preset ?? {})} initial={preset} />}
          {tab === 'activity' && <ActivityPanel />}
          {tab === 'articles' && <ArticlesEditor />}
          {tab === 'faqs' && <FaqsEditor />}
          {tab === 'services' && <ServicesEditor />}
          {tab === 'gallery' && <GalleryPanel />}
          {tab === 'settings' && <SettingsEditor />}
          {tab === 'seo' && <SeoEditor />}
        </div>
      </main>
    </div>
  );
}
