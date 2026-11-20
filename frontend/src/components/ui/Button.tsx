import { Link } from 'react-router-dom';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'light' | 'outline-light';
type Size = 'md' | 'lg';

const base =
  'group inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold transition-all duration-200 ease-out disabled:pointer-events-none disabled:opacity-60';

const variants: Record<Variant, string> = {
  primary:
    'bg-emerald-600 text-white shadow-[0_1px_0_rgba(255,255,255,0.15)_inset,0_8px_20px_-8px_rgba(8,127,91,0.6)] hover:bg-emerald-700 hover:-translate-y-px',
  secondary: 'border border-navy-900/15 bg-white text-navy-900 hover:border-navy-900/30 hover:bg-navy-50 hover:-translate-y-px',
  ghost: 'text-navy-900 hover:bg-navy-900/5',
  light: 'bg-white text-navy-900 hover:bg-ivory hover:-translate-y-px',
  'outline-light': 'border border-white/25 text-white hover:border-white/50 hover:bg-white/5 hover:-translate-y-px',
};

const sizes: Record<Size, string> = {
  md: 'h-11 px-5 text-sm',
  lg: 'h-[3.25rem] px-7 text-[0.9375rem]',
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
  /** Icon rendered after the label; nudges right on hover. */
  trailingIcon?: ReactNode;
  leadingIcon?: ReactNode;
}

type ButtonAsLink = CommonProps & { to: string } & Omit<ComponentPropsWithoutRef<typeof Link>, 'to' | 'className' | 'children'>;
type ButtonAsAnchor = CommonProps & { href: string } & Omit<ComponentPropsWithoutRef<'a'>, 'href' | 'className' | 'children'>;
type ButtonAsButton = CommonProps & Omit<ComponentPropsWithoutRef<'button'>, 'className' | 'children'>;

export type ButtonProps = ButtonAsLink | ButtonAsAnchor | ButtonAsButton;

export function Button(props: ButtonProps) {
  const { variant = 'primary', size = 'md', className, children, trailingIcon, leadingIcon, ...rest } = props;
  const classes = cn(base, variants[variant], sizes[size], className);
  const content = (
    <>
      {leadingIcon}
      <span>{children}</span>
      {trailingIcon && <span className="transition-transform duration-200 group-hover:translate-x-0.5">{trailingIcon}</span>}
    </>
  );

  if ('to' in rest) {
    return (
      <Link className={classes} {...(rest as ButtonAsLink)}>
        {content}
      </Link>
    );
  }
  if ('href' in rest) {
    const anchor = rest as ButtonAsAnchor;
    const external = /^https?:/.test(anchor.href);
    return (
      <a className={classes} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} {...anchor}>
        {content}
      </a>
    );
  }
  return (
    <button className={classes} type="button" {...(rest as ButtonAsButton)}>
      {content}
    </button>
  );
}
