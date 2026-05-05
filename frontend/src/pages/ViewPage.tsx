import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { useAppStore } from "@/store/app";
import { ThreeColumnLayout } from "@/components/layout/three-column";

export default function ViewPage() {
  const { type } = useParams();
  const setActiveView = useAppStore((s) => s.setActiveView);

  useEffect(() => {
    if (type === "article" || type === "social" || type === "video") {
      setActiveView(type);
    }
  }, [type, setActiveView]);

  return (
    <main className="h-screen">
      <ThreeColumnLayout viewType={type} />
    </main>
  );
}
