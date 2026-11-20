import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PageHero } from '@/components/ui/PageHero';
import { usePageMeta } from '@/hooks/usePageMeta';

export default function NotFound() {
  usePageMeta('Page not found', 'The page you are looking for does not exist.');
  return (
    <PageHero
      eyebrow="404"
      title="This page has moved, or never existed."
      description="Let’s get you back on track. Head to the homepage or explore our calculators and guides."
    >
      <div className="flex flex-wrap gap-3">
        <Button to="/" size="lg" trailingIcon={<ArrowRight className="h-4 w-4" />}>
          Back to home
        </Button>
        <Button to="/calculators" size="lg" variant="outline-light">
          Calculators
        </Button>
      </div>
    </PageHero>
  );
}
