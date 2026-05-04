"use client";

import { Entry } from "@/hooks/use-entries";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import sanitizeHtml from "sanitize-html";

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

  const cleanHtml = entry.content
    ? sanitizeHtml(entry.content, {
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
    <div className="max-w-3xl mx-auto px-6 py-6">
      <h1 className="text-xl font-bold leading-tight mb-3">{entry.title}</h1>

      <div className="flex items-center gap-3 text-sm text-muted mb-6">
        {feedTitle && <span>{feedTitle}</span>}
        {entry.author && feedTitle && <span>·</span>}
        {entry.author && <span>{entry.author}</span>}
        {publishDate && <span>·</span>}
        {publishDate && <span>{publishDate}</span>}
      </div>

      <article
        className="prose prose-sm max-w-none dark:prose-invert prose-img:rounded-lg prose-a:text-accent"
        dangerouslySetInnerHTML={{ __html: cleanHtml }}
      />

      <div className="flex items-center gap-3 mt-8 pt-4 border-t border-border">
        <button
          onClick={onStar}
          className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
            isStarred ? "bg-yellow-100 text-yellow-700" : "bg-hover-bg text-muted hover:text-foreground"
          }`}
        >
          {isStarred ? "★ 已收藏" : "☆ 收藏"}
        </button>
        <button
          onClick={onReadLater}
          className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
            isReadLater ? "bg-blue-100 text-blue-700" : "bg-hover-bg text-muted hover:text-foreground"
          }`}
        >
          {isReadLater ? "✓ 稍后读" : "📥 稍后读"}
        </button>
        {entry.url && (
          <a
            href={entry.url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 text-sm rounded-md bg-hover-bg text-muted hover:text-foreground transition-colors"
          >
            ↗ 原文
          </a>
        )}
      </div>
    </div>
  );
}
