import { isPlaceholder } from '@/config/site';
import { cn } from '@/lib/cn';

/**
 * Renders a config value. If it still contains a [placeholder], it gets a
 * dashed gold underline in development so nothing unverified ships unnoticed.
 */
export function Value({ children, className }: { children: string; className?: string }) {
  const flagged = import.meta.env.DEV && isPlaceholder(children);
  return (
    <span
      className={cn(flagged && 'underline decoration-gold-400 decoration-dashed decoration-2 underline-offset-4', className)}
      title={flagged ? 'Placeholder: replace in src/config/site.ts' : undefined}
    >
      {children}
    </span>
  );
}
