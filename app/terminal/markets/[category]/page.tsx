import { Suspense } from "react";
import { notFound } from "next/navigation";

import { FeatureGate } from "@/components/terminal/access-gate";
import { getLiveMarketWorkspace } from "@/lib/market-workspaces-live";
import { isMarketCategory, marketCategories, marketWorkspaceData, type MarketCategory } from "@/lib/market-workspaces-data";

import { MarketWorkspaceClient } from "./market-workspace-client";

export const revalidate = 900;

export function generateStaticParams() {
  return marketCategories.map((category) => ({ category }));
}

export default async function MarketCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;

  if (!isMarketCategory(category)) {
    notFound();
  }

  const baseline = marketWorkspaceData[category];

  return (
    <FeatureGate feature="terminal" explanation="Market workspaces are available on Observer preview. Analyst access unlocks full intelligence depth.">
      <Suspense fallback={<MarketWorkspaceClient workspace={baseline} loadingLive />}>
        <LiveMarketWorkspace category={category} />
      </Suspense>
    </FeatureGate>
  );
}

async function LiveMarketWorkspace({ category }: { category: MarketCategory }) {
  const workspace = await getLiveMarketWorkspace(category);
  return <MarketWorkspaceClient workspace={workspace} />;
}
