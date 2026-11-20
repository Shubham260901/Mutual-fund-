import { motion, type HTMLMotionProps } from 'framer-motion';
import type { ReactNode } from 'react';

interface RevealProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode;
  delay?: number;
  /** Vertical offset in px the element rises from. */
  y?: number;
}

/**
 * Fades and lifts content into view once. Global <MotionConfig reducedMotion="user">
 * in App.tsx turns this into a plain fade for users who prefer reduced motion.
 */
export function Reveal({ children, delay = 0, y = 18, ...rest }: RevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -80px 0px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
