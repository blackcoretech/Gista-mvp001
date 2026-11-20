"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Listener = (verified: boolean) => void;
const listeners = new Map<string, Set<Listener>>();
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
    const listener: Listener = (next) => { if (active) { receivedLiveUpdate.current = true; setVerified(next); } };
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
        if (active && !error && !receivedLiveUpdate.current) setVerified(!!data);
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
