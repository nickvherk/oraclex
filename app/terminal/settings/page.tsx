"use client";

import { ArrowRight, Check, CheckCircle2, CreditCard, Lock, LogOut, Mail, Network, Server, ShieldCheck, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Panel, PanelHeader } from "@/components/terminal/terminal-shell";
import { Badge } from "@/components/ui/badge";
import { CardContent } from "@/components/ui/card";
import { createPendingSubscription, formatPlan, isPlanUpgrade, logoutOracleX, Plan, useCurrentSession } from "@/lib/access-control";

type BillingPlan = {
  plan: Plan;
  name: string;
  price: string;
  amountUsd: number;
  checkoutLink?: string;
  description: string;
};

const billingPlans: BillingPlan[] = [
  {
    plan: "observer",
    name: "Observer",
    price: "$8/month",
    amountUsd: 8,
    checkoutLink: "https://nowpayments.io/payment/?iid=6361481558&paymentId=6293619537",
    description: "Entry-level access to OracleX intelligence previews.",
  },
  {
    plan: "analyst",
    name: "Analyst",
    price: "$24/month",
    amountUsd: 24,
    checkoutLink: "https://nowpayments.io/payment/?iid=4882285706",
    description: "Real-time wallet intelligence, consensus access, and advanced filters.",
  },
  {
    plan: "operator",
    name: "Operator",
    price: "$69/month",
    amountUsd: 69,
    checkoutLink: "https://nowpayments.io/payment/?iid=5994950303",
    description: "Full terminal access, signal monitoring, flows, alerts, and watchlists.",
  },
  {
    plan: "enterprise",
    name: "Enterprise",
    price: "Custom",
    amountUsd: 0,
    description: "APIs, webhooks, enterprise feeds, and institutional data streams.",
  },
];

const accessRows: { module: string; plans: Plan[] }[] = [
  { module: "Live Feed", plans: ["observer", "analyst", "operator", "enterprise"] },
  { module: "Wallet Intelligence", plans: ["observer", "analyst", "operator", "enterprise"] },
  { module: "Narrative Watch", plans: ["observer", "analyst", "operator", "enterprise"] },
  { module: "Consensus Engine", plans: ["analyst", "operator", "enterprise"] },
  { module: "Signal Monitor", plans: ["operator", "enterprise"] },
  { module: "Cross-Market Flows", plans: ["operator", "enterprise"] },
  { module: "APIs", plans: ["enterprise"] },
  { module: "Webhooks", plans: ["enterprise"] },
  { module: "Enterprise Feeds", plans: ["enterprise"] },
];

function CheckoutModal({ plan, onClose }: { plan: BillingPlan | null; onClose: () => void }) {
  const { session } = useCurrentSession();
  const [email, setEmail] = useState(session?.email ?? "");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const open = Boolean(plan);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim()) {
      setError("Enter an email before continuing.");
      return;
    }

    if (plan?.checkoutLink) {
      setIsSubmitting(true);
      try {
        await createPendingSubscription({ plan: plan.plan, amountUsd: plan.amountUsd, paymentUrl: plan.checkoutLink });
      } catch (subscriptionError) {
        console.warn("Unable to create pending Supabase subscription before NOWPayments checkout.", subscriptionError);
      } finally {
        // The future NOWPayments webhook will confirm payment and set this subscription to active.
        window.open(plan.checkoutLink, "_blank", "noopener,noreferrer");
        setIsSubmitting(false);
      }
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center px-4 py-8">
      <button type="button" aria-label="Close crypto checkout" className="absolute inset-0 bg-black/76 backdrop-blur-xl" onClick={onClose} />
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-blue-200/15 bg-[#050914]/95 shadow-[0_40px_120px_rgba(0,0,0,0.72)] ring-1 ring-blue-300/[0.08]">
        <div className="border-b border-white/[0.075] px-6 py-5 sm:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-2xl border border-blue-300/20 bg-blue-300/[0.075] text-blue-200">
                <CreditCard className="size-5" />
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-blue-100/80">Crypto checkout</span>
            </div>
            <button type="button" onClick={onClose} className="grid size-9 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.035] text-slate-400 transition hover:border-blue-300/20 hover:text-white" aria-label="Close modal">
              <X className="size-4" />
            </button>
          </div>
        </div>

        <div className="px-6 py-7 sm:px-8">
          <h2 className="text-3xl font-semibold tracking-[-0.035em] text-white">{plan?.name}</h2>
          <div className="mt-3 font-mono text-4xl font-medium tracking-[-0.06em] text-white">{plan?.price}</div>
          <p className="mt-3 text-sm leading-6 text-slate-400">Checkout opens NOWPayments in a new tab. Access activates after payment confirmation is connected.</p>
          <form className="mt-6 space-y-4" onSubmit={submit}>
            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-300">
                <Mail className="size-3.5 text-blue-200" />
                Billing email
              </span>
              <input value={email} onChange={(event) => { setEmail(event.target.value); setError(""); }} className="h-12 w-full rounded-xl border border-white/[0.08] bg-black/35 px-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-300/40 focus:bg-blue-300/[0.045] focus:ring-4 focus:ring-blue-300/[0.06]" placeholder="name@email.com" />
            </label>
            {error ? <div className="rounded-xl border border-red-300/20 bg-red-300/[0.06] px-4 py-3 text-sm text-red-100">{error}</div> : null}
            <button type="submit" disabled={isSubmitting} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-blue-300/45 bg-[#1f6fff] px-5 py-3 text-[13px] font-semibold text-white shadow-[0_18px_48px_rgba(31,111,255,0.22)] transition hover:bg-[#3b82f6] disabled:cursor-not-allowed disabled:opacity-60">
              {isSubmitting ? "Preparing Checkout..." : "Continue to Crypto Checkout"}
              <ArrowRight className="size-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function EnterpriseRequestModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { session } = useCurrentSession();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center px-4 py-8">
      <button type="button" aria-label="Close enterprise access request" className="absolute inset-0 bg-black/76 backdrop-blur-xl" onClick={onClose} />
      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-blue-200/15 bg-[#050914]/95 shadow-[0_40px_120px_rgba(0,0,0,0.72)] ring-1 ring-blue-300/[0.08]">
        <div className="border-b border-white/[0.075] px-6 py-5 sm:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-2xl border border-blue-300/20 bg-blue-300/[0.075] text-blue-200">
                <Server className="size-5" />
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-blue-100/80">Enterprise access</span>
            </div>
            <button type="button" onClick={onClose} className="grid size-9 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.035] text-slate-400 transition hover:border-blue-300/20 hover:text-white" aria-label="Close modal">
              <X className="size-4" />
            </button>
          </div>
        </div>
        <form className="space-y-4 px-6 py-7 sm:px-8" onSubmit={(event) => event.preventDefault()}>
          <div>
            <h2 className="text-3xl font-semibold tracking-[-0.035em] text-white">Request enterprise access</h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">Mock request form for validating the enterprise upgrade flow.</p>
          </div>
          {[
            ["email", "Email", session?.email ?? "name@company.com"],
            ["company", "Company", "Company"],
            ["role", "Role", "Founder, PM, quant, infrastructure lead"],
          ].map(([id, label, placeholder]) => (
            <label key={id} className="block">
              <span className="mb-2 block text-xs font-medium text-slate-300">{label}</span>
              <input id={id} required className="h-12 w-full rounded-xl border border-white/[0.08] bg-black/35 px-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-300/40 focus:bg-blue-300/[0.045] focus:ring-4 focus:ring-blue-300/[0.06]" placeholder={placeholder} />
            </label>
          ))}
          <button type="submit" className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-blue-300/45 bg-[#1f6fff] px-5 py-3 text-[13px] font-semibold text-white shadow-[0_18px_48px_rgba(31,111,255,0.22)] transition hover:bg-[#3b82f6]">
            Request Access
            <ArrowRight className="size-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const { session } = useCurrentSession();
  const currentPlan = session?.plan ?? null;
  const isPending = session?.source === "supabase" && session.subscriptionStatus !== "active";
  const [signupCreated] = useState(() => (typeof window === "undefined" ? false : new URLSearchParams(window.location.search).get("activation") === "created"));
  const [checkoutPlan, setCheckoutPlan] = useState<BillingPlan | null>(null);
  const [enterpriseOpen, setEnterpriseOpen] = useState(false);

  async function logout() {
    await logoutOracleX();
    router.push("/");
  }

  return (
    <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="grid min-w-0 gap-4">
        {isPending ? (
          <Panel>
            <CardContent className="p-4">
              <div className="rounded-xl border border-blue-300/18 bg-blue-300/[0.07] p-4">
                <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-blue-100">{signupCreated ? "Account created" : "Activate your access"}</div>
                <h1 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-white">Activate your access</h1>
                <p className="mt-2 text-sm leading-6 text-slate-300">Your account has been created. Choose a plan to activate OracleX Terminal access.</p>
              </div>
            </CardContent>
          </Panel>
        ) : null}

        <Panel>
          <PanelHeader title="Account Overview" action={session?.source === "supabase" ? "Supabase auth" : "Mock fallback"} />
          <CardContent className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">
            {[
              ["Email", session?.email ?? "Not signed in"],
              [isPending ? "Access level" : "Current plan", isPending ? "Not Activated" : formatPlan(currentPlan)],
              ["Status", isPending ? "Activation Required" : "Active"],
              ["Terminal access", isPending ? "Settings only" : `${formatPlan(currentPlan)} workspace`],
              ["Next renewal", "June 26, 2026"],
              ["Member since", "May 1, 2026"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-white/[0.065] bg-white/[0.025] p-4">
                <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-slate-600">{label}</div>
                <div className="mt-2 text-sm font-medium text-white">{value}</div>
              </div>
            ))}
          </CardContent>
        </Panel>

        <Panel>
          <PanelHeader title="Billing / Subscription" action="Payments pending" />
          <CardContent className="grid gap-3 p-4 xl:grid-cols-4">
            {billingPlans.map((item) => {
              const isCurrent = !isPending && item.plan === currentPlan;
              const isUpgrade = isPlanUpgrade(currentPlan, item.plan);

              return (
                <div key={item.plan} className={`flex min-h-[270px] flex-col rounded-xl border p-4 ${isCurrent ? "border-blue-300/28 bg-blue-300/[0.07]" : "border-white/[0.075] bg-black/28"}`}>
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold tracking-[-0.02em] text-white">{item.name}</h2>
                      <div className="mt-2 font-mono text-2xl tracking-[-0.05em] text-white">{item.price}</div>
                    </div>
                    {isCurrent ? <Badge className="h-6 rounded-lg border border-emerald-300/20 bg-emerald-300/[0.08] font-mono text-[10px] text-emerald-100">Current</Badge> : null}
                    {isPending && item.plan === currentPlan ? <Badge className="h-6 rounded-lg border border-blue-300/20 bg-blue-300/[0.08] font-mono text-[10px] text-blue-100">Pending</Badge> : null}
                  </div>
                  <p className="text-xs leading-5 text-slate-400">{item.description}</p>
                  <div className="mt-auto pt-5">
                    {isCurrent ? (
                      <button type="button" disabled className="inline-flex min-h-10 w-full items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.035] px-3 py-2 text-xs font-semibold text-slate-500">Current Plan</button>
                    ) : item.plan === "enterprise" ? (
                      <button type="button" onClick={() => setEnterpriseOpen(true)} className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-blue-300/45 bg-[#1f6fff] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#3b82f6]">
                        Request Access
                        <ArrowRight className="size-4" />
                      </button>
                    ) : (
                      <button type="button" onClick={() => setCheckoutPlan(item)} className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-blue-300/45 bg-[#1f6fff] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#3b82f6]">
                        {isPending ? "Activate Plan" : isUpgrade ? "Upgrade" : "Switch Plan"}
                        <ArrowRight className="size-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Panel>

        <Panel>
          <PanelHeader title="Access Matrix" />
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full min-w-[760px] text-left text-xs">
              <thead className="border-b border-white/[0.075] bg-white/[0.025] font-mono text-[10px] uppercase tracking-[0.12em] text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Module</th>
                  {billingPlans.map((item) => <th key={item.plan} className="px-4 py-3 text-center font-medium">{item.name}</th>)}
                </tr>
              </thead>
              <tbody>
                {accessRows.map((row) => (
                  <tr key={row.module} className="border-b border-white/[0.055]">
                    <td className="px-4 py-3 text-slate-200">{row.module}</td>
                    {billingPlans.map((item) => {
                      const included = row.plans.includes(item.plan);
                      return (
                        <td key={`${row.module}-${item.plan}`} className="px-4 py-3">
                          <span className={`mx-auto grid size-7 place-items-center rounded-lg border ${included ? "border-emerald-300/20 bg-emerald-300/[0.08] text-emerald-100" : "border-white/[0.08] bg-white/[0.025] text-slate-600"}`}>
                            {included ? <Check className="size-4" /> : <Lock className="size-3.5" />}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Panel>
      </div>

      <aside className="grid gap-4 2xl:sticky 2xl:top-5 2xl:self-start">
        <Panel>
          <PanelHeader title="Security" action={session?.source === "supabase" ? "Supabase" : "Mock"} />
          <CardContent className="space-y-3 p-4">
            {[
              [Mail, "Login email", session?.email ?? "Not signed in"],
              [ShieldCheck, "Password", "Protected"],
              [Network, "Two-factor authentication", "Coming soon"],
            ].map(([Icon, label, value]) => (
              <div key={label as string} className="flex items-center gap-3 rounded-xl border border-white/[0.065] bg-white/[0.025] p-3">
                <span className="grid size-9 place-items-center rounded-lg border border-blue-300/16 bg-blue-300/[0.06] text-blue-100">
                  <Icon className="size-4" />
                </span>
                <div>
                  <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-slate-600">{label as string}</div>
                  <div className="mt-1 text-xs text-slate-200">{value as string}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Panel>

        <Panel>
          <PanelHeader title="Session" />
          <CardContent className="p-4">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
              <CheckCircle2 className={`size-4 ${isPending ? "text-blue-200" : "text-emerald-200"}`} />
              Status {isPending ? "Activation Required" : "Active"}
            </div>
            <button type="button" onClick={logout} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/[0.09] bg-white/[0.04] px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-red-300/25 hover:bg-red-300/[0.08] hover:text-red-100">
              <LogOut className="size-4" />
              Logout
            </button>
          </CardContent>
        </Panel>
      </aside>

      <CheckoutModal plan={checkoutPlan} onClose={() => setCheckoutPlan(null)} />
      <EnterpriseRequestModal open={enterpriseOpen} onClose={() => setEnterpriseOpen(false)} />
    </div>
  );
}
