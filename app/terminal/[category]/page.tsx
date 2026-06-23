import { notFound, redirect } from "next/navigation";

import { isMarketCategory } from "@/lib/market-workspaces-data";

export default async function TerminalCategoryAliasPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;

  if (!isMarketCategory(category)) {
    notFound();
  }

  redirect(`/terminal/markets/${category}`);
}
