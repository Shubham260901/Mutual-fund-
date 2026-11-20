import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Reveal } from './Reveal';

interface SectionHeadingProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: 'left' | 'center';
  tone?: 'dark' | 'light';
  as?: 'h1' | 'h2';
  className?: string;
  action?: ReactNode;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  tone = 'dark',
  as: Tag = 'h2',
  className,
  action,
}: SectionHeadingProps) {
  const center = align === 'center';
  return (
    <Reveal
      className={cn(
        'flex flex-col gap-6',
        center ? 'mx-auto max-w-2xl items-center text-center' : action ? 'md:flex-row md:items-end md:justify-between' : '',
        className,
      )}
    >
      <div className={cn('max-w-2xl', center && 'flex flex-col items-center')}>
        {eyebrow && <p className={cn('eyebrow mb-4', tone === 'light' && 'eyebrow-light')}>{eyebrow}</p>}
        <Tag className={cn('text-display-lg font-bold', tone === 'light' && 'text-white')}>{title}</Tag>
        {description && (
          <p className={cn('mt-5 text-lg leading-relaxed', tone === 'light' ? 'text-navy-100/80' : 'text-ink-muted')}>
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </Reveal>
  );
}
