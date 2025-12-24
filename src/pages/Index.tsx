import { Layout } from "@/components/layout/Layout";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { DailyBrief } from "@/components/articles/DailyBrief";
import { BreakingTicker } from "@/components/articles/BreakingTicker";
import { mockArticles, breakingNews, dailyBriefItems } from "@/data/mockArticles";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Helmet } from "react-helmet-async";

export default function Index() {
  const heroArticle = mockArticles[0];
  const featuredArticles = mockArticles.slice(1, 4);
  const researchArticles = mockArticles.filter((a) => a.category === "Research");
  const companyArticles = mockArticles.filter((a) => a.category === "Companies");
  const policyArticles = mockArticles.filter((a) => a.category === "Policy & Ethics");

  return (
    <>
      <Helmet>
        <title>Cognitive Ledger — Independent Journalism for Artificial Intelligence</title>
        <meta
          name="description"
          content="Authoritative coverage of AI research, policy, and industry. Breaking news, analysis, and the AI Index tracking major models."
        />
      </Helmet>

      <BreakingTicker items={breakingNews} />

      <Layout>
        <div className="container py-8">
          {/* Hero Section */}
          <section className="mb-12 animate-fade-in-up">
            <ArticleCard {...heroArticle} variant="hero" />
          </section>

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
                    <ArticleCard {...article} variant="featured" />
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-4">
              <DailyBrief
                items={dailyBriefItems}
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
                  <ArticleCard key={article.slug} {...article} variant="compact" />
                ))}
              </div>
            </section>
          )}

          <div className="divider-subtle mb-8" />

          {/* Section: Companies */}
          {companyArticles.length > 0 && (
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
                  <ArticleCard key={article.slug} {...article} variant="compact" />
                ))}
              </div>
            </section>
          )}

          <div className="divider-subtle mb-8" />

          {/* Section: Policy & Ethics */}
          {policyArticles.length > 0 && (
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
                  <ArticleCard key={article.slug} {...article} variant="compact" />
                ))}
              </div>
            </section>
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
