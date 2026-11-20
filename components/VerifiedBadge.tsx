"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Listener = (verified: boolean) => void;
const listeners = new Map<string, Set<Listener>>();
const VERIFICATION_CACHE_PREFIX = "gista:verified-account:";

// Read the last confirmed status synchronously so the badge can render in the
// same paint as the name. The database remains authoritative and refreshes it.
function readVerificationCache(profileId: string): boolean | null {
  if (typeof window === "undefined") return null;
  try {
    const cached = window.localStorage.getItem(VERIFICATION_CACHE_PREFIX + profileId);
    return cached === null ? null : cached === "1";
  } catch { return null; }
}

function writeVerificationCache(profileId: string, verified: boolean) {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(VERIFICATION_CACHE_PREFIX + profileId, verified ? "1" : "0"); } catch {}
}
let sharedChannel: ReturnType<ReturnType<typeof createClient>["channel"]> | null = null;
let sharedClient: ReturnType<typeof createClient> | null = null;

function getClient() {
  if (!sharedClient) sharedClient = createClient();
  return sharedClient;
}

function ensureVerificationChannel() {
  if (sharedChannel) return;
  const supabase = getClient();
  sharedChannel = supabase
    .channel("gista-verification-updates")
    .on("broadcast", { event: "verification-updated" }, ({ payload }) => {
      const profileId = typeof payload?.profile_id === "string" ? payload.profile_id : "";
      if (!profileId || typeof payload?.is_verified !== "boolean") return;
      writeVerificationCache(profileId, payload.is_verified);
      listeners.get(profileId)?.forEach((listener) => listener(payload.is_verified));
    })
    .subscribe();
}

export default function VerifiedBadge({ profileId }: { profileId: string }) {
  const [verified, setVerified] = useState(false);
  const receivedLiveUpdate = useRef(false);

  useEffect(() => {
    if (!profileId) return;
    let active = true;
    receivedLiveUpdate.current = false;
    const cachedStatus = readVerificationCache(profileId);
    if (cachedStatus !== null) setVerified(cachedStatus);
    const listener: Listener = (next) => { if (active) { receivedLiveUpdate.current = true; writeVerificationCache(profileId, next); setVerified(next); } };
    const group = listeners.get(profileId) ?? new Set<Listener>();
    group.add(listener);
    listeners.set(profileId, group);
    ensureVerificationChannel();

    void getClient()
      .from("verified_profiles")
      .select("profile_id")
      .eq("profile_id", profileId)
      .eq("verification_type", "official")
      .maybeSingle()
      .then(({ data, error }) => {
        if (active && !error && !receivedLiveUpdate.current) { const next = !!data; writeVerificationCache(profileId, next); setVerified(next); }
      });

    return () => {
      active = false;
      group.delete(listener);
      if (group.size === 0) listeners.delete(profileId);
    };
  }, [profileId]);

  if (!verified) return null;
  return (
    <span
      title="Verified account"
      aria-label="Verified account"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 13,
        height: 13,
        marginLeft: 3,
        marginRight: 3,
        borderRadius: "50%",
        background: "#6D28D9",
        color: "#fff",
        fontSize: 8,
        fontWeight: 800,
        lineHeight: 1,
        verticalAlign: "middle",
        flex: "0 0 auto",
      }}
    >
      ✓
    </span>
  );
}
