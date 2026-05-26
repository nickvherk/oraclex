"use client";

import { useEffect, useMemo, useSyncExternalStore, useState } from "react";
import type { Session } from "@supabase/supabase-js";

import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export const plans = ["observer", "analyst", "operator", "enterprise"] as const;

export type Plan = (typeof plans)[number];
export type SubscriptionStatus = "active" | "pending" | "inactive" | "canceled" | "expired";

export type Feature =
  | "terminal"
  | "liveFeed"
  | "walletIntelligence"
  | "narrativeWatch"
  | "consensusEngine"
  | "crossMarketFlows"
  | "signalMonitor"
  | "advancedWalletFilters"
  | "smartMoneySignals"
  | "whaleMonitoring"
  | "advancedAlerts"
  | "customWatchlists"
  | "earlySignalSystems"
  | "enterpriseInfrastructure"
  | "apis"
  | "webhooks"
  | "enterpriseFeeds"
  | "dataStreams";

export const AUTH_STORAGE_KEY = "oraclex.mockAuth";
export const SUPABASE_PROFILE_STORAGE_KEY = "oraclex.supabaseProfile";

export type MockSession = {
  email: string;
  plan: Plan;
};

export type OracleXSession = {
  email: string;
  plan: Plan;
  subscriptionStatus: SubscriptionStatus;
  source: "supabase" | "mock";
};

type StoredSupabaseProfile = {
  userId: string;
  email: string;
  plan: Plan;
  subscriptionStatus: SubscriptionStatus;
};

type PendingSubscriptionInput = {
  plan: Plan;
  amountUsd: number;
  paymentUrl: string;
};

export const mockUsers: Record<string, { password: string; plan: Plan }> = {
  "test-observer@gmail.com": { password: "Test", plan: "observer" },
  "test-analyst@gmail.com": { password: "Test", plan: "analyst" },
  "test-operator@gmail.com": { password: "Test", plan: "operator" },
  "test-enterprise@gmail.com": { password: "Test", plan: "enterprise" },
};

const featureAccess: Record<Feature, Plan[]> = {
  terminal: ["observer", "analyst", "operator", "enterprise"],
  liveFeed: ["observer", "analyst", "operator", "enterprise"],
  walletIntelligence: ["observer", "analyst", "operator", "enterprise"],
  narrativeWatch: ["observer", "analyst", "operator", "enterprise"],
  consensusEngine: ["analyst", "operator", "enterprise"],
  crossMarketFlows: ["operator", "enterprise"],
  signalMonitor: ["operator", "enterprise"],
  advancedWalletFilters: ["analyst", "operator", "enterprise"],
  smartMoneySignals: ["analyst", "operator", "enterprise"],
  whaleMonitoring: ["operator", "enterprise"],
  advancedAlerts: ["operator", "enterprise"],
  customWatchlists: ["operator", "enterprise"],
  earlySignalSystems: ["operator", "enterprise"],
  enterpriseInfrastructure: ["enterprise"],
  apis: ["enterprise"],
  webhooks: ["enterprise"],
  enterpriseFeeds: ["enterprise"],
  dataStreams: ["enterprise"],
};

export function getRequiredPlan(feature: Feature): Plan {
  return featureAccess[feature][0];
}

export function canAccess(plan: Plan | null, feature: Feature) {
  return Boolean(plan && featureAccess[feature].includes(plan));
}

export function isAtLeast(plan: Plan | null, minimum: Plan) {
  if (!plan) return false;
  return plans.indexOf(plan) >= plans.indexOf(minimum);
}

export function getMockPlan(email: string, password: string): Plan | null {
  const user = mockUsers[email.trim().toLowerCase()];
  return user?.password === password ? user.plan : null;
}

export function saveMockSession(email: string, plan: Plan) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ email: email.trim().toLowerCase(), plan }));
  window.dispatchEvent(new Event("oraclex-auth"));
}

export function clearMockSession() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  window.dispatchEvent(new Event("oraclex-auth"));
}

function dispatchAuthChange() {
  window.dispatchEvent(new Event("oraclex-auth"));
}

function normalizePlan(plan: string | null | undefined): Plan {
  return plans.includes(plan as Plan) ? (plan as Plan) : "observer";
}

function normalizeSubscriptionStatus(status: string | null | undefined): SubscriptionStatus {
  if (status === "active" || status === "pending" || status === "inactive" || status === "canceled" || status === "expired") return status;
  return "pending";
}

function readStoredSupabaseProfile(): StoredSupabaseProfile | null {
  try {
    const raw = localStorage.getItem(SUPABASE_PROFILE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { userId?: string; email?: string; plan?: string; subscriptionStatus?: string };
    if (!parsed.userId || !parsed.email || !plans.includes(parsed.plan as Plan)) return null;
    return { userId: parsed.userId, email: parsed.email, plan: parsed.plan as Plan, subscriptionStatus: normalizeSubscriptionStatus(parsed.subscriptionStatus) };
  } catch {
    return null;
  }
}

function saveSupabaseProfile(profile: StoredSupabaseProfile) {
  localStorage.setItem(SUPABASE_PROFILE_STORAGE_KEY, JSON.stringify(profile));
  dispatchAuthChange();
}

function clearSupabaseProfile() {
  localStorage.removeItem(SUPABASE_PROFILE_STORAGE_KEY);
  dispatchAuthChange();
}

async function upsertDefaultProfile(userId: string, email: string) {
  const supabase = createBrowserSupabaseClient();

  const { error } = await supabase
    .from("profiles")
    .upsert({ id: userId, email: email.trim().toLowerCase(), plan: "observer" }, { onConflict: "id", ignoreDuplicates: true });

  if (error) {
    throw error;
  }
}

async function fetchProfileForSession(session: Session | null): Promise<OracleXSession | null> {
  if (!session?.user) return null;

  const supabase = createBrowserSupabaseClient();
  const email = session.user.email ?? "";
  const [{ data, error }, { data: activeSubscription, error: activeSubscriptionError }] = await Promise.all([
    supabase.from("profiles").select("plan,email").eq("id", session.user.id).maybeSingle(),
    supabase
      .from("subscriptions")
      .select("plan,status")
      .eq("user_id", session.user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (error) {
    throw error;
  }

  if (activeSubscriptionError) {
    throw activeSubscriptionError;
  }

  if (!data) {
    await upsertDefaultProfile(session.user.id, email);
    const fallback = { userId: session.user.id, email, plan: "observer" as Plan, subscriptionStatus: "pending" as SubscriptionStatus };
    saveSupabaseProfile(fallback);
    return { email, plan: "observer", subscriptionStatus: "pending", source: "supabase" };
  }

  const subscriptionStatus = activeSubscription?.status === "active" ? "active" : "pending";
  const plan = activeSubscription?.status === "active" ? normalizePlan(activeSubscription.plan) : normalizePlan(data.plan);
  const profileEmail = data.email ?? email;
  saveSupabaseProfile({ userId: session.user.id, email: profileEmail, plan, subscriptionStatus });
  return { email: profileEmail, plan, subscriptionStatus, source: "supabase" };
}

function fallbackSupabaseSession(session: Session): OracleXSession {
  const email = session.user.email ?? "";
  saveSupabaseProfile({ userId: session.user.id, email, plan: "observer", subscriptionStatus: "pending" });
  return { email, plan: "observer", subscriptionStatus: "pending", source: "supabase" };
}

export async function loginWithSupabase(email: string, password: string) {
  const supabase = createBrowserSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });

  if (error) {
    throw error;
  }

  if (!data.session) return null;

  const profileSession = await fetchProfileForSession(data.session).catch(() => fallbackSupabaseSession(data.session));
  if (profileSession) {
    clearMockSession();
  }

  return profileSession;
}

export async function signUpWithSupabase(email: string, password: string) {
  const supabase = createBrowserSupabaseClient();
  const normalizedEmail = email.trim().toLowerCase();
  const { data, error } = await supabase.auth.signUp({ email: normalizedEmail, password });

  if (error) {
    throw error;
  }

  if (data.user && data.session) {
    await upsertDefaultProfile(data.user.id, normalizedEmail);
    const profileSession = await fetchProfileForSession(data.session);
    clearMockSession();
    return profileSession;
  }

  return null;
}

export async function createPendingSubscription(input: PendingSubscriptionInput) {
  const supabase = createBrowserSupabaseClient();
  const { data: authData, error: authError } = await supabase.auth.getSession();

  if (authError) {
    throw authError;
  }

  if (!authData.session?.user) {
    return false;
  }

  const { error } = await supabase.from("subscriptions").insert({
    user_id: authData.session.user.id,
    plan: input.plan,
    status: "pending",
    payment_provider: "nowpayments",
    payment_url: input.paymentUrl,
    amount_usd: input.amountUsd,
  });

  if (error) {
    throw error;
  }

  // The future NOWPayments webhook will verify payment completion and update
  // this subscription row to status = active.
  return true;
}

export async function logoutOracleX() {
  const supabase = createBrowserSupabaseClient();
  await supabase.auth.signOut();
  clearSupabaseProfile();
  clearMockSession();
}

function readStoredSession(): MockSession | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { email?: string; plan?: string };
    if (!parsed.email || !plans.includes(parsed.plan as Plan)) return null;
    return { email: parsed.email, plan: parsed.plan as Plan };
  } catch {
    return null;
  }
}

function readStoredSessionRaw() {
  return localStorage.getItem(AUTH_STORAGE_KEY) ?? "";
}

function readStoredPlan(): Plan | null {
  const profile = readStoredSupabaseProfile();
  if (profile) return profile.subscriptionStatus === "active" ? profile.plan : null;
  return readStoredSession()?.plan ?? null;
}

export function useCurrentPlan() {
  const plan = useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener("storage", onStoreChange);
      window.addEventListener("oraclex-auth", onStoreChange);

      return () => {
        window.removeEventListener("storage", onStoreChange);
        window.removeEventListener("oraclex-auth", onStoreChange);
      };
    },
    readStoredPlan,
    () => null,
  );

  useEffect(() => {
    let active = true;
    const supabase = createBrowserSupabaseClient();

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      if (!data.session) {
        clearSupabaseProfile();
        return;
      }
      fetchProfileForSession(data.session).catch(() => fallbackSupabaseSession(data.session));
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      if (!session) {
        clearSupabaseProfile();
        return;
      }
      fetchProfileForSession(session).catch(() => fallbackSupabaseSession(session));
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  return { plan, hydrated: true };
}

export function useCurrentSession() {
  const raw = useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener("storage", onStoreChange);
      window.addEventListener("oraclex-auth", onStoreChange);

      return () => {
        window.removeEventListener("storage", onStoreChange);
        window.removeEventListener("oraclex-auth", onStoreChange);
      };
    },
    readStoredSessionRaw,
    () => "",
  );

  const [supabaseSession, setSupabaseSession] = useState<OracleXSession | null>(() => {
    const profile = typeof window === "undefined" ? null : readStoredSupabaseProfile();
    return profile ? { email: profile.email, plan: profile.plan, subscriptionStatus: profile.subscriptionStatus, source: "supabase" } : null;
  });

  useEffect(() => {
    let active = true;
    const supabase = createBrowserSupabaseClient();

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      if (!data.session) {
        setSupabaseSession(null);
        clearSupabaseProfile();
        return;
      }
      fetchProfileForSession(data.session).then((session) => {
        if (active) setSupabaseSession(session);
      }).catch(() => {
        if (active) setSupabaseSession(fallbackSupabaseSession(data.session));
      });
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      if (!session) {
        setSupabaseSession(null);
        clearSupabaseProfile();
        return;
      }
      fetchProfileForSession(session).then((profileSession) => {
        if (active) setSupabaseSession(profileSession);
      }).catch(() => {
        if (active) setSupabaseSession(fallbackSupabaseSession(session));
      });
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const mockSession = useMemo<OracleXSession | null>(() => {
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as { email?: string; plan?: string };
      if (!parsed.email || !plans.includes(parsed.plan as Plan)) return null;
      return { email: parsed.email, plan: parsed.plan as Plan, subscriptionStatus: "active", source: "mock" };
    } catch {
      return null;
    }
  }, [raw]);

  return { session: supabaseSession ?? mockSession, hydrated: true };
}

export function getPlanRank(plan: Plan) {
  return plans.indexOf(plan);
}

export function isPlanUpgrade(currentPlan: Plan | null, targetPlan: Plan) {
  if (!currentPlan) return true;
  return getPlanRank(targetPlan) > getPlanRank(currentPlan);
}

export function getMockSessionSnapshot() {
  if (typeof window === "undefined") return null;
  const profile = readStoredSupabaseProfile();
  if (profile) return { email: profile.email, plan: profile.plan, subscriptionStatus: profile.subscriptionStatus, source: "supabase" as const };
  const mockSession = readStoredSession();
  return mockSession ? { ...mockSession, subscriptionStatus: "active" as const, source: "mock" as const } : null;
}

export function formatPlan(plan: Plan | null) {
  if (!plan) return "No access";
  return plan.charAt(0).toUpperCase() + plan.slice(1);
}
