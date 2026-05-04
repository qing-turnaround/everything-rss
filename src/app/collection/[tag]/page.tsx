"use client";

import { ThreeColumnLayout } from "@/components/layout/three-column";
import { useParams } from "next/navigation";

export default function CollectionPage() {
  const params = useParams();
  const tag = params.tag as string;

  return (
    <main className="h-screen">
      <ThreeColumnLayout tag={tag} title={tag === "star" ? "收藏" : "稍后读"} />
    </main>
  );
}
