import { useLocation } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { useArticles } from "@/hooks/useArticles";
import { Helmet } from "react-helmet-async";
import { Skeleton } from "@/components/ui/skeleton";

const categoryMeta: Record<string, { title: string; description: string; dbKey: string }> = {
  breaking: {
    title: "Breaking AI",
    description: "The latest developments in artificial intelligence as they happen.",
    dbKey: "breaking",
  },
  research: {
    title: "Research",
    description: "Coverage of academic publications, breakthrough findings, and scientific advances in AI.",
    dbKey: "research",
  },
  companies: {
    title: "Companies",
    description: "Business news, corporate strategy, and industry analysis from leading AI organizations.",
    dbKey: "companies",
  },
  policy: {
    title: "Policy & Ethics",
    description: "Regulation, governance, and ethical considerations shaping the future of AI.",
    dbKey: "policy",
  },
  models: {
    title: "Models & Tools",
    description: "New model releases, capability updates, and developer tools.",
    dbKey: "models",
  },
  opinion: {
    title: "Opinion",
    description: "Expert perspectives and analysis on the most pressing issues in AI.",
    dbKey: "opinion",
  },
  explainers: {
    title: "Explainers",
    description: "Clear, accessible explanations of complex AI concepts and technologies.",
    dbKey: "explainers",
  },
};

export default function CategoryPage() {
  const location = useLocation();
  const categoryKey = location.pathname.slice(1) || "breaking";
  
  const { data: allArticles, isLoading } = useArticles();

  const meta = categoryMeta[categoryKey] || {
    title: categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1),
    description: "Articles in this category.",
    dbKey: categoryKey,
  };

  const articles = (allArticles ?? []).filter((a) => {
    if (categoryKey === "breaking") return a.is_breaking;
    return a.category === meta.dbKey;
  });

  const transformArticle = (article: typeof articles[0]) => ({
    slug: article.slug,
    headline: article.title,
    excerpt: article.excerpt,
    category: article.category.charAt(0).toUpperCase() + article.category.slice(1),
    author: article.author,
    date: new Date(article.published_at).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
    readTime: `${article.reading_time} min read`,
    imageUrl: article.image_url ?? undefined,
    isBreaking: article.is_breaking,
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-8">
          <Skeleton className="h-12 w-64 mb-4" />
          <Skeleton className="h-6 w-96 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Helmet>
        <title>{meta.title} — Cognitive Ledger</title>
        <meta name="description" content={meta.description} />
      </Helmet>

      <Layout>
        <div className="container py-8">
          <header className="max-w-3xl mb-12 border-b border-divider pb-8">
            <span className="category-badge">Section</span>
            <h1 className="headline-hero mt-3 mb-4">{meta.title}</h1>
            <p className="text-xl text-body-text leading-relaxed">
              {meta.description}
            </p>
          </header>

          {articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map((article) => (
                <ArticleCard key={article.slug} {...transformArticle(article)} variant="featured" />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border border-divider">
              <h3 className="headline-tertiary mb-2">No articles yet</h3>
              <p className="text-body-text">
                Check back soon for coverage in this section.
              </p>
            </div>
          )}
        </div>
      </Layout>
    </>
  );
}
