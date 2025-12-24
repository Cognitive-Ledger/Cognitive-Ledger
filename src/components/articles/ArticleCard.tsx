import { Link } from "react-router-dom";
import { Clock } from "lucide-react";

interface ArticleCardProps {
  slug: string;
  category: string;
  headline: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
  imageUrl?: string;
  isBreaking?: boolean;
  variant?: "hero" | "featured" | "compact" | "sidebar";
}

export function ArticleCard({
  slug,
  category,
  headline,
  excerpt,
  author,
  date,
  readTime,
  imageUrl,
  isBreaking = false,
  variant = "featured",
}: ArticleCardProps) {
  if (variant === "hero") {
    return (
      <article className="article-card group">
        <Link to={`/article/${slug}`} className="block">
          {imageUrl && (
            <div className="aspect-[16/9] overflow-hidden mb-6">
              <img
                src={imageUrl}
                alt={headline}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          )}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              {isBreaking && <span className="breaking-badge">Breaking</span>}
              <span className="category-badge">{category}</span>
            </div>
            <h2 className="headline-hero article-headline transition-colors duration-300">
              {headline}
            </h2>
            <p className="body-text text-body-text max-w-3xl">{excerpt}</p>
            <div className="flex items-center gap-4 text-caption text-sm">
              <span>{author}</span>
              <span>·</span>
              <span>{date}</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {readTime}
              </span>
            </div>
          </div>
        </Link>
      </article>
    );
  }

  if (variant === "featured") {
    return (
      <article className="article-card group">
        <Link to={`/article/${slug}`} className="block">
          {imageUrl && (
            <div className="aspect-[3/2] overflow-hidden mb-4">
              <img
                src={imageUrl}
                alt={headline}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          )}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              {isBreaking && <span className="breaking-badge">Breaking</span>}
              <span className="category-badge">{category}</span>
            </div>
            <h3 className="headline-secondary article-headline transition-colors duration-300">
              {headline}
            </h3>
            <p className="text-body-text text-base line-clamp-2">{excerpt}</p>
            <div className="flex items-center gap-3 text-caption text-xs">
              <span>{author}</span>
              <span>·</span>
              <span>{date}</span>
            </div>
          </div>
        </Link>
      </article>
    );
  }

  if (variant === "compact") {
    return (
      <article className="article-card group py-4 border-b border-divider last:border-b-0">
        <Link to={`/article/${slug}`} className="flex gap-4">
          {imageUrl && (
            <div className="w-24 h-24 flex-shrink-0 overflow-hidden">
              <img
                src={imageUrl}
                alt={headline}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex-1 space-y-1">
            <span className="category-badge text-xs">{category}</span>
            <h4 className="headline-tertiary article-headline text-base leading-snug transition-colors duration-300">
              {headline}
            </h4>
            <div className="flex items-center gap-2 text-caption text-xs">
              <span>{date}</span>
            </div>
          </div>
        </Link>
      </article>
    );
  }

  // Sidebar variant
  return (
    <article className="article-card group py-3 border-b border-divider last:border-b-0">
      <Link to={`/article/${slug}`} className="block">
        <span className="category-badge text-xs">{category}</span>
        <h4 className="font-serif text-base font-medium leading-snug mt-1 article-headline transition-colors duration-300">
          {headline}
        </h4>
        <span className="text-caption text-xs mt-1 block">{date}</span>
      </Link>
    </article>
  );
}
