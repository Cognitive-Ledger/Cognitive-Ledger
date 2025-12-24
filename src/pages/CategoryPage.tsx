import { useParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { mockArticles } from "@/data/mockArticles";
import { Helmet } from "react-helmet-async";

const categoryMeta: Record<string, { title: string; description: string }> = {
  breaking: {
    title: "Breaking AI",
    description: "The latest developments in artificial intelligence as they happen.",
  },
  research: {
    title: "Research",
    description: "Coverage of academic publications, breakthrough findings, and scientific advances in AI.",
  },
  companies: {
    title: "Companies",
    description: "Business news, corporate strategy, and industry analysis from leading AI organizations.",
  },
  policy: {
    title: "Policy & Ethics",
    description: "Regulation, governance, and ethical considerations shaping the future of AI.",
  },
  models: {
    title: "Models & Tools",
    description: "New model releases, capability updates, and developer tools.",
  },
  opinion: {
    title: "Opinion",
    description: "Expert perspectives and analysis on the most pressing issues in AI.",
  },
  explainers: {
    title: "Explainers",
    description: "Clear, accessible explanations of complex AI concepts and technologies.",
  },
};

export default function CategoryPage() {
  const { category } = useParams<{ category: string }>();

  const categoryKey = category || "breaking";
  const meta = categoryMeta[categoryKey] || {
    title: categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1),
    description: "Articles in this category.",
  };

  // Filter articles by category
  const categoryMap: Record<string, string> = {
    breaking: "Breaking AI",
    research: "Research",
    companies: "Companies",
    policy: "Policy & Ethics",
    models: "Models & Tools",
    opinion: "Opinion",
    explainers: "Explainers",
  };

  const categoryName = categoryMap[categoryKey];
  const articles = mockArticles.filter((a) => {
    if (categoryKey === "breaking") return a.isBreaking;
    return a.category === categoryName;
  });

  return (
    <>
      <Helmet>
        <title>{meta.title} — Cognitive Ledger</title>
        <meta name="description" content={meta.description} />
      </Helmet>

      <Layout>
        <div className="container py-8">
          {/* Header */}
          <header className="max-w-3xl mb-12 border-b border-divider pb-8">
            <span className="category-badge">Section</span>
            <h1 className="headline-hero mt-3 mb-4">{meta.title}</h1>
            <p className="text-xl text-body-text leading-relaxed">
              {meta.description}
            </p>
          </header>

          {/* Articles Grid */}
          {articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map((article) => (
                <ArticleCard key={article.slug} {...article} variant="featured" />
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
