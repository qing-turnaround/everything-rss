"use client";

import { Entry } from "@/hooks/use-entries";

interface VideoViewProps {
  entry: Entry;
  feedTitle?: string;
  onStar: () => void;
  onReadLater: () => void;
  isStarred: boolean;
  isReadLater: boolean;
}

function getEmbedUrl(url: string): string | null {
  const youtubeMatch = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/
  );
  if (youtubeMatch) return `https://www.youtube.com/embed/${youtubeMatch[1]}`;

  const biliMatch = url.match(/bilibili\.com\/video\/(BV[a-zA-Z0-9]+)/);
  if (biliMatch) return `https://player.bilibili.com/player.html?bvid=${biliMatch[1]}`;

  return null;
}

export function VideoView({ entry, feedTitle, onStar, onReadLater, isStarred, isReadLater }: VideoViewProps) {
  const embedUrl = entry.url ? getEmbedUrl(entry.url) : null;
  const directVideo = entry.mediaUrl;

  return (
    <div className="max-w-4xl mx-auto px-6 py-6">
      <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4">
        {embedUrl ? (
          <iframe
            src={embedUrl}
            className="w-full h-full"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        ) : directVideo ? (
          <video src={directVideo} controls className="w-full h-full" poster={entry.thumbnail || undefined} />
        ) : entry.thumbnail ? (
          <a href={entry.url || "#"} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
            <img src={entry.thumbnail} alt="" className="w-full h-full object-cover" />
          </a>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted">
            <a href={entry.url || "#"} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
              在新标签页中打开
            </a>
          </div>
        )}
      </div>

      <h1 className="text-lg font-bold mb-2">{entry.title}</h1>
      <div className="text-sm text-muted mb-4">
        {feedTitle && <span>{feedTitle}</span>}
        {entry.author && <span> · {entry.author}</span>}
      </div>

      {entry.summary && <p className="text-sm text-muted mb-4">{entry.summary}</p>}

      <div className="flex items-center gap-3 pt-4 border-t border-border">
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
