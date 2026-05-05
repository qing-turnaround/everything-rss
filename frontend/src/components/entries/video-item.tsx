import { Entry } from "@/hooks/use-entries";
import { Play } from "lucide-react";

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
      className={`text-left transition-all duration-150 rounded-lg overflow-hidden ${
        selected ? "ring-2 ring-accent" : "hover:ring-1 hover:ring-border"
      }`}
    >
      <div className="aspect-video bg-border/50 relative group">
        {entry.thumbnail ? (
          <img src={entry.thumbnail} alt="" loading="lazy" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted">
            <Play size={28} strokeWidth={1.5} />
          </div>
        )}
        {!entry.isRead && (
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-accent" aria-label="未读" />
        )}
        {entry.thumbnail && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 bg-black/20">
            <div className="w-10 h-10 rounded-full bg-black/60 flex items-center justify-center">
              <Play size={18} className="text-white ml-0.5" fill="white" />
            </div>
          </div>
        )}
      </div>
      <div className="p-2">
        <h3 className="text-sm font-medium line-clamp-2 leading-snug">{entry.title}</h3>
        {feedTitle && <p className="text-xs text-muted mt-1">{feedTitle}</p>}
      </div>
    </button>
  );
}
