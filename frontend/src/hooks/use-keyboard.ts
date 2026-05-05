import { useEffect } from "react";

interface KeyboardActions {
  onNext?: () => void;
  onPrev?: () => void;
  onStar?: () => void;
  onMarkRead?: () => void;
  onOpenOriginal?: () => void;
}

export function useKeyboard(actions: KeyboardActions) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key) {
        case "j":
          e.preventDefault();
          actions.onNext?.();
          break;
        case "k":
          e.preventDefault();
          actions.onPrev?.();
          break;
        case "s":
          e.preventDefault();
          actions.onStar?.();
          break;
        case "m":
          e.preventDefault();
          actions.onMarkRead?.();
          break;
        case "v":
          e.preventDefault();
          actions.onOpenOriginal?.();
          break;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [actions]);
}
