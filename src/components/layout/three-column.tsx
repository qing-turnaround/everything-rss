"use client";

import { useAppStore } from "@/store/app";
import { useEntries } from "@/hooks/use-entries";
import { Sidebar } from "./sidebar";
import { EntryList } from "./entry-list";
import { ContentPanel } from "./content-panel";
import { ResizablePanel } from "./resizable-panel";

interface ThreeColumnProps {
  feedId?: string | null;
  viewType?: string | null;
  tag?: string | null;
  title?: string;
}

export function ThreeColumnLayout({ feedId, viewType, tag, title }: ThreeColumnProps) {
  const { sidebarWidth, entryListWidth, setSidebarWidth, setEntryListWidth, activeView } = useAppStore();
  const effectiveViewType = viewType || activeView;
  const { entries } = useEntries({ feedId, viewType: tag ? undefined : effectiveViewType, tag });

  return (
    <div className="h-full flex">
      <ResizablePanel width={sidebarWidth} minWidth={180} maxWidth={350} onResize={setSidebarWidth}>
        <Sidebar />
      </ResizablePanel>

      <ResizablePanel
        width={entryListWidth}
        minWidth={250}
        maxWidth={600}
        onResize={setEntryListWidth}
      >
        <EntryList feedId={feedId} viewType={tag ? undefined : effectiveViewType} tag={tag} title={title} />
      </ResizablePanel>

      <div className="flex-1 min-w-0">
        <ContentPanel entries={entries} />
      </div>
    </div>
  );
}
