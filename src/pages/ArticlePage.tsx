import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { AIImpactPanel } from "@/components/articles/AIImpactPanel";
import { ReadingModeToggle } from "@/components/articles/ReadingModeToggle";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { mockArticles } from "@/data/mockArticles";
import { Clock, ArrowLeft, Share2, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const [readingMode, setReadingMode] = useState<"simple" | "technical">("simple");

  const article = mockArticles.find((a) => a.slug === slug);

  if (!article) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <h1 className="headline-primary mb-4">Article Not Found</h1>
          <p className="text-body-text mb-8">
            The article you're looking for doesn't exist or has been moved.
          </p>
          <Link to="/" className="text-primary hover:underline">
            Return to Front Page
          </Link>
        </div>
      </Layout>
    );
  }

  const relatedArticles = mockArticles
    .filter((a) => a.slug !== slug && a.category === article.category)
    .slice(0, 3);

  return (
    <>
      <Helmet>
        <title>{article.headline} — Cognitive Ledger</title>
        <meta name="description" content={article.excerpt} />
        <meta property="og:title" content={article.headline} />
        <meta property="og:description" content={article.excerpt} />
        <meta property="og:type" content="article" />
        {article.imageUrl && <meta property="og:image" content={article.imageUrl} />}
      </Helmet>

      <Layout>
        <article className="container py-8">
          {/* Breadcrumb */}
          <div className="mb-8">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-caption hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Front Page
            </Link>
          </div>

          {/* Article Header */}
          <header className="max-w-4xl mb-8">
            <div className="flex items-center gap-3 mb-4">
              {article.isBreaking && <span className="breaking-badge">Breaking</span>}
              <span className="category-badge">{article.category}</span>
            </div>

            <h1 className="headline-hero mb-6">{article.headline}</h1>

            <p className="text-xl text-body-text leading-relaxed mb-6">
              {article.excerpt}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-sm text-caption border-y border-divider py-4">
              <span className="font-medium text-foreground">{article.author}</span>
              <span>·</span>
              <span>{article.date}</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {article.readTime}
              </span>
              <div className="flex-1" />
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="text-caption">
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-caption">
                  <Bookmark className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </header>

          {/* Article Image */}
          {article.imageUrl && (
            <figure className="max-w-4xl mb-8">
              <img
                src={article.imageUrl}
                alt={article.headline}
                className="w-full aspect-[16/9] object-cover"
              />
              <figcaption className="text-xs text-caption mt-2">
                Image for illustrative purposes
              </figcaption>
            </figure>
          )}

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Article Body */}
            <div className="lg:col-span-8">
              {/* Reading Mode Toggle */}
              <div className="mb-8">
                <ReadingModeToggle mode={readingMode} onModeChange={setReadingMode} />
              </div>

              {/* Article Content */}
              <div className="prose prose-lg max-w-none">
                {(readingMode === "simple" ? article.simpleContent : article.technicalContent)
                  .split("\n\n")
                  .map((paragraph, index) => {
                    if (paragraph.startsWith("**") && paragraph.includes(":**")) {
                      const [title, ...content] = paragraph.split(":");
                      return (
                        <div key={index} className="mb-6">
                          <h3 className="font-serif text-lg font-semibold mb-2">
                            {title.replace(/\*\*/g, "")}
                          </h3>
                          <p className="body-text">{content.join(":").trim()}</p>
                        </div>
                      );
                    }
                    if (paragraph.startsWith("- ")) {
                      const items = paragraph.split("\n").filter((l) => l.startsWith("- "));
                      return (
                        <ul key={index} className="list-disc list-inside mb-6 space-y-1">
                          {items.map((item, i) => (
                            <li key={i} className="body-text">
                              {item.replace("- ", "")}
                            </li>
                          ))}
                        </ul>
                      );
                    }
                    return (
                      <p key={index} className="body-text mb-6">
                        {paragraph}
                      </p>
                    );
                  })}
              </div>

              {/* Tags */}
              <div className="mt-12 pt-8 border-t border-divider">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-caption mb-3">
                  Topics
                </h4>
                <div className="flex flex-wrap gap-2">
                  {[article.category, "Artificial Intelligence", "Technology"].map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-secondary text-sm text-secondary-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-4 space-y-8">
              <AIImpactPanel
                businessImpact={article.businessImpact}
                technicalImpact={article.technicalImpact}
                ethicalRisk={article.ethicalRisk}
              />

              {/* Related Articles */}
              {relatedArticles.length > 0 && (
                <div className="border border-divider p-5">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-caption mb-4">
                    Related Coverage
                  </h4>
                  <div className="space-y-4">
                    {relatedArticles.map((a) => (
                      <ArticleCard key={a.slug} {...a} variant="sidebar" />
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </article>
      </Layout>
    </>
  );
}
