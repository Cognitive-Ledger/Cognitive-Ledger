import { Layout } from "@/components/layout/Layout";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { DailyBrief } from "@/components/articles/DailyBrief";
import { BreakingTicker } from "@/components/articles/BreakingTicker";
import { useArticles, useBreakingNews, useDailyBrief } from "@/hooks/useArticles";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { Skeleton } from "@/components/ui/skeleton";

export default function Index() {
  const { data: articles, isLoading: articlesLoading } = useArticles();
  const { data: breakingNews } = useBreakingNews();
  const { data: dailyBriefItems } = useDailyBrief();

  const heroArticle = articles?.[0];
  const featuredArticles = articles?.slice(1, 4) ?? [];
  const researchArticles = articles?.filter((a) => a.category === "research") ?? [];
  const companyArticles = articles?.filter((a) => a.category === "companies") ?? [];
  const policyArticles = articles?.filter((a) => a.category === "policy") ?? [];

  const tickerItems = breakingNews?.map((item) => ({
    id: item.id,
    headline: item.content,
    slug: "",
  })) ?? [];

  const briefItems = dailyBriefItems?.map((item) => ({
    text: item.content,
    category: "Update",
  })) ?? [];

  // Transform article data for ArticleCard
  const transformArticle = (article: typeof heroArticle) => {
    if (!article) return null;
    return {
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
      isFeatured: article.is_featured,
      businessImpact: (article.business_impact as "low" | "medium" | "high") ?? "medium",
      technicalImpact: (article.technical_impact as "low" | "medium" | "high") ?? "medium",
      ethicalRisk: (article.ethical_risk as "low" | "medium" | "high") ?? "low",
    };
  };

  if (articlesLoading) {
    return (
      <Layout>
        <div className="container py-8">
          <Skeleton className="h-96 w-full mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </Layout>
    );
  }

  const hasArticles = articles && articles.length > 0;

  return (
    <>
      <Helmet>
        <title>Cognitive Ledger — Independent Journalism for Artificial Intelligence</title>
        <meta
          name="description"
          content="Authoritative coverage of AI research, policy, and industry. Breaking news, analysis, and the AI Index tracking major models."
        />
      </Helmet>

      <BreakingTicker items={tickerItems} />

      <Layout>
        <div className="container py-8">
          {!hasArticles ? (
            <div className="text-center py-16 border border-divider">
              <h2 className="headline-secondary mb-4">No Articles Yet</h2>
              <p className="text-body-text mb-6">
                Articles will appear here once they are published.
              </p>
              <Link
                to="/ai-index"
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
              >
                Explore the AI Index <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <>
              {/* Hero Section */}
              {heroArticle && (
                <section className="mb-12 animate-fade-in-up">
                  <ArticleCard {...transformArticle(heroArticle)!} variant="hero" />
                </section>
              )}

              <div className="divider-bold mb-8" />

              {/* Featured + Sidebar Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
                {/* Featured Articles */}
                <div className="lg:col-span-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {featuredArticles.map((article, index) => (
                      <div
                        key={article.slug}
                        className="animate-fade-in-up"
                        style={{ animationDelay: `${(index + 1) * 100}ms` }}
                      >
                        <ArticleCard {...transformArticle(article)!} variant="featured" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sidebar */}
                <aside className="lg:col-span-4">
                  <DailyBrief
                    items={briefItems}
                    date={new Date().toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  />
                </aside>
              </div>

              <div className="divider-subtle mb-8" />

              {/* Section: Research */}
              {researchArticles.length > 0 && (
                <section className="mb-12">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="headline-secondary">Research</h2>
                    <Link
                      to="/research"
                      className="text-sm text-primary font-medium flex items-center gap-1 hover:underline"
                    >
                      View All <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {researchArticles.slice(0, 2).map((article) => (
                      <ArticleCard key={article.slug} {...transformArticle(article)!} variant="compact" />
                    ))}
                  </div>
                </section>
              )}

              {companyArticles.length > 0 && (
                <>
                  <div className="divider-subtle mb-8" />
                  <section className="mb-12">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="headline-secondary">Companies</h2>
                      <Link
                        to="/companies"
                        className="text-sm text-primary font-medium flex items-center gap-1 hover:underline"
                      >
                        View All <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {companyArticles.slice(0, 2).map((article) => (
                        <ArticleCard key={article.slug} {...transformArticle(article)!} variant="compact" />
                      ))}
                    </div>
                  </section>
                </>
              )}

              {policyArticles.length > 0 && (
                <>
                  <div className="divider-subtle mb-8" />
                  <section className="mb-12">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="headline-secondary">Policy & Ethics</h2>
                      <Link
                        to="/policy"
                        className="text-sm text-primary font-medium flex items-center gap-1 hover:underline"
                      >
                        View All <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {policyArticles.slice(0, 2).map((article) => (
                        <ArticleCard key={article.slug} {...transformArticle(article)!} variant="compact" />
                      ))}
                    </div>
                  </section>
                </>
              )}
            </>
          )}

          {/* AI Index Promo */}
          <section className="bg-primary text-primary-foreground p-8 md:p-12">
            <div className="max-w-2xl">
              <span className="text-xs uppercase tracking-widest opacity-70">Reference</span>
              <h2 className="font-serif text-2xl md:text-3xl font-medium mt-2 mb-4">
                The AI Index
              </h2>
              <p className="text-primary-foreground/80 mb-6">
                A comprehensive, continuously updated reference tracking major AI models, 
                their capabilities, benchmarks, and version histories. The authoritative 
                public record for artificial intelligence.
              </p>
              <Link
                to="/ai-index"
                className="inline-flex items-center gap-2 text-sm font-semibold border border-primary-foreground/30 px-4 py-2 hover:bg-primary-foreground/10 transition-colors"
              >
                Explore the AI Index <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
        </div>
      </Layout>
    </>
  );
}
