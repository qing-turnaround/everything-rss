"use client";

import { useCallback, useRef } from "react";

interface ResizablePanelProps {
  width: number;
  minWidth?: number;
  maxWidth?: number;
  onResize: (width: number) => void;
  children: React.ReactNode;
  className?: string;
}

export function ResizablePanel({
  width,
  minWidth = 150,
  maxWidth = 600,
  onResize,
  children,
  className = "",
}: ResizablePanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      dragging.current = true;
      const startX = e.clientX;
      const startWidth = width;

      function onMouseMove(ev: MouseEvent) {
        if (!dragging.current) return;
        const delta = ev.clientX - startX;
        const newWidth = Math.max(minWidth, Math.min(maxWidth, startWidth + delta));
        onResize(newWidth);
      }

      function onMouseUp() {
        dragging.current = false;
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      }

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    },
    [width, minWidth, maxWidth, onResize]
  );

  return (
    <div ref={panelRef} className={`relative flex-shrink-0 ${className}`} style={{ width }}>
      {children}
      <div
        className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-accent/30 transition-colors z-10"
        onMouseDown={onMouseDown}
      />
    </div>
  );
}
