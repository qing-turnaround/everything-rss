"use client";

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

  return (
    <button
      onClick={onClick}
      className={`w-full px-4 py-4 text-left transition-colors border-b border-border ${
        selected ? "bg-selected-bg" : "hover:bg-hover-bg"
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-medium">{feedTitle || entry.author}</span>
        <span className="text-xs text-muted">{timeAgo}</span>
        {!entry.isRead && <span className="w-2 h-2 rounded-full bg-accent" />}
      </div>
      <p className="text-sm leading-relaxed">{cleanContent}</p>
      {entry.thumbnail && (
        <img src={entry.thumbnail} alt="" className="mt-2 rounded-lg max-h-48 object-cover" />
      )}
    </button>
  );
}
