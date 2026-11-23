import { Link } from 'react-router-dom';
import { site } from '@/config/site';
import { cn } from '@/lib/cn';

/** The round "Deepak Gedam · Mutual Fund Distributor" badge (public/images/logo-badge*.png). */
export function LogoMark({ className }: { className?: string }) {
  return (
    <img
      src="/images/logo-badge-160.png"
      srcSet="/images/logo-badge-160.png 160w, /images/logo-badge.png 512w"
      sizes="(min-width: 1024px) 96px, 80px"
      width={160}
      height={160}
      alt=""
      aria-hidden
      decoding="async"
      className={cn('h-11 w-11 shrink-0 rounded-full', className)}
    />
  );
}

export function Logo({ tone = 'dark', size = 'md' }: { tone?: 'dark' | 'light'; size?: 'md' | 'lg' }) {
  const lg = size === 'lg';
  return (
    <Link to="/" className={cn('group flex items-center', lg ? 'w-fit gap-5' : 'gap-3')} aria-label={`${site.name}, home`}>
      <LogoMark
        className={cn(
          'transition-transform duration-300 group-hover:scale-[1.04]',
          lg && 'h-[6.5rem] w-[6.5rem] shadow-[0_0_0_5px_rgba(255,255,255,0.06)] sm:h-[7.75rem] sm:w-[7.75rem]',
        )}
      />
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            'font-display font-bold tracking-tight',
            lg ? 'whitespace-nowrap text-[1.625rem] sm:text-[1.8rem]' : 'text-[1.0625rem]',
            tone === 'light' ? 'text-white' : 'text-navy-900',
          )}
        >
          {site.name}
        </span>
        <span
          className={cn(
            'font-medium uppercase',
            lg ? 'mt-2.5 text-[0.8125rem] leading-snug tracking-[0.12em] sm:text-[0.9375rem]' : 'mt-1 text-[0.6875rem] tracking-[0.14em]',
            tone === 'light' ? 'text-gold-300' : 'text-gold-700',
          )}
        >
          {site.tagline}
        </span>
      </span>
    </Link>
  );
}
