import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { AIImpactPanel } from "@/components/articles/AIImpactPanel";
import { ReadingModeToggle } from "@/components/articles/ReadingModeToggle";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { EmbedRenderer, SingleEmbed, parseContentWithEmbeds, getUnplacedEmbeds, type Embed } from "@/components/articles/EmbedRenderer";
import { useArticle, useArticles } from "@/hooks/useArticles";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { Clock, ArrowLeft, Share2, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";
import { Skeleton } from "@/components/ui/skeleton";

// Component to render article content with inline embeds
function ArticleContent({ content, embeds }: { content: string; embeds: Embed[] }) {
  const parts = parseContentWithEmbeds(content, embeds);
  
  return (
    <>
      {parts.map((part, partIndex) => {
        if (part.type === "embed") {
          return <SingleEmbed key={`embed-${partIndex}`} embed={part.embed} />;
        }
        
        // Render HTML content from rich text editor
        return (
          <div 
            key={`text-${partIndex}`}
            className="article-content"
            dangerouslySetInnerHTML={{ __html: part.content }} 
          />
        );
      })}
    </>
  );
}

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const [readingMode, setReadingMode] = useState<"standard" | "simple" | "technical">("standard");

  const { data: article, isLoading } = useArticle(slug ?? "");
  const { data: allArticles } = useArticles();

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-8">
          <Skeleton className="h-8 w-32 mb-8" />
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          <Skeleton className="h-96 w-full" />
        </div>
      </Layout>
    );
  }

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

  const relatedArticles = allArticles
    ?.filter((a) => a.slug !== slug && a.category === article.category)
    .slice(0, 3) ?? [];

  const transformArticle = (a: typeof article) => ({
    slug: a!.slug,
    headline: a!.title,
    excerpt: a!.excerpt,
    category: a!.category.charAt(0).toUpperCase() + a!.category.slice(1),
    author: a!.author,
    date: new Date(a!.published_at).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
    readTime: `${a!.reading_time} min read`,
    imageUrl: a!.image_url ?? undefined,
    isBreaking: a!.is_breaking,
    isFeatured: a!.is_featured,
    businessImpact: (a!.business_impact as "low" | "medium" | "high") ?? "medium",
    technicalImpact: (a!.technical_impact as "low" | "medium" | "high") ?? "medium",
    ethicalRisk: (a!.ethical_risk as "low" | "medium" | "high") ?? "low",
  });

  const content = readingMode === "simple" 
    ? (article.simple_content || article.content) 
    : readingMode === "technical"
    ? (article.technical_content || article.content)
    : article.content;

  return (
    <>
      <Helmet>
        <title>{article.title} — Cognitive Ledger</title>
        <meta name="description" content={article.excerpt} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.excerpt} />
        <meta property="og:type" content="article" />
        {article.image_url && <meta property="og:image" content={article.image_url} />}
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
              {article.is_breaking && <span className="breaking-badge">Breaking</span>}
              <span className="category-badge">
                {article.category.charAt(0).toUpperCase() + article.category.slice(1)}
              </span>
            </div>

            <h1 className="headline-hero mb-6">{article.title}</h1>

            <p className="text-xl text-body-text leading-relaxed mb-6">
              {article.excerpt}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-sm text-caption border-y border-divider py-4">
              <span className="font-medium text-foreground">{article.author}</span>
              <span>·</span>
              <span>
                {new Date(article.published_at).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {article.reading_time} min read
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

          {/* Video Player for video articles */}
          {article.category === "video" && article.video_url && (
            <figure className="max-w-4xl mb-8">
              <div className="aspect-video rounded-lg overflow-hidden bg-black">
                <VideoPlayer
                  src={article.video_url}
                  title={article.title}
                  poster={article.image_url || undefined}
                  textTracks={
                    article.embeds && Array.isArray(article.embeds)
                      ? (() => {
                          const captionEmbed = (article.embeds as unknown[]).find(
                            (e: unknown) => typeof e === 'object' && e !== null && (e as Record<string, unknown>).type === 'captions'
                          );
                          if (captionEmbed && typeof captionEmbed === 'object') {
                            const tracks = (captionEmbed as Record<string, unknown>).tracks;
                            if (Array.isArray(tracks)) {
                              return tracks.map((t: unknown) => ({
                                src: (t as Record<string, string>).src,
                                label: (t as Record<string, string>).label,
                                language: (t as Record<string, string>).language || 'en',
                                kind: 'subtitles' as const,
                              }));
                            }
                          }
                          return [];
                        })()
                      : []
                  }
                />
              </div>
            </figure>
          )}

          {/* Article Image (for non-video articles) */}
          {article.category !== "video" && article.image_url && (
            <figure className="max-w-4xl mb-8">
              <img
                src={article.image_url}
                alt={article.title}
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
              {(article.simple_content || article.technical_content) && (
                <div className="mb-8">
                  <ReadingModeToggle mode={readingMode} onModeChange={setReadingMode} />
                </div>
              )}

              {/* Article Content with Inline Embeds */}
              <div className="prose prose-lg max-w-none">
                <ArticleContent 
                  content={content} 
                  embeds={(article.embeds as unknown as Embed[]) || []} 
                />
              </div>

              {/* Unplaced Embeds (embeds not referenced in content) */}
              {article.embeds && (article.embeds as unknown as Embed[]).length > 0 && (
                <div className="mt-8">
                  <EmbedRenderer embeds={getUnplacedEmbeds(content, article.embeds as unknown as Embed[])} />
                </div>
              )}

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
                businessImpact={(article.business_impact as "low" | "medium" | "high") ?? "medium"}
                technicalImpact={(article.technical_impact as "low" | "medium" | "high") ?? "medium"}
                ethicalRisk={(article.ethical_risk as "low" | "medium" | "high") ?? "low"}
              />

              {/* Related Articles */}
              {relatedArticles.length > 0 && (
                <div className="border border-divider p-5">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-caption mb-4">
                    Related Coverage
                  </h4>
                  <div className="space-y-4">
                    {relatedArticles.map((a) => (
                      <ArticleCard key={a.slug} {...transformArticle(a)} variant="sidebar" />
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
