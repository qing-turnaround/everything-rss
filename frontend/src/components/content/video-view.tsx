import { Entry } from "@/hooks/use-entries";
import { Star, Bookmark, ExternalLink } from "lucide-react";

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
      <div className="aspect-video bg-black rounded-lg overflow-hidden mb-5">
        {embedUrl ? (
          <iframe
            src={embedUrl}
            className="w-full h-full"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            title={entry.title || undefined}
          />
        ) : directVideo ? (
          <video src={directVideo} controls className="w-full h-full" poster={entry.thumbnail || undefined} />
        ) : entry.thumbnail ? (
          <a href={entry.url || "#"} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
            <img src={entry.thumbnail} alt={entry.title || ""} className="w-full h-full object-cover" />
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

      {entry.summary && <p className="text-sm text-muted/80 leading-relaxed mb-5">{entry.summary}</p>}

      <div className="flex items-center gap-2 pt-4 border-t border-border">
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
