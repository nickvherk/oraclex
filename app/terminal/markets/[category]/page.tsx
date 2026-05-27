import { notFound } from "next/navigation";

import { FeatureGate } from "@/components/terminal/access-gate";
import { isMarketCategory, marketCategories, marketWorkspaceData } from "@/lib/market-workspaces-data";

import { MarketWorkspaceClient } from "./market-workspace-client";

export function generateStaticParams() {
  return marketCategories.map((category) => ({ category }));
}

export default async function MarketCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;

  if (!isMarketCategory(category)) {
    notFound();
  }

  return (
    <FeatureGate feature="terminal" explanation="Market workspaces are available on Observer preview. Analyst access unlocks full intelligence depth.">
      <MarketWorkspaceClient workspace={marketWorkspaceData[category]} />
    </FeatureGate>
  );
}
