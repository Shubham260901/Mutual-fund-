import { Hero } from '@/components/home/Hero';
import {
  CtaBanner,
  DistributorIntro,
  EducationPreview,
  FaqSection,
  Journey,
  ServicesGrid,
  TrustStrip,
  WhyChooseUs,
} from '@/components/home/HomeSections';
import { SipPreview } from '@/components/home/SipPreview';
import { usePageMeta } from '@/hooks/usePageMeta';

export default function Home() {
  usePageMeta(
    '',
    'Goal-based mutual fund investing, SIPs and portfolio support from an AMFI-registered Mutual Fund Distributor. Mutual fund investments are subject to market risks.',
    '/',
  );
  return (
    <>
      <Hero />
      <TrustStrip />
      <DistributorIntro />
      <ServicesGrid />
      <WhyChooseUs />
      <Journey />
      <SipPreview />
      <EducationPreview />
      <FaqSection />
      <CtaBanner />
    </>
  );
}
