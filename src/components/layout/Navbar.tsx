import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Menu, MessageCircle, Phone, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { nav, site, whatsappLink } from '@/config/site';
import { cn } from '@/lib/cn';
import { Button } from '../ui/Button';
import { Logo } from './Logo';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the mobile menu on navigation.
  useEffect(() => setOpen(false), [pathname]);

  // Lock scroll + Escape to close while the mobile menu is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const solid = scrolled || open;

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        solid ? 'border-b border-navy-900/[0.06] bg-white/90 shadow-[0_1px_0_rgba(16,29,53,0.03)] backdrop-blur-xl' : 'bg-transparent',
      )}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold"
      >
        Skip to content
      </a>
      <nav className="container-page flex h-[4.5rem] items-center justify-between gap-6 lg:h-20" aria-label="Main">
        <Logo tone={solid ? 'dark' : 'light'} />

        <ul className="hidden items-center gap-1 lg:flex">
          {nav.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  cn(
                    'relative rounded-full px-4 py-2 text-sm font-medium transition-colors',
                    solid
                      ? isActive
                        ? 'text-navy-900'
                        : 'text-ink-muted hover:text-navy-900'
                      : isActive
                        ? 'text-white'
                        : 'text-navy-100/75 hover:text-white',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {item.label}
                    {isActive && (
                      <motion.span
                        layoutId="nav-active"
                        className={cn('absolute inset-x-4 -bottom-0.5 h-px', solid ? 'bg-emerald-600' : 'bg-gold-400')}
                        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 lg:flex">
          <Button to="/contact?type=consultation" size="md" trailingIcon={<ArrowRight className="h-4 w-4" />}>
            Book a Consultation
          </Button>
        </div>

        <button
          type="button"
          className={cn(
            'flex h-11 w-11 items-center justify-center rounded-full transition-colors lg:hidden',
            solid ? 'text-navy-900 hover:bg-navy-900/5' : 'text-white hover:bg-white/10',
          )}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-x-0 bottom-0 top-[4.5rem] overflow-y-auto bg-white lg:hidden"
          >
            <div className="container-page flex min-h-full flex-col py-6">
              <ul className="flex flex-col">
                {nav.map((item, i) => (
                  <motion.li
                    key={item.to}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.03 * i }}
                  >
                    <NavLink
                      to={item.to}
                      end={item.to === '/'}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center justify-between border-b border-navy-900/[0.06] py-4 font-display text-xl font-semibold',
                          isActive ? 'text-emerald-700' : 'text-navy-900',
                        )
                      }
                    >
                      {item.label}
                      <ArrowRight className="h-5 w-5 opacity-40" />
                    </NavLink>
                  </motion.li>
                ))}
              </ul>
              <div className="mt-8 flex flex-col gap-3">
                <Button to="/contact?type=consultation" size="lg">
                  Book a Consultation
                </Button>
                <div className="grid grid-cols-2 gap-3">
                  <Button href={`tel:+${site.contact.phoneE164}`} variant="secondary" leadingIcon={<Phone className="h-4 w-4" />}>
                    Call
                  </Button>
                  <Button href={whatsappLink()} variant="secondary" leadingIcon={<MessageCircle className="h-4 w-4" />}>
                    WhatsApp
                  </Button>
                </div>
              </div>
              <p className="mt-auto pt-10 text-xs leading-relaxed text-ink-subtle">
                {site.credentials.category} · {site.credentials.arn}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
