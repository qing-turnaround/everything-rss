import { useParams } from "react-router-dom";
import { ThreeColumnLayout } from "@/components/layout/three-column";

export default function FeedPage() {
  const { feedId } = useParams();
  return (
    <main className="h-screen">
      <ThreeColumnLayout feedId={feedId} />
    </main>
  );
}
