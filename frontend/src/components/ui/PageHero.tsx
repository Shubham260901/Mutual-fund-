import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface PageHeroProps {
  eyebrow: string;
  title: ReactNode;
  description: ReactNode;
  children?: ReactNode;
}

/** Navy header band used at the top of every inner page. */
export function PageHero({ eyebrow, title, description, children }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden bg-navy-900 bg-navy-radial pb-20 pt-36 sm:pb-24 sm:pt-44">
      <GridTexture />
      <div className="container-page relative">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl"
        >
          <p className="eyebrow eyebrow-light mb-5">{eyebrow}</p>
          <h1 className="text-display-xl font-bold text-white">{title}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-navy-100/80">{description}</p>
          {children && <div className="mt-9">{children}</div>}
        </motion.div>
      </div>
    </section>
  );
}

/** Subtle grid lines that fade out: adds depth to navy surfaces without decoration. */
export function GridTexture() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-[0.07]"
      style={{
        backgroundImage:
          'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
        backgroundSize: '72px 72px',
        maskImage: 'radial-gradient(ellipse 70% 60% at 70% 20%, #000 20%, transparent 75%)',
        WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 70% 20%, #000 20%, transparent 75%)',
      }}
    />
  );
}
