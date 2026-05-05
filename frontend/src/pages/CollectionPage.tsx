import { useParams } from "react-router-dom";
import { ThreeColumnLayout } from "@/components/layout/three-column";

export default function CollectionPage() {
  const { tag } = useParams();
  return (
    <main className="h-screen">
      <ThreeColumnLayout tag={tag} title={tag === "star" ? "收藏" : "稍后读"} />
    </main>
  );
}
