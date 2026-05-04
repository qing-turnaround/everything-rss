"use client";

import { ThreeColumnLayout } from "@/components/layout/three-column";
import { useParams } from "next/navigation";

export default function FeedPage() {
  const params = useParams();
  const feedId = params.feedId as string;

  return (
    <main className="h-screen">
      <ThreeColumnLayout feedId={feedId} />
    </main>
  );
}
