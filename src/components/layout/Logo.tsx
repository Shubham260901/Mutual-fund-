import { Link } from 'react-router-dom';
import { site } from '@/config/site';
import { cn } from '@/lib/cn';

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={cn('h-9 w-9', className)} aria-hidden>
      <rect width="40" height="40" rx="11" fill="#101D35" />
      <rect x="0.5" y="0.5" width="39" height="39" rx="10.5" fill="none" stroke="#C7A66A" strokeOpacity="0.35" />
      <path d="M10 26.5 17.5 19l5 3.75L30 14" fill="none" stroke="#C7A66A" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="30" cy="14" r="2.9" fill="#0E8D66" />
    </svg>
  );
}

export function Logo({ tone = 'dark' }: { tone?: 'dark' | 'light' }) {
  return (
    <Link to="/" className="group flex items-center gap-3" aria-label={`${site.name}, home`}>
      <LogoMark className="transition-transform duration-300 group-hover:scale-[1.04]" />
      <span className="flex flex-col leading-none">
        <span className={cn('font-display text-[1.0625rem] font-bold tracking-tight', tone === 'light' ? 'text-white' : 'text-navy-900')}>
          {site.name}
        </span>
        <span className={cn('mt-1 text-[0.6875rem] font-medium uppercase tracking-[0.14em]', tone === 'light' ? 'text-gold-300' : 'text-gold-700')}>
          {site.tagline}
        </span>
      </span>
    </Link>
  );
}
