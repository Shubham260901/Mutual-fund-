import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Info } from 'lucide-react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArticleCard, CtaBanner } from '@/components/home/HomeSections';
import { GridTexture } from '@/components/ui/PageHero';
import { Reveal } from '@/components/ui/Reveal';
import { articles, getArticle, type Block } from '@/content/articles';
import { STANDARD_RISK_WARNING } from '@/content/disclosures';
import { usePageMeta } from '@/hooks/usePageMeta';

function renderBlock(b: Block, i: number) {
  switch (b.type) {
    case 'h2':
      return <h2 key={i}>{b.text}</h2>;
    case 'h3':
      return <h3 key={i}>{b.text}</h3>;
    case 'p':
      return <p key={i}>{b.text}</p>;
    case 'ul':
      return (
        <ul key={i}>
          {b.items.map((it) => (
            <li key={it}>{it}</li>
          ))}
        </ul>
      );
    case 'callout':
      return (
        <aside key={i} className="my-8 flex gap-3 rounded-2xl border-l-4 border-gold-400 bg-gold-100/50 px-5 py-4">
          <Info className="mt-1 h-4 w-4 shrink-0 text-gold-700" aria-hidden />
          <p className="!mb-0 !text-base font-medium !text-navy-900">{b.text}</p>
        </aside>
      );
  }
}

export default function Article() {
  const { slug = '' } = useParams();
  const article = getArticle(slug);
  usePageMeta(article?.seoTitle || article?.title || 'Article', article?.seoDescription || article?.excerpt || '', `/education/${slug}`);

  if (!article) return <Navigate to="/education#articles" replace />;
  const related = articles.filter((a) => a.slug !== article.slug).slice(0, 3);

  return (
    <>
      <header className="relative overflow-hidden bg-navy-900 bg-navy-radial pb-16 pt-36 sm:pb-20 sm:pt-44">
        <GridTexture />
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="container-page relative max-w-3xl"
        >
          <Link to="/education#articles" className="inline-flex items-center gap-2 text-sm font-medium text-navy-100/75 hover:text-white">
            <ArrowLeft className="h-4 w-4" /> All articles
          </Link>
          <div className="mt-8 flex items-center gap-3 text-sm">
            <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">{article.category}</span>
            <span className="inline-flex items-center gap-1.5 text-navy-100/70">
              <Clock className="h-3.5 w-3.5" aria-hidden /> {article.readMinutes} min read
            </span>
          </div>
          <h1 className="mt-5 text-display-lg font-bold text-white">{article.title}</h1>
          <p className="mt-5 text-lg leading-relaxed text-navy-100/80">{article.excerpt}</p>
        </motion.div>
      </header>

      <article className="container-page max-w-3xl py-16 sm:py-20">
        <div className="prose-article">{article.body.map(renderBlock)}</div>
        <p className="mt-12 border-t border-navy-900/10 pt-6 text-xs leading-relaxed text-ink-subtle">
          This article is for general investor education only and is not a recommendation to invest in any particular scheme.{' '}
          {STANDARD_RISK_WARNING}
        </p>
      </article>

      <section className="pb-20 sm:pb-24">
        <div className="container-page">
          <h2 className="text-2xl font-bold">Keep reading</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {related.map((a, i) => (
              <Reveal key={a.slug} delay={i * 0.06}>
                <ArticleCard article={a} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <CtaBanner />
    </>
  );
}
