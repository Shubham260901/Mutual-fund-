import { MotionConfig } from 'framer-motion';
import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import Home from '@/pages/Home';

// Inner pages are code-split so the homepage loads fast.
const About = lazy(() => import('@/pages/About'));
const Services = lazy(() => import('@/pages/Services'));
const CalculatorsPage = lazy(() => import('@/pages/CalculatorsPage'));
const Education = lazy(() => import('@/pages/Education'));
const Article = lazy(() => import('@/pages/Article'));
const Contact = lazy(() => import('@/pages/Contact'));
const Disclosures = lazy(() => import('@/pages/Disclosures'));
const NotFound = lazy(() => import('@/pages/NotFound'));
// Admin panel: its own bundle, no site navbar/footer.
const AdminApp = lazy(() => import('@/admin/AdminApp'));

function PageFallback() {
  return <div className="min-h-[70vh] bg-navy-900" aria-busy="true" />;
}

const page = (el: React.ReactNode) => <Suspense fallback={<PageFallback />}>{el}</Suspense>;

const router = createBrowserRouter([
  { path: '/admin', element: page(<AdminApp />) },
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/about', element: page(<About />) },
      { path: '/services', element: page(<Services />) },
      { path: '/calculators', element: page(<CalculatorsPage />) },
      { path: '/education', element: page(<Education />) },
      { path: '/education/:slug', element: page(<Article />) },
      { path: '/contact', element: page(<Contact />) },
      { path: '/disclosures', element: page(<Disclosures />) },
      { path: '*', element: page(<NotFound />) },
    ],
  },
]);

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <RouterProvider router={router} />
    </MotionConfig>
  );
}
