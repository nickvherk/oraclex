"use client";

import { motion } from "framer-motion";
import { ArrowRight, Lock, Mail, Network, ShieldCheck, Terminal } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getMockPlan, loginWithSupabase, saveMockSession, signUpWithSupabase } from "@/lib/access-control";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const session = isSignup ? await signUpWithSupabase(email, password) : await loginWithSupabase(email, password);

      if (session) {
        router.push(isSignup ? "/terminal/settings?activation=created" : "/terminal");
        return;
      }

      setError("Account created. Check your email to confirm the account before logging in.");
      return;
    } catch (supabaseError) {
      if (!isSignup) {
        const plan = getMockPlan(email, password);

        if (plan) {
          saveMockSession(email, plan);
          router.push("/terminal");
          return;
        }
      }

      setError(supabaseError instanceof Error ? supabaseError.message : "Authentication failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#02040a] text-white selection:bg-blue-300 selection:text-black">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_24%_18%,rgba(31,111,255,0.18),transparent_28%),radial-gradient(circle_at_82%_10%,rgba(96,165,250,0.09),transparent_26%),linear-gradient(180deg,#02040a_0%,#050914_54%,#02040a_100%)]" />
      <div className="pointer-events-none absolute inset-0 data-streams opacity-[0.045]" />

      <section className="relative z-10 grid min-h-screen place-items-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="w-full max-w-md overflow-hidden rounded-2xl border border-white/[0.09] bg-[#050914]/88 shadow-[0_34px_120px_rgba(0,0,0,0.62)] ring-1 ring-blue-300/[0.08] backdrop-blur-xl"
        >
          <div className="border-b border-white/[0.075] bg-white/[0.025] px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl border border-blue-300/25 bg-blue-300/[0.075] text-blue-200">
                  <Network className="size-5" />
                </span>
                <div>
                  <div className="text-sm font-semibold tracking-[-0.01em]">OracleX</div>
                  <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">Terminal Login</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 rounded-full border border-emerald-300/20 bg-emerald-300/[0.055] px-2.5 py-1 font-mono text-[10px] text-emerald-200">
                <span className="size-1.5 rounded-full bg-emerald-300" />
                ONLINE
              </div>
            </div>
          </div>

          <div className="px-6 py-7">
            <div className="mb-7">
              <div className="mb-4 inline-flex items-center gap-2 rounded-xl border border-blue-300/15 bg-blue-300/[0.055] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-blue-100">
                <Terminal className="size-3.5" />
                Terminal Login
              </div>
              <h1 className="text-3xl font-semibold tracking-[-0.035em] text-white">OracleX Terminal Login</h1>
              <p className="mt-3 text-sm leading-6 text-slate-400">Supabase Auth access with local demo fallback for plan testing.</p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-300">
                  <Mail className="size-3.5 text-blue-200" />
                  Email
                </span>
                <Input
                  type="text"
                  required
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setError("");
                  }}
                  placeholder="Email"
                  autoComplete="username"
                  aria-invalid={error ? "true" : undefined}
                  className="h-12 rounded-xl border-white/10 bg-black/35 px-4 text-sm text-white placeholder:text-slate-600 focus-visible:border-blue-300/50 focus-visible:ring-blue-300/20"
                />
              </label>
              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-300">
                  <Lock className="size-3.5 text-blue-200" />
                  Password
                </span>
                <Input
                  type="password"
                  required
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError("");
                  }}
                  placeholder="Password"
                  autoComplete="current-password"
                  aria-invalid={error ? "true" : undefined}
                  className="h-12 rounded-xl border-white/10 bg-black/35 px-4 text-sm text-white placeholder:text-slate-600 focus-visible:border-blue-300/50 focus-visible:ring-blue-300/20"
                />
              </label>
              {error ? (
                <div className="rounded-xl border border-red-300/20 bg-red-300/[0.06] px-4 py-3 text-sm text-red-100" role="alert">
                  {error}
                </div>
              ) : null}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 h-12 w-full rounded-xl border border-blue-300/45 bg-[#1f6fff] text-sm font-semibold text-white shadow-[0_18px_52px_rgba(31,111,255,0.24)] hover:bg-[#3b82f6]"
              >
                {isSubmitting ? "Authenticating..." : isSignup ? "Create Account" : "Enter Terminal"}
                <ArrowRight className="size-4" />
              </Button>
            </form>
            <button
              type="button"
              onClick={() => {
                setIsSignup((current) => !current);
                setError("");
              }}
              className="mt-4 w-full text-center text-xs font-semibold text-blue-100 transition hover:text-white"
            >
              {isSignup ? "Have an account? Log in" : "Create a Supabase account"}
            </button>

            <div className="mt-6 grid grid-cols-2 gap-3 border-t border-white/[0.075] pt-5">
              <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-3">
                <ShieldCheck className="mb-2 size-4 text-blue-200" />
                <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500">Auth Mode</div>
                <div className="mt-1 text-xs text-slate-300">Supabase + demo</div>
              </div>
              <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-3">
                <Terminal className="mb-2 size-4 text-blue-200" />
                <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500">Workspace</div>
                <div className="mt-1 text-xs text-slate-300">Live mock feed</div>
              </div>
            </div>
            <div className="mt-4 rounded-xl border border-white/[0.07] bg-white/[0.025] p-4 font-mono text-[10px] leading-5 text-slate-400">
              test-observer@gmail.com / Test<br />
              test-analyst@gmail.com / Test<br />
              test-operator@gmail.com / Test<br />
              test-enterprise@gmail.com / Test
            </div>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
