import { Entry } from "@/hooks/use-entries";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import sanitizeHtml from "sanitize-html";

interface SocialItemProps {
  entry: Entry;
  selected: boolean;
  feedTitle?: string;
  onClick: () => void;
}

export function SocialItem({ entry, selected, feedTitle, onClick }: SocialItemProps) {
  const timeAgo = entry.publishedAt
    ? formatDistanceToNow(new Date(entry.publishedAt * 1000), { addSuffix: true, locale: zhCN })
    : "";

  const cleanContent = entry.content
    ? sanitizeHtml(entry.content, {
        allowedTags: [],
        allowedAttributes: {},
      }).slice(0, 500)
    : entry.summary || "";

  const displayName = feedTitle || entry.author || "Unknown";

  return (
    <button
      onClick={onClick}
      className={`w-full px-4 py-4 text-left transition-colors duration-100 border-b border-border ${
        selected ? "bg-selected-bg" : "hover:bg-hover-bg active:bg-selected-bg/50"
      }`}
    >
      <div className="flex items-center gap-2.5 mb-2">
        <span className="w-6 h-6 rounded-full bg-accent/15 flex items-center justify-center text-[11px] font-medium text-accent flex-shrink-0">
          {displayName[0]}
        </span>
        <span className="text-sm font-medium truncate">{displayName}</span>
        <span className="text-xs text-muted flex-shrink-0">{timeAgo}</span>
        {!entry.isRead && (
          <span className="w-2 h-2 rounded-full bg-accent flex-shrink-0" aria-label="未读" />
        )}
      </div>
      <p className="text-sm leading-relaxed text-foreground/90">{cleanContent}</p>
      {entry.thumbnail && (
        <img
          src={entry.thumbnail}
          alt=""
          loading="lazy"
          className="mt-3 rounded-lg max-h-48 object-cover w-full"
        />
      )}
    </button>
  );
}
