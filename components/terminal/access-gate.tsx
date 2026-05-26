"use client";

import { ArrowRight, Lock, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

import { canAccess, Feature, formatPlan, getRequiredPlan, Plan, useCurrentSession } from "@/lib/access-control";

export function LockedAccessScreen({ requiredPlan, title = "Premium access required", explanation, badgeLabel }: { requiredPlan: Plan; title?: string; explanation?: string; badgeLabel?: string }) {
  const router = useRouter();

  function upgrade() {
    router.push("/terminal/settings");
  }

  return (
    <div className="grid min-h-[calc(100vh-112px)] place-items-center">
      <section className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-blue-200/16 bg-[#070b14]/92 p-8 text-center shadow-[0_28px_90px_rgba(0,0,0,0.38)] ring-1 ring-blue-300/[0.05]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(31,111,255,0.2),transparent_42%)]" />
        <div className="relative">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl border border-blue-300/22 bg-blue-300/[0.075] text-blue-100">
            <Lock className="size-6" />
          </span>
          <div className="mt-6 inline-flex items-center gap-2 rounded-xl border border-blue-300/15 bg-blue-300/[0.055] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-blue-100">
            <ShieldCheck className="size-3.5" />
            {badgeLabel ?? `Requires ${formatPlan(requiredPlan)}`}
          </div>
          <h1 className="mt-5 text-3xl font-semibold tracking-[-0.035em] text-white">{title}</h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-400">
            {explanation ?? `This OracleX workspace is available on the ${formatPlan(requiredPlan)} plan or higher.`}
          </p>
          <button type="button" onClick={upgrade} className="mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-blue-300/45 bg-[#1f6fff] px-5 text-[13px] font-semibold text-white shadow-[0_18px_48px_rgba(31,111,255,0.22)] transition hover:bg-[#3b82f6]">
            Upgrade Access
            <ArrowRight className="size-4" />
          </button>
        </div>
      </section>
    </div>
  );
}

export function FeatureGate({ feature, children, explanation }: { feature: Feature; children: React.ReactNode; explanation?: string }) {
  const { session, hydrated } = useCurrentSession();

  if (!hydrated) return null;

  if (session?.source === "supabase" && session.subscriptionStatus !== "active") {
    return (
      <LockedAccessScreen
        requiredPlan="observer"
        title="Terminal access locked"
        badgeLabel="Requires active subscription"
        explanation="Activate a plan to access the OracleX Terminal."
      />
    );
  }

  const plan = session?.plan ?? null;

  if (!canAccess(plan, feature)) {
    return <LockedAccessScreen requiredPlan={getRequiredPlan(feature)} explanation={explanation} />;
  }

  return <>{children}</>;
}

export function PremiumLockedOverlay({ copy, cta = "Upgrade Access", compact = false }: { copy: string; cta?: string; compact?: boolean }) {
  const router = useRouter();

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl border border-blue-200/10 bg-black/72 p-3 text-center backdrop-blur-[3px] sm:p-4">
      <div className={compact ? "max-w-[20rem]" : "max-w-[18rem] py-1"}>
        {compact ? null : (
          <span className="mx-auto mb-2 grid size-9 place-items-center rounded-xl border border-blue-300/24 bg-blue-300/[0.1] text-blue-100 sm:mb-3 sm:size-10">
            <Lock className="size-4" />
          </span>
        )}
        <div className={compact ? "text-[11px] font-semibold leading-4 tracking-[-0.01em] text-white sm:text-xs" : "text-xs font-semibold leading-5 tracking-[-0.01em] text-white sm:text-sm"}>{copy}</div>
        <button type="button" onClick={() => router.push("/terminal/settings")} className={compact ? "mt-2 inline-flex min-h-7 items-center justify-center gap-1.5 rounded-md border border-blue-300/45 bg-[#1f6fff] px-2 py-1 text-[10px] font-semibold text-white shadow-[0_14px_34px_rgba(31,111,255,0.18)] transition hover:bg-[#3b82f6]" : "mt-3 inline-flex min-h-8 items-center justify-center gap-1.5 rounded-lg border border-blue-300/45 bg-[#1f6fff] px-2.5 py-1.5 text-[11px] font-semibold text-white shadow-[0_14px_34px_rgba(31,111,255,0.18)] transition hover:bg-[#3b82f6] sm:h-9 sm:gap-2 sm:px-3 sm:text-xs"}>
          {cta}
          <ArrowRight className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
