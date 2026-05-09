import { Entry } from "@/hooks/use-entries";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import sanitizeHtml from "sanitize-html";
import { Star, Bookmark, ExternalLink } from "lucide-react";

interface ArticleViewProps {
  entry: Entry;
  feedTitle?: string;
  onStar: () => void;
  onReadLater: () => void;
  isStarred: boolean;
  isReadLater: boolean;
}

export function ArticleView({ entry, feedTitle, onStar, onReadLater, isStarred, isReadLater }: ArticleViewProps) {
  const publishDate = entry.publishedAt
    ? format(new Date(entry.publishedAt * 1000), "yyyy-MM-dd HH:mm", { locale: zhCN })
    : "";

  const rawHtml = entry.content || entry.summary || "";
  const cleanHtml = rawHtml
    ? sanitizeHtml(rawHtml, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "video", "source", "iframe", "figure", "figcaption", "pre", "code"]),
        allowedAttributes: {
          ...sanitizeHtml.defaults.allowedAttributes,
          img: ["src", "alt", "width", "height", "loading"],
          video: ["src", "controls", "poster", "width", "height"],
          source: ["src", "type"],
          iframe: ["src", "width", "height", "allowfullscreen", "frameborder"],
          code: ["class"],
          pre: ["class"],
        },
        allowedIframeHostnames: ["www.youtube.com", "youtube.com", "player.bilibili.com", "www.bilibili.com"],
      })
    : "";

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <h1 className="text-xl font-bold leading-tight mb-3">{entry.title}</h1>

      <div className="flex items-center gap-2 text-sm text-muted mb-8">
        {feedTitle && <span>{feedTitle}</span>}
        {entry.author && feedTitle && <span aria-hidden="true">·</span>}
        {entry.author && <span>{entry.author}</span>}
        {publishDate && <span aria-hidden="true">·</span>}
        {publishDate && <time>{publishDate}</time>}
      </div>

      <article
        className="prose prose-sm max-w-none dark:prose-invert prose-img:rounded-lg prose-a:text-accent"
        dangerouslySetInnerHTML={{ __html: cleanHtml }}
      />

      <div className="flex items-center gap-2 mt-10 pt-4 border-t border-border">
        <ActionButton
          onClick={onStar}
          active={isStarred}
          activeClass="bg-warning-soft text-warning"
          icon={<Star size={14} fill={isStarred ? "currentColor" : "none"} />}
          label={isStarred ? "已收藏" : "收藏"}
        />
        <ActionButton
          onClick={onReadLater}
          active={isReadLater}
          activeClass="bg-accent-soft text-accent"
          icon={<Bookmark size={14} fill={isReadLater ? "currentColor" : "none"} />}
          label={isReadLater ? "已标记" : "稍后读"}
        />
        {entry.url && (
          <a
            href={entry.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md bg-hover-bg text-muted hover:text-foreground transition-colors"
          >
            <ExternalLink size={14} />
            原文
          </a>
        )}
      </div>
    </div>
  );
}

function ActionButton({
  onClick,
  active,
  activeClass,
  icon,
  label,
}: {
  onClick: () => void;
  active: boolean;
  activeClass: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-all duration-150 ${
        active ? activeClass : "bg-hover-bg text-muted hover:text-foreground"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
