"use client";

import { ThreeColumnLayout } from "@/components/layout/three-column";
import { useAppStore } from "@/store/app";
import { useEffect } from "react";
import { useParams } from "next/navigation";
import type { ViewType } from "@/store/app";

export default function ViewPage() {
  const params = useParams();
  const type = params.type as ViewType;
  const setActiveView = useAppStore((s) => s.setActiveView);

  useEffect(() => {
    if (type && ["article", "social", "video"].includes(type)) {
      setActiveView(type);
    }
  }, [type, setActiveView]);

  return (
    <main className="h-screen">
      <ThreeColumnLayout viewType={type} />
    </main>
  );
}
