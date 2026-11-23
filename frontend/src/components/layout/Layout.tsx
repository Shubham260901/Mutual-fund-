import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { whatsappLink } from '@/config/site';
import { WhatsAppIcon } from '../ui/WhatsAppIcon';
import { Footer } from './Footer';
import { Navbar } from './Navbar';

/** Scroll to top on route change, or to the #hash target when one is present. */
function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      // The target may live in a lazily-loaded page: retry for up to ~2s until it renders.
      const id = decodeURIComponent(hash.slice(1));
      let tries = 0;
      let t = 0;
      const attempt = () => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        else if (tries++ < 40) t = window.setTimeout(attempt, 50);
      };
      t = window.setTimeout(attempt, 30);
      return () => window.clearTimeout(t);
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname, hash]);
  return null;
}

function WhatsAppFab() {
  return (
    <motion.a
      href={whatsappLink()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1.2, duration: 0.4 }}
      // WhatsApp's own brand green, kept on purpose even though the site's accent colour is blue.
      className="group fixed bottom-5 right-5 z-40 flex h-14 items-center gap-2 rounded-full bg-gradient-to-br from-[#25D366] via-[#17A55C] to-[#0E7A5C] pl-4 pr-4 text-white shadow-[0_10px_28px_-8px_rgba(14,122,92,0.7)] transition-[filter] hover:brightness-95 sm:bottom-6 sm:right-6"
    >
      <WhatsAppIcon className="h-6 w-6" />
      <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-semibold transition-all duration-300 group-hover:max-w-[8rem] group-focus-visible:max-w-[8rem]">
        WhatsApp us
      </span>
    </motion.a>
  );
}

export function Layout() {
  return (
    <>
      <ScrollManager />
      <Navbar />
      <main id="main">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppFab />
    </>
  );
}
