"use client";
import { createClient } from "@/lib/supabase/client";
import { browserStorage, clearFeedCache } from "@/lib/feed-cache";

const ACTIVE_FEED_USER_KEY = "gista:active-feed-user";

export async function signOut() {
  // Clear the login marker before ending the auth session. Home uses this marker
  // to distinguish a fresh login from an in-session route remount.
  try { window.sessionStorage.removeItem(ACTIVE_FEED_USER_KEY); } catch {}
  clearFeedCache(browserStorage());
  await createClient().auth.signOut();
  window.location.href = "/auth";
}