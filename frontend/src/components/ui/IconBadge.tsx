import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

interface IconBadgeProps {
  icon: LucideIcon;
  tone?: 'brand' | 'navy' | 'gold' | 'glass';
  size?: 'md' | 'lg';
  className?: string;
}

const tones = {
  brand: 'bg-brand-50 text-brand-700 ring-brand-600/10',
  navy: 'bg-navy-900 text-gold-300 ring-navy-900/10',
  gold: 'bg-gold-100 text-gold-700 ring-gold-400/20',
  glass: 'bg-white/[0.06] text-gold-300 ring-white/10',
};

export function IconBadge({ icon: Icon, tone = 'brand', size = 'md', className }: IconBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-2xl ring-1 ring-inset',
        size === 'md' ? 'h-11 w-11' : 'h-14 w-14',
        tones[tone],
        className,
      )}
      aria-hidden
    >
      <Icon className={size === 'md' ? 'h-5 w-5' : 'h-6 w-6'} strokeWidth={1.75} />
    </span>
  );
}
