"use client";

import { useCallback, useRef, useState } from "react";

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
  const [isDragging, setIsDragging] = useState(false);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      dragging.current = true;
      setIsDragging(true);
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
        setIsDragging(false);
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
        className={`absolute top-0 right-0 w-1 h-full cursor-col-resize transition-colors duration-150 z-10 ${
          isDragging ? "bg-accent" : "bg-transparent hover:bg-accent/40"
        }`}
        onMouseDown={onMouseDown}
        role="separator"
        aria-orientation="vertical"
        aria-label="调整面板宽度"
        tabIndex={0}
      />
    </div>
  );
}
