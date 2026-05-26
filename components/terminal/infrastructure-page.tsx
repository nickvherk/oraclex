"use client";

import { Database, Plug, RadioTower, Server, Webhook } from "lucide-react";

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
        <section className="rounded-xl border border-white/[0.075] bg-[#070b14]/86 p-6">
          <div className="mb-6 grid size-12 place-items-center rounded-xl border border-blue-300/18 bg-blue-300/[0.07] text-blue-100">
            <Icon className="size-6" />
          </div>
          <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-blue-100">Enterprise infrastructure</div>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-white">{title}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">{description}</p>
        </section>

        <Panel>
          <PanelHeader title="Infrastructure Scope" action="Enterprise" />
          <CardContent className="grid gap-3 p-4 md:grid-cols-3">
            {["Low-latency feeds", "Dedicated support", "Custom integration"].map((item) => (
              <div key={item} className="rounded-xl border border-white/[0.065] bg-white/[0.025] p-4">
                <RadioTower className="mb-4 size-4 text-blue-200" />
                <div className="text-sm font-semibold text-white">{item}</div>
                <div className="mt-2 text-xs leading-5 text-slate-400">Mock enterprise capability for validating plan access and terminal UX.</div>
              </div>
            ))}
          </CardContent>
        </Panel>
      </div>
    </FeatureGate>
  );
}
