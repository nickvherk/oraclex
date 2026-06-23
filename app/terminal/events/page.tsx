"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, BarChart3, CalendarClock, CheckCircle2, CircleDot, Clock, ExternalLink, Globe2, Landmark, RadioTower, Wallet, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { FeatureGate } from "@/components/terminal/access-gate";
import { Panel, PanelHeader, SeverityBadge } from "@/components/terminal/terminal-shell";
import { Badge } from "@/components/ui/badge";
import { CardContent } from "@/components/ui/card";
import { marketEventsRefreshLabel, getUpcomingMarketEvents } from "@/lib/market-events-data";
import { MARKET_EVENT_REFRESH_INTERVAL_MS } from "@/lib/integrations/market-events";
import type { LiveCatalystsPayload } from "@/lib/integrations/market-news";

const marketImpact = [
  { market: "SOL ETF approved in 2026", catalyst: "SEC review window / issuer amendments", probability: "+6.4 pts divergence", risk: "High" },
  { market: "Fed cuts rates at next meeting", catalyst: "NFP / CPI / FOMC / Treasury volatility", probability: "Compression risk", risk: "Critical" },
  { market: "BTC breaks ATH this quarter", catalyst: "CPI / Treasury volatility / risk appetite", probability: "Volatility expansion", risk: "High" },
  { market: "AI regulation bill passes in 2026", catalyst: "Nvidia earnings / compute policy narratives", probability: "Attention +38%", risk: "Medium" },
];

function importanceTone(importance: string) {
  if (importance === "Critical") return "critical";
  if (importance === "High") return "high";
  if (importance === "Medium") return "medium";
  return "low";
}

const unavailablePayload: LiveCatalystsPayload = {
  status: "unavailable",
  label: "Live news unavailable",
  refreshedAt: new Date(0).toISOString(),
  nextRefreshAt: new Date(0).toISOString(),
  catalysts: [],
  errors: [],
};

export default function EventsPage() {
  return (
    <FeatureGate feature="marketEvents" explanation="Market Events are available from Observer access and above.">
      <MarketEventsWorkspace />
    </FeatureGate>
  );
}

function MarketEventsWorkspace() {
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null);
  const [eventsRefreshedAt, setEventsRefreshedAt] = useState(() => new Date());
  const [clockNow, setClockNow] = useState(() => new Date());
  const [livePayload, setLivePayload] = useState<LiveCatalystsPayload | null>(null);
  const [isLoadingCatalysts, setIsLoadingCatalysts] = useState(true);
  const upcomingEvents = useMemo(() => getUpcomingMarketEvents(eventsRefreshedAt), [eventsRefreshedAt]);
  const liveCatalysts = livePayload?.catalysts ?? [];
  const selected = liveCatalysts.find((event) => event.title === selectedTitle) ?? liveCatalysts[0] ?? null;
  const catalystAction = getCatalystAction(livePayload, clockNow, isLoadingCatalysts);
  const detailSections: Array<[string, string[], LucideIcon]> = selected
    ? [
        ["Affected Markets", selected.affectedMarkets, Landmark],
        ["Related Narrative Intelligence", selected.narratives, Globe2],
      ]
    : [];

  useEffect(() => {
    const interval = window.setInterval(() => setEventsRefreshedAt(new Date()), MARKET_EVENT_REFRESH_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => setClockNow(new Date()), 60 * 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function fetchCatalysts() {
      try {
        setIsLoadingCatalysts(true);
        const response = await fetch("/api/market-events/live-catalysts", { cache: "no-store" });
        const payload = (await response.json()) as LiveCatalystsPayload;
        if (!cancelled) {
          setLivePayload(payload);
          setClockNow(new Date());
        }
      } catch {
        if (!cancelled) setLivePayload(unavailablePayload);
      } finally {
        if (!cancelled) setIsLoadingCatalysts(false);
      }
    }

    fetchCatalysts();
    const interval = window.setInterval(fetchCatalysts, MARKET_EVENT_REFRESH_INTERVAL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!liveCatalysts.length) {
      setSelectedTitle(null);
      return;
    }
    if (!selectedTitle || !liveCatalysts.some((event) => event.title === selectedTitle)) {
      setSelectedTitle(liveCatalysts[0].title);
    }
  }, [liveCatalysts, selectedTitle]);

  return (
    <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_390px]">
      <div className="grid min-w-0 gap-4">
        <section className="rounded-xl border border-blue-300/15 bg-blue-300/[0.045] p-4">
          <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-blue-100">Market Events Terminal</div>
          <h1 className="text-2xl font-semibold tracking-[-0.03em] text-white">Catalysts most likely to move prediction market probabilities.</h1>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-400">Tracks crypto catalysts, macro catalysts, geopolitical events, and scheduled economic events through an OracleX impact lens.</p>
        </section>

        <Panel>
          <PanelHeader title="Upcoming Events" action={`${marketEventsRefreshLabel} / as of ${eventsRefreshedAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`} />
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full min-w-[1180px] border-separate border-spacing-0 text-left text-xs">
              <thead>
                <tr className="border-b border-white/[0.075] text-slate-500">
                  {["Event", "Date", "Time", "Region", "Importance", "Affected Markets", "Why It Matters"].map((header) => (
                    <th key={header} className="border-b border-white/[0.075] px-4 py-3 font-mono text-[10px] uppercase tracking-[0.14em]">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {upcomingEvents.map((event) => (
                  <tr key={event.event} className="transition hover:bg-blue-300/[0.035]">
                    <td className="border-b border-white/[0.055] px-4 py-3">
                      <div className="flex items-center gap-2 font-semibold text-white">
                        <CalendarClock className="size-4 text-blue-200" />
                        {event.event}
                      </div>
                      <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-600">{event.type}</div>
                      <a href={event.sourceUrl} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.12em] text-slate-500 transition hover:text-blue-100">
                        {event.source}
                        <ExternalLink className="size-3" />
                      </a>
                    </td>
                    <td className="border-b border-white/[0.055] px-4 py-3 font-mono text-slate-300">{event.date}</td>
                    <td className="border-b border-white/[0.055] px-4 py-3 font-mono text-slate-300">{event.time}</td>
                    <td className="border-b border-white/[0.055] px-4 py-3 font-mono text-slate-300">{event.region}</td>
                    <td className="border-b border-white/[0.055] px-4 py-3"><SeverityBadge severity={importanceTone(event.importance)} /></td>
                    <td className="border-b border-white/[0.055] px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {event.affected.map((market) => (
                          <span key={market} className="rounded-md border border-white/[0.07] bg-white/[0.025] px-2 py-1 text-[11px] text-slate-300">{market}</span>
                        ))}
                      </div>
                    </td>
                    <td className="max-w-[320px] border-b border-white/[0.055] px-4 py-3 leading-5 text-slate-400">{event.why}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Panel>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <Panel>
            <PanelHeader title="Live Catalysts" action={catalystAction} />
            <CardContent className="space-y-2 p-4">
              {liveCatalysts.length ? liveCatalysts.map((event) => {
                const active = event.title === selected?.title;
                return (
                  <button key={event.title} type="button" onClick={() => setSelectedTitle(event.title)} className={`w-full rounded-xl border p-3 text-left transition ${active ? "border-blue-300/35 bg-blue-300/[0.08]" : "border-white/[0.065] bg-white/[0.025] hover:border-blue-300/20 hover:bg-blue-300/[0.035]"}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="text-sm font-semibold text-white">{event.title}</div>
                          <span className="rounded-md border border-white/[0.07] bg-white/[0.025] px-2 py-1 font-mono text-[9px] uppercase tracking-[0.1em] text-slate-500">{event.category}</span>
                        </div>
                        <div className="mt-2 grid gap-1.5 font-mono text-[9px] uppercase tracking-[0.12em] text-slate-600 sm:grid-cols-2">
                          <span>Last update: <span className="text-slate-400">{event.lastUpdate}</span></span>
                          <span>Source: <span className="text-slate-400">{event.source}</span></span>
                        </div>
                        <p className="mt-2 text-xs leading-5 text-slate-300">{event.summary ?? event.latestDevelopment}</p>
                        <p className="mt-1 text-xs leading-5 text-slate-500">{event.oracleXAssessment}</p>
                        <a href={event.sourceUrl} target="_blank" rel="noreferrer" onClick={(clickEvent) => clickEvent.stopPropagation()} className="mt-3 inline-flex items-center gap-1 rounded-md border border-blue-300/15 bg-blue-300/[0.055] px-2 py-1 font-mono text-[9px] uppercase tracking-[0.1em] text-blue-100 transition hover:border-blue-300/35">
                          View source
                          <ExternalLink className="size-3" />
                        </a>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {event.affectedMarkets.map((market) => (
                            <span key={market} className="rounded-md border border-blue-300/12 bg-blue-300/[0.035] px-2 py-1 text-[11px] text-blue-100">{market}</span>
                          ))}
                        </div>
                      </div>
                      <SeverityBadge severity={importanceTone(event.importance)} />
                    </div>
                  </button>
                );
              }) : <LiveNewsUnavailable loading={isLoadingCatalysts} errors={livePayload?.errors ?? []} />}
            </CardContent>
          </Panel>

          <Panel>
            <PanelHeader title="OracleX Impact Analysis" action={selected?.title ?? "Live news unavailable"} />
            <CardContent className="space-y-3 p-4">
              {selected ? (
                <>
              <div className="rounded-xl border border-blue-300/12 bg-blue-300/[0.035] p-4">
                <div className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-blue-100">
                  <Zap className="size-4" />
                  Why it matters
                </div>
                <p className="text-xs leading-6 text-slate-300">{selected.why}</p>
              </div>
              <div className="grid gap-2 md:grid-cols-3">
                {[
                  ["Latest Development", selected.latestDevelopment],
                  ["Source", selected.source],
                  ["Affected Markets", selected.affectedMarkets.join(", ")],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-white/[0.065] bg-white/[0.025] p-3">
                    <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-slate-600">{label}</div>
                    <div className="mt-2 text-xs leading-5 text-slate-300">{value}</div>
                  </div>
                ))}
              </div>
              <div className="rounded-xl border border-white/[0.065] bg-white/[0.025] p-3">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-slate-500">Latest developments</div>
                  <a href={selected.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-md border border-blue-300/15 bg-blue-300/[0.055] px-2 py-1 font-mono text-[9px] uppercase tracking-[0.1em] text-blue-100 transition hover:border-blue-300/35">
                    View Source
                    <ExternalLink className="size-3" />
                  </a>
                </div>
                <div className="space-y-2">
                  {selected.timeline.map((item) => (
                    <div key={`${item.time}-${item.headline}`} className="grid gap-2 rounded-lg bg-white/[0.035] px-3 py-2 text-xs text-slate-300 sm:grid-cols-[58px_minmax(0,1fr)_auto]">
                      <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-blue-100">{item.time}</div>
                      <div>
                        <div className="leading-5">{item.headline}</div>
                        {item.timestamp ? <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.1em] text-slate-600">{formatCatalystTimestamp(item.timestamp)}</div> : null}
                      </div>
                      <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.1em] text-slate-500 transition hover:text-blue-100">
                        {item.source}
                        <ExternalLink className="size-3" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-white/[0.065] bg-white/[0.025] p-3">
                  <div className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-500">
                    <HistoryIcon />
                    Historical impact
                  </div>
                  <div className="space-y-2">
                    {selected.historicalImpact.map((item) => (
                      <div key={item} className="flex items-start gap-2 text-xs text-slate-300">
                        <CircleDot className="mt-0.5 size-3 text-blue-200" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl border border-white/[0.065] bg-white/[0.025] p-3">
                  <div className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-500">
                    <Activity className="size-4" />
                    Most likely reactions
                  </div>
                  <div className="space-y-2">
                    {selected.reactions.map((item) => (
                      <div key={item} className="flex items-start gap-2 text-xs text-slate-300">
                        <CheckCircle2 className="mt-0.5 size-3 text-emerald-200" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
                </>
              ) : <LiveNewsUnavailable loading={isLoadingCatalysts} errors={livePayload?.errors ?? []} />}
            </CardContent>
          </Panel>
        </div>

        <Panel>
          <PanelHeader title="Markets Impacted" action="Prediction markets most likely impacted" />
          <CardContent className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-4">
            {marketImpact.map((item) => (
              <div key={item.market} className="rounded-xl border border-white/[0.065] bg-white/[0.025] p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <BarChart3 className="size-4 text-blue-200" />
                  <SeverityBadge severity={importanceTone(item.risk)} />
                </div>
                <div className="text-sm font-semibold text-white">{item.market}</div>
                <div className="mt-2 text-xs leading-5 text-slate-400">{item.catalyst}</div>
                <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-blue-100">{item.probability}</div>
              </div>
            ))}
          </CardContent>
        </Panel>
      </div>

      <aside className="grid gap-4 2xl:sticky 2xl:top-5 2xl:self-start">
        {selected ? (
          <>
        <Panel>
          <PanelHeader title="Selected Event" action={selected.importance} />
          <CardContent className="p-4">
            <div className="mb-4">
              <Badge className="mb-3 h-6 rounded-lg border border-blue-300/15 bg-blue-300/[0.07] font-mono text-[10px] text-blue-100">{selected.importance}</Badge>
              <h2 className="text-xl font-semibold leading-tight tracking-[-0.03em] text-white">{selected.title}</h2>
              <div className="mt-3 grid gap-2 rounded-xl border border-white/[0.065] bg-white/[0.025] p-3 font-mono text-[9px] uppercase tracking-[0.12em] text-slate-600">
                <div className="flex items-center justify-between gap-3">
                  <span>Category</span>
                  <span className="text-slate-300">{selected.category}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Last update</span>
                  <span className="text-slate-300">{selected.lastUpdate}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Source</span>
                  <a href={selected.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-right text-slate-300 transition hover:text-blue-100">
                    {selected.source}
                    <ExternalLink className="size-3" />
                  </a>
                </div>
              </div>
              <div className="mt-3 rounded-xl border border-white/[0.065] bg-white/[0.025] p-3">
                <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-500">Latest development</div>
                <p className="text-xs leading-6 text-slate-300">{selected.latestDevelopment}</p>
              </div>
              <div className="mt-3 rounded-xl border border-white/[0.065] bg-white/[0.025] p-3">
                <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-500">Why it matters</div>
                <p className="text-xs leading-6 text-slate-300">{selected.why}</p>
              </div>
            </div>
            <div className="rounded-xl border border-blue-300/15 bg-blue-300/[0.045] p-4">
              <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-blue-100">OracleX assessment</div>
              <p className="text-xs leading-6 text-slate-300">{selected.oracleXAssessment}</p>
            </div>
          </CardContent>
        </Panel>

        <Panel>
          <PanelHeader title="Latest Developments" action="Source linked" />
          <CardContent className="space-y-2 p-4">
            {selected.timeline.map((item) => (
              <div key={`${item.time}-${item.source}`} className="rounded-lg bg-white/[0.035] px-3 py-2">
                <div className="mb-1 flex items-center justify-between gap-3">
                  <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-blue-100">{item.time}</span>
                  <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.1em] text-slate-500 transition hover:text-blue-100">
                    {item.source}
                    <ExternalLink className="size-3" />
                  </a>
                </div>
                <div className="text-xs leading-5 text-slate-300">{item.headline}</div>
                {item.timestamp ? <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.1em] text-slate-600">{formatCatalystTimestamp(item.timestamp)}</div> : null}
              </div>
            ))}
          </CardContent>
        </Panel>

        {detailSections.map(([title, items, Icon]) => (
          <Panel key={title}>
            <PanelHeader title={title} />
            <CardContent className="space-y-2 p-4">
              {items.map((item) => (
                <div key={item} className="flex items-center gap-2 rounded-lg bg-white/[0.035] px-3 py-2 text-xs text-slate-300">
                  <Icon className="size-3.5 text-blue-200" />
                  {item}
                </div>
              ))}
            </CardContent>
          </Panel>
        ))}

        <Panel>
          <PanelHeader title="Historical Impact" />
          <CardContent className="space-y-2 p-4">
            {selected.historicalImpact.map((item) => (
              <div key={item} className="flex items-start gap-2 rounded-lg bg-white/[0.035] px-3 py-2 text-xs leading-5 text-slate-300">
                <CircleDot className="mt-1 size-3 text-blue-200" />
                {item}
              </div>
            ))}
          </CardContent>
        </Panel>

        <Panel>
          <PanelHeader title="Related Flows" />
          <CardContent className="p-4">
            <div className="flex items-start gap-2 rounded-lg bg-white/[0.035] px-3 py-2 text-xs leading-5 text-slate-300">
              <RadioTower className="mt-0.5 size-3.5 text-blue-200" />
              {selected.flows}
            </div>
          </CardContent>
        </Panel>

        <Panel>
          <PanelHeader title="Smart Money Reaction" />
          <CardContent className="p-4">
            <div className="flex items-start gap-2 rounded-lg bg-white/[0.035] px-3 py-2 text-xs leading-5 text-slate-300">
              <Wallet className="mt-0.5 size-3.5 text-blue-200" />
              {selected.smartMoney}
            </div>
          </CardContent>
        </Panel>

        <Panel>
          <PanelHeader title="What To Watch Next" />
          <CardContent className="space-y-2 p-4">
            {selected.watchNext.map((item) => (
              <div key={item} className="flex items-center gap-2 rounded-lg bg-white/[0.035] px-3 py-2 text-xs text-slate-300">
                <CheckCircle2 className="size-3.5 text-emerald-200" />
                {item}
              </div>
            ))}
          </CardContent>
        </Panel>
          </>
        ) : (
          <Panel>
            <PanelHeader title="Selected Event" action="Live news unavailable" />
            <CardContent className="p-4">
              <LiveNewsUnavailable loading={isLoadingCatalysts} errors={livePayload?.errors ?? []} />
            </CardContent>
          </Panel>
        )}
      </aside>
    </div>
  );
}

function HistoryIcon() {
  return <Clock className="size-4" />;
}

function LiveNewsUnavailable({ loading, errors }: { loading: boolean; errors: string[] }) {
  return (
    <div className="rounded-xl border border-amber-300/15 bg-amber-300/[0.045] p-4">
      <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-amber-100">{loading ? "Loading live news" : "Live news unavailable"}</div>
      <p className="mt-2 text-xs leading-6 text-slate-300">
        {loading ? "Fetching current source-backed catalysts." : "Current catalyst news could not be loaded. No stale hardcoded developments are being shown as live."}
      </p>
      {errors.length ? (
        <div className="mt-3 space-y-1">
          {errors.slice(0, 2).map((error) => (
            <div key={error} className="font-mono text-[10px] leading-5 text-slate-500">{error}</div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function getCatalystAction(payload: LiveCatalystsPayload | null, now: Date, loading: boolean) {
  if (loading && !payload) return "Loading live news";
  if (!payload || payload.status !== "live") return "Live news unavailable";
  return `Last updated ${minutesAgo(payload.refreshedAt, now)} minutes ago`;
}

function minutesAgo(timestamp: string, now: Date) {
  const updatedAt = new Date(timestamp).getTime();
  if (!Number.isFinite(updatedAt)) return 0;
  return Math.max(0, Math.floor((now.getTime() - updatedAt) / 60000));
}

function formatCatalystTimestamp(timestamp: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp));
}
