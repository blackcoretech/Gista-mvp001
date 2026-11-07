"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

type VerifiedAccount = { profile_id: string; badge_color: string; username: string };

async function loadVerifiedAccounts(supabase: ReturnType<typeof createClient>): Promise<VerifiedAccount[]> {
  const { data, error } = await supabase
    .from("verified_profiles")
    .select("profile_id,badge_color,profiles!verified_profiles_profile_id_fkey(username)")
    .eq("verification_type", "official");

  if (error || !data) {
    console.error("Gista verified accounts could not be loaded:", error?.message);
    return [];
  }

  return (data as any[])
    .map((row) => ({
      profile_id: row.profile_id,
      badge_color: row.badge_color || "#6D28D9",
      username: Array.isArray(row.profiles) ? row.profiles[0]?.username : row.profiles?.username,
    }))
    .filter((row) => Boolean(row.username)) as VerifiedAccount[];
}

function hasVerifiedBadge(target: Element) {
  // React-rendered badges sit beside the name in the same identity row, not
  // inside the <strong>. Check both the name and its direct siblings so the
  // global injector never adds a second badge below/inside the user's name.
  const badgeSelector =
    "[data-gista-verified-badge], .verified-badge, [aria-label=\"Verified account\"]";
  const existingOnName = target.querySelector(`:scope > ${badgeSelector}`);
  const existingBesideName = target.parentElement?.querySelector(
    `:scope > ${badgeSelector}`
  );
  return Boolean(existingOnName || existingBesideName);
}

function addBadge(target: Element, color: string) {
  if (hasVerifiedBadge(target)) return;

  const badge = document.createElement("span");
  badge.dataset.gistaVerifiedBadge = "true";
  badge.setAttribute("title", "Verified account");
  badge.setAttribute("aria-label", "Verified account");
  badge.textContent = "✓";
  badge.style.cssText = [
    "display:inline-flex",
    "align-items:center",
    "justify-content:center",
    "width:13px",
    "height:13px",
    "margin-left:3px",
    "border-radius:50%",
    `background:${color}`,
    "color:#fff",
    "font-size:8px",
    "font-weight:800",
    "line-height:1",
    "vertical-align:middle",
    "flex:0 0 auto",
  ].join(";");

  target.appendChild(badge);
}

export default function VerifiedBadgeInjector() {
  useEffect(() => {
    let cancelled = false;
    let verifiedAccounts: VerifiedAccount[] = [];
    let loadVersion = 0;
    const supabase = createClient();

    const apply = () => {
      if (cancelled) return;
      const byUsername = new Map(verifiedAccounts.map((account) => [account.username, account.badge_color]));

      document.querySelectorAll("strong").forEach((name) => {
        // The post detail card renders its original React badge immediately
        // after the author name. Never inject or alter badges in that card.
        if (name.closest(".post-detail")) return;
        if (hasVerifiedBadge(name)) return;
        const parent = name.parentElement;
        if (!parent || parent.classList.contains("notification-identity")) return;

        const href = parent.closest("a")?.getAttribute("href") ?? "";
        const usernameLine = Array.from(parent.children).find(
          (child) => child !== name && child.tagName === "SPAN"
        )?.textContent ?? "";
        const linkedUsername = href.startsWith("/profile/") ? decodeURIComponent(href.slice(9)) : "";
        const username = linkedUsername || (usernameLine.match(/@([A-Za-z0-9_]+)/)?.[1] ?? "");
        const color = byUsername.get(username);
        if (color) addBadge(name, color);
      });

      const ownProfileUsername = document.querySelector(".profile-username")?.textContent?.trim().replace(/^@/, "");
      if (ownProfileUsername) {
        const color = byUsername.get(ownProfileUsername);
        if (color) {
          const name = document.querySelector(".profile-username")?.previousElementSibling;
          if (name) addBadge(name, color);
        }
      }
    };

    const refreshVerifiedAccounts = async () => {
      const version = ++loadVersion;
      const accounts = await loadVerifiedAccounts(supabase);
      if (cancelled || version !== loadVersion) return;
      verifiedAccounts = accounts;
      apply();
    };

    // Fetch after the initial session is resolved. The root layout can remain
    // mounted across logout/login, so a one-time query may run while signed out.
    void supabase.auth.getSession().then(() => refreshVerifiedAccounts());

    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
        // Let Supabase finish its auth-state callback before issuing the data query.
        window.setTimeout(() => void refreshVerifiedAccounts(), 0);
      } else if (event === "SIGNED_OUT") {
        loadVersion += 1;
        verifiedAccounts = [];
      }
    });

    const observer = new MutationObserver(apply);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      cancelled = true;
      loadVersion += 1;
      observer.disconnect();
      authListener.subscription.unsubscribe();
    };
  }, []);

  return null;
}
