import { Entry } from "@/hooks/use-entries";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";

interface ArticleItemProps {
  entry: Entry;
  selected: boolean;
  feedTitle?: string;
  onClick: () => void;
}

export function ArticleItem({ entry, selected, feedTitle, onClick }: ArticleItemProps) {
  const timeAgo = entry.publishedAt
    ? formatDistanceToNow(new Date(entry.publishedAt * 1000), { addSuffix: true, locale: zhCN })
    : "";

  return (
    <button
      onClick={onClick}
      className={`w-full px-4 py-3 text-left transition-colors duration-100 border-b border-border ${
        selected ? "bg-selected-bg" : "hover:bg-hover-bg active:bg-selected-bg/50"
      }`}
    >
      <div className="flex items-start gap-2.5">
        <span
          className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 transition-colors duration-200 ${
            entry.isRead ? "bg-transparent" : "bg-accent"
          }`}
          aria-hidden="true"
        />
        <div className="flex-1 min-w-0">
          <h3 className={`text-sm leading-snug line-clamp-2 ${entry.isRead ? "text-muted" : "font-medium"}`}>
            {entry.title}
          </h3>
          {entry.summary && (
            <p className="text-xs text-muted/80 mt-1 line-clamp-2 leading-relaxed">{entry.summary}</p>
          )}
          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-muted">
            {feedTitle && <span className="truncate max-w-[120px]">{feedTitle}</span>}
            {feedTitle && timeAgo && <span aria-hidden="true">·</span>}
            {timeAgo && <span className="flex-shrink-0">{timeAgo}</span>}
          </div>
        </div>
        {entry.thumbnail && (
          <img
            src={entry.thumbnail}
            alt=""
            loading="lazy"
            className="w-16 h-12 object-cover rounded-md flex-shrink-0"
          />
        )}
      </div>
    </button>
  );
}
