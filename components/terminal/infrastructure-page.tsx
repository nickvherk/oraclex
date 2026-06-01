"use client";

import { Database, Lock, Plug, RadioTower, Server, Webhook } from "lucide-react";

import { FeatureGate } from "@/components/terminal/access-gate";
import { Panel, PanelHeader } from "@/components/terminal/terminal-shell";
import { Feature } from "@/lib/access-control";
import { CardContent } from "@/components/ui/card";

const icons = {
  apis: Plug,
  webhooks: Webhook,
  enterpriseFeeds: Server,
  dataStreams: Database,
} as const;

export function EnterpriseInfrastructurePage({ feature, title, description }: { feature: Extract<Feature, "apis" | "webhooks" | "enterpriseFeeds" | "dataStreams">; title: string; description: string }) {
  const Icon = icons[feature];

  return (
    <FeatureGate feature={feature} explanation={`${title} are enterprise infrastructure capabilities for institutional OracleX integrations.`}>
      <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded-xl border border-white/[0.075] bg-[#070b14]/86 p-6 opacity-80">
          <div className="mb-6 grid size-12 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.035] text-slate-400">
            <Icon className="size-6" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">Enterprise infrastructure</div>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.035] px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-400">
              <Lock className="size-3" />
              Coming Soon
            </span>
          </div>
          <h1 className="mt-3 flex flex-wrap items-center gap-2 text-3xl font-semibold tracking-[-0.035em] text-white">
            {title}
            <Lock className="size-5 text-slate-500" />
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">{description}</p>
        </section>

        <Panel>
          <PanelHeader title="Infrastructure Scope" action="Coming soon" />
          <CardContent className="grid gap-3 p-4 md:grid-cols-3">
            {["Low-latency feeds", "Dedicated support", "Custom integration"].map((item) => (
              <div key={item} aria-disabled="true" className="rounded-xl border border-white/[0.065] bg-white/[0.018] p-4 opacity-65">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <RadioTower className="size-4 text-slate-500" />
                  <span className="inline-flex items-center gap-1 rounded-md border border-white/[0.07] bg-white/[0.03] px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.08em] text-slate-500">
                    <Lock className="size-2.5" />
                    Soon
                  </span>
                </div>
                <div className="text-sm font-semibold text-slate-300">{item}</div>
                <div className="mt-2 text-xs leading-5 text-slate-500">Reserved for upcoming institutional infrastructure access.</div>
              </div>
            ))}
          </CardContent>
        </Panel>
      </div>
    </FeatureGate>
  );
}
