"use client";

import {
  Activity,
  BarChart3,
  Bell,
  BrainCircuit,
  CalendarDays,
  Cpu,
  Database,
  Gauge,
  Layers,
  LogOut,
  Lock,
  Network,
  Plug,
  Radio,
  Search,
  Settings,
  Server,
  ShieldCheck,
  Terminal,
  User,
  Wallet,
  Webhook,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { LockedAccessScreen } from "@/components/terminal/access-gate";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { canAccess, Feature, formatPlan, logoutOracleX, useCurrentSession } from "@/lib/access-control";

const navSections = [
  {
    label: "INTELLIGENCE",
    items: [
      { label: "Live Feed", href: "/terminal", icon: Radio, feature: "liveFeed" },
      { label: "Signal Monitor", href: "/terminal/signals", icon: Activity, feature: "signalMonitor" },
      { label: "Narrative Intelligence", href: "/terminal/narratives", icon: BrainCircuit, feature: "narrativeIntelligence" },
      { label: "Prediction Market Analytics", href: "/terminal/wallets", icon: Wallet, feature: "walletIntelligence" },
      { label: "Hyperliquid Flows", href: "/terminal/flows", icon: Layers, feature: "crossMarketFlows" },
      { label: "Market Events", href: "/terminal/events", icon: CalendarDays, feature: "marketEvents" },
    ],
  },
  {
    label: "MARKETS",
    items: [
      { label: "Crypto", href: "/terminal/markets/crypto", icon: BarChart3, feature: "liveFeed" },
      { label: "Politics", href: "/terminal/markets/politics", icon: ShieldCheck, feature: "liveFeed" },
      { label: "Macro", href: "/terminal/markets/macro", icon: Gauge, feature: "liveFeed" },
      { label: "AI", href: "/terminal/markets/ai", icon: Cpu, feature: "liveFeed" },
      { label: "Sports", href: "/terminal/markets/sports", icon: Zap, feature: "liveFeed" },
    ],
  },
  {
    label: "INFRASTRUCTURE",
    items: [
      { label: "APIs", href: "/terminal/apis", icon: Plug, feature: "apis", comingSoon: true },
      { label: "Enterprise Feeds", href: "/terminal/enterprise-feeds", icon: Server, feature: "enterpriseFeeds", comingSoon: true },
      { label: "Webhooks", href: "/terminal/webhooks", icon: Webhook, feature: "webhooks", comingSoon: true },
      { label: "Data Streams", href: "/terminal/data-streams", icon: Database, feature: "dataStreams", comingSoon: true },
    ],
  },
  {
    label: "MANAGEMENT",
    items: [
      { label: "Settings", href: "/terminal/settings", icon: Settings, feature: "terminal" },
    ],
  },
];

const sidebarStats = [
  ["System health", "99.98%", "text-emerald-200"],
  ["API status", "Nominal", "text-blue-200"],
  ["Signal latency", "8.4s", "text-slate-200"],
  ["Markets scanned", "1,284", "text-slate-200"],
];

const routeTitles: Record<string, string> = {
  "/terminal": "Live Intelligence Workspace",
  "/terminal/narratives": "Narrative Intelligence",
  "/terminal/consensus": "Narrative Intelligence",
  "/terminal/signals": "Signal Monitor",
  "/terminal/wallets": "Prediction Market Analytics",
  "/terminal/flows": "Hyperliquid Flows",
  "/terminal/events": "Market Events",
  "/terminal/apis": "OracleX APIs",
  "/terminal/webhooks": "Webhooks",
  "/terminal/enterprise-feeds": "Enterprise Feeds",
  "/terminal/data-streams": "Data Streams",
  "/terminal/settings": "Account Settings",
};

const marketRouteTitles: Record<string, string> = {
  crypto: "Crypto Market Workspace",
  politics: "Politics Market Workspace",
  macro: "Macro Market Workspace",
  ai: "AI Market Workspace",
  sports: "Sports Market Workspace",
};

function getRouteTitle(pathname: string) {
  const marketMatch = pathname.match(/^\/terminal\/markets\/([^/]+)$/);
  if (marketMatch) return marketRouteTitles[marketMatch[1]] ?? "Market Workspace";
  return routeTitles[pathname] ?? "OracleX Intelligence Workspace";
}

export function Panel({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return (
    <Card className={`rounded-xl border border-white/[0.08] bg-[#070b14]/92 py-0 text-white shadow-[0_18px_60px_rgba(0,0,0,0.28)] ring-blue-300/[0.04] ${className}`}>
      {children}
    </Card>
  );
}

export function PanelHeader({ title, action, info }: { title: string; action?: string; info?: React.ReactNode }) {
  return (
    <CardHeader className="border-b border-white/[0.075] px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <CardTitle className="font-mono text-[11px] uppercase tracking-[0.16em] text-slate-300">{title}</CardTitle>
          {info}
        </div>
        {action ? <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-blue-200">{action}</span> : null}
      </div>
    </CardHeader>
  );
}

export function BiasBadge({ bias }: { bias: string }) {
  const tone =
    bias === "Bullish"
      ? "border-emerald-300/20 bg-emerald-300/[0.08] text-emerald-200"
      : bias === "Bearish"
        ? "border-red-300/20 bg-red-300/[0.08] text-red-200"
        : "border-slate-300/15 bg-slate-300/[0.06] text-slate-300";

  return <Badge className={`h-6 shrink-0 whitespace-nowrap rounded-lg border px-2 font-mono text-[10px] ${tone}`}>{bias}</Badge>;
}

export function SeverityBadge({ severity }: { severity: string }) {
  const tone =
    severity === "critical"
      ? "border-red-300/25 bg-red-300/[0.1] text-red-200"
      : severity === "high"
        ? "border-amber-300/25 bg-amber-300/[0.09] text-amber-200"
        : severity === "medium"
          ? "border-blue-300/20 bg-blue-300/[0.08] text-blue-100"
          : "border-slate-300/15 bg-slate-300/[0.06] text-slate-300";

  return <Badge className={`h-6 rounded-lg border px-2 font-mono text-[10px] uppercase ${tone}`}>{severity}</Badge>;
}

function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { session } = useCurrentSession();
  const isPendingSupabaseUser = session?.source === "supabase" && session.subscriptionStatus !== "active";
  const activePlan = isPendingSupabaseUser ? null : session?.plan ?? null;

  async function logout() {
    await logoutOracleX();
    router.push("/");
  }

  return (
    <aside className="hidden h-screen w-[280px] shrink-0 border-r border-white/[0.075] bg-black/55 xl:flex xl:flex-col">
      <Link href="/" className="flex h-[72px] items-center gap-3 border-b border-white/[0.075] px-5">
        <span className="grid size-9 place-items-center rounded-xl border border-blue-300/25 bg-blue-300/[0.075] text-blue-200">
          <Network className="size-5" />
        </span>
        <div>
          <div className="text-sm font-semibold tracking-[-0.01em] text-white">OracleX</div>
          <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">Intelligence OS</div>
        </div>
      </Link>
      <nav className="min-h-0 flex-1 overflow-y-auto px-4 py-5">
        {navSections.map((section) => (
          <div key={section.label} className="mb-6">
            <div className="mb-2 px-2 font-mono text-[10px] uppercase tracking-[0.18em] text-slate-600">{section.label}</div>
            <div className="space-y-1">
              {section.items.map((item) => {
                const active = pathname === item.href;
                const Icon = item.icon;
                const comingSoon = "comingSoon" in item && item.comingSoon;
                const locked = item.href !== "/terminal/settings" && !canAccess(activePlan, item.feature as Feature);

                const navClass = `flex min-h-9 w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium transition ${comingSoon ? "cursor-not-allowed border border-white/[0.045] bg-white/[0.018] text-slate-600 opacity-70" : active ? "border border-blue-300/18 bg-blue-300/[0.075] text-blue-100" : locked ? "text-slate-600 hover:bg-white/[0.02] hover:text-slate-400" : "text-slate-400 hover:bg-white/[0.035] hover:text-slate-100"}`;

                const navContent = (
                  <>
                    <Icon className="size-4 shrink-0" />
                    <span className="min-w-0 flex-1 truncate">{item.label}</span>
                    {comingSoon ? (
                      <span className="flex shrink-0 items-center gap-1 rounded-md border border-white/[0.07] bg-white/[0.035] px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.08em] text-slate-500">
                        <Lock className="size-2.5" />
                        Coming Soon
                      </span>
                    ) : locked ? (
                      <Lock className="size-3.5" />
                    ) : null}
                  </>
                );

                return comingSoon ? (
                  <div key={`${section.label}-${item.label}`} aria-disabled="true" className={navClass}>
                    {navContent}
                  </div>
                ) : (
                  <Link key={`${section.label}-${item.label}`} href={item.href} className={navClass}>
                    {navContent}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="border-t border-white/[0.075] p-4">
        <div className="mb-3 flex items-center justify-between gap-3 rounded-xl border border-blue-300/14 bg-blue-300/[0.055] p-3">
          <div>
            <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-slate-500">{isPendingSupabaseUser ? "Access inactive" : "Current plan"}</div>
            <div className="mt-1 text-xs font-semibold text-blue-100">{isPendingSupabaseUser ? "Activation required" : formatPlan(session?.plan ?? null)}</div>
            {isPendingSupabaseUser ? (
              <button type="button" onClick={() => router.push("/terminal/settings")} className="mt-1 text-left font-mono text-[9px] uppercase tracking-[0.12em] text-blue-200 transition hover:text-white">
                Activate Access
              </button>
            ) : activePlan === "observer" ? (
              <button type="button" onClick={() => router.push("/terminal/settings")} className="mt-1 text-left font-mono text-[9px] uppercase tracking-[0.12em] text-blue-200 transition hover:text-white">
                Upgrade recommended: Analyst
              </button>
            ) : null}
          </div>
          <button type="button" onClick={logout} className="grid size-8 place-items-center rounded-lg border border-white/[0.08] bg-white/[0.035] text-slate-300 transition hover:border-blue-300/20 hover:text-white" aria-label="Logout">
            <LogOut className="size-4" />
          </button>
        </div>
        <div className="space-y-2 rounded-xl border border-white/[0.075] bg-white/[0.025] p-3">
          {sidebarStats.map(([label, value, tone]) => (
            <div key={label} className="flex items-center justify-between gap-3 text-xs">
              <span className="text-slate-500">{label}</span>
              <span className={`font-mono ${tone}`}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

export function TerminalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const title = getRouteTitle(pathname);
  const { session } = useCurrentSession();
  const isPendingSupabaseUser = session?.source === "supabase" && session.subscriptionStatus !== "active";
  const content =
    isPendingSupabaseUser && pathname !== "/terminal/settings" ? (
      <LockedAccessScreen
        requiredPlan="observer"
        title="Terminal access locked"
        badgeLabel="Requires active subscription"
        explanation="Activate a plan to access the OracleX Terminal."
      />
    ) : (
      children
    );

  return (
    <main className="min-h-screen overflow-hidden bg-[#02040a] text-white selection:bg-blue-300 selection:text-black">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_34%_0%,rgba(31,111,255,0.12),transparent_26%),linear-gradient(180deg,#02040a_0%,#050812_54%,#02040a_100%)]" />
      <div className="pointer-events-none fixed inset-0 data-streams opacity-[0.028]" />

      <div className="relative z-10 flex min-h-screen">
        <Sidebar />
        <section className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-[72px] shrink-0 items-center gap-4 border-b border-white/[0.075] bg-black/45 px-4 backdrop-blur-xl lg:px-6">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <span className="grid size-9 place-items-center rounded-xl border border-blue-300/20 bg-blue-300/[0.065] text-blue-200 xl:hidden">
                <Network className="size-5" />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-sm font-semibold tracking-[-0.01em]">
                  <Terminal className="size-4 text-blue-200" />
                  {title}
                </div>
                <div className="mt-1 hidden font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500 sm:block">Institutional prediction intelligence terminal</div>
              </div>
            </div>
            <div className="hidden w-full max-w-md items-center gap-2 rounded-xl border border-white/[0.09] bg-white/[0.035] px-3 md:flex">
              <Search className="size-4 text-slate-500" />
              <Input className="h-10 border-0 bg-transparent px-0 text-sm text-white placeholder:text-slate-600 focus-visible:ring-0" placeholder="Search markets, agents, wallets, narratives" />
            </div>
            <div className="hidden items-center gap-2 rounded-xl border border-emerald-300/20 bg-emerald-300/[0.06] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-emerald-200 lg:flex">
              <span className="size-1.5 rounded-full bg-emerald-300" />
              Engine online
            </div>
            <button type="button" className="grid size-9 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.035] text-slate-300" aria-label="Notifications">
              <Bell className="size-4" />
            </button>
            <button type="button" className="grid size-9 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.035] text-blue-100" aria-label="Profile">
              <User className="size-4" />
            </button>
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto p-4 lg:p-5">{content}</div>
        </section>
      </div>
    </main>
  );
}
