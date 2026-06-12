"use client";

import { useEffect } from "react";

import { TerminalShell } from "@/components/terminal/terminal-shell";
import { useCurrentSession } from "@/lib/access-control";

function getCurrentRedirectPath() {
  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

export function AuthenticatedTerminal({ children }: { children: React.ReactNode }) {
  const { session, hydrated } = useCurrentSession();

  useEffect(() => {
    if (!hydrated || session) return;

    const redirect = encodeURIComponent(getCurrentRedirectPath());
    window.location.replace(`/login?redirect=${redirect}`);
  }, [hydrated, session]);

  if (!hydrated || !session) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#02040a] text-white">
        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-blue-100">Authenticating terminal access</div>
      </main>
    );
  }

  return <TerminalShell>{children}</TerminalShell>;
}
