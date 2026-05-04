"use client";

import { Entry } from "@/hooks/use-entries";

interface VideoItemProps {
  entry: Entry;
  selected: boolean;
  feedTitle?: string;
  onClick: () => void;
}

export function VideoItem({ entry, selected, feedTitle, onClick }: VideoItemProps) {
  return (
    <button
      onClick={onClick}
      className={`text-left transition-colors rounded-lg overflow-hidden ${
        selected ? "ring-2 ring-accent" : "hover:ring-1 hover:ring-border"
      }`}
    >
      <div className="aspect-video bg-border relative">
        {entry.thumbnail ? (
          <img src={entry.thumbnail} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted text-2xl">
            🎬
          </div>
        )}
        {!entry.isRead && (
          <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-accent" />
        )}
      </div>
      <div className="p-2">
        <h3 className="text-sm font-medium line-clamp-2 leading-snug">{entry.title}</h3>
        {feedTitle && <p className="text-xs text-muted mt-1">{feedTitle}</p>}
      </div>
    </button>
  );
}
