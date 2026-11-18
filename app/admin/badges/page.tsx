"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import "./badges.css";

type Role = "owner" | "admin";
type Person = { id: string; username: string | null; display_name: string | null; is_verified?: boolean; verification_type?: string | null };
type BadgeType = "team" | "business";
type BadgeRow = { user_id: string; badge_type: BadgeType; granted_at: string };

const purple = "#7c3aed";

export default function AdminBadgesPage() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Person[]>([]);
  const [badges, setBadges] = useState<BadgeRow[]>([]);
  const [selected, setSelected] = useState<Person | null>(null);
  const [badgeType, setBadgeType] = useState<BadgeType>("team");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const requestId = useRef(0);

  const loadBadges = useCallback(async () => {
    const { data, error: loadError } = await supabase.from("account_badges").select("user_id,badge_type,granted_at").order("granted_at", { ascending: false });
    if (loadError) setError("Could not load official badges: " + loadError.message);
    else setBadges((data ?? []) as BadgeRow[]);
  }, [supabase]);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!active) return;
      if (!user) { router.replace("/auth?returnTo=%2Fadmin%2Fbadges"); return; }
      const { data: admin, error: adminError } = await supabase.from("gista_admins").select("role").eq("user_id", user.id).maybeSingle();
      if (!active) return;
      if (adminError || !admin || !["owner", "admin"].includes(admin.role)) { setLoading(false); return; }
      setRole(admin.role as Role);
      await loadBadges();
      if (active) setLoading(false);
    })();
    return () => { active = false; };
  }, [supabase, router, loadBadges]);

  const searchUsers = useCallback(async (value: string) => {
    const q = value.trim();
    const id = ++requestId.current;
    if (!q || !role) { setResults([]); return; }
    setBusy(true); setError("");
    const { data, error: searchError } = await supabase.rpc("admin_search_verification_users", { search_query: q });
    if (id !== requestId.current) return;
    if (searchError) setError("Could not search users: " + searchError.message);
    else setResults((data ?? []) as Person[]);
    setBusy(false);
  }, [supabase, role]);

  useEffect(() => {
    if (!role) return;
    const value = query.trim();
    if (!value) { requestId.current++; setResults([]); return; }
    const timer = window.setTimeout(() => void searchUsers(value), 250);
    return () => window.clearTimeout(timer);
  }, [query, role, searchUsers]);

  async function saveBadge() {
    if (!selected || !role) return;
    setBusy(true); setError(""); setMessage("");
    const { error: saveError } = await supabase.from("account_badges").upsert({
      user_id: selected.id, badge_type: badgeType,
    }, { onConflict: "user_id" });
    if (saveError) setError("Could not assign badge. Confirm the account_badges migration has been applied. " + saveError.message);
    else { setMessage((badgeType === "team" ? "Purple Star assigned" : "Purple Diamond assigned") + " to @" + (selected.username || selected.display_name || "user") + "."); setSelected(null); await loadBadges(); }
    setBusy(false);
  }

  async function revokeBadge(userId: string) {
    if (!role || !confirm("Revoke this official account badge?")) return;
    setBusy(true); setError(""); setMessage("");
    const { error: revokeError } = await supabase.from("account_badges").delete().eq("user_id", userId);
    if (revokeError) setError("Could not revoke badge: " + revokeError.message);
    else { setMessage("Official badge revoked."); await loadBadges(); }
    setBusy(false);
  }

  if (loading) return <main className="gista-badges-page"><p>Loading secure badge settings…</p></main>;
  if (!role) return <main className="gista-badges-page"><section className="gb-denied"><h1>Private area</h1><p>This account is not authorised to manage Gista badges.</p><Link href="/admin">Return to Admin</Link></section></main>;

  return <main className="gista-badges-page">
    <header className="gb-header"><Link href="/admin" className="gb-brand"><span>G</span> Gista <small>ADMIN</small></Link><div><b>{role === "owner" ? "Founder / Owner" : "Administrator"}</b><Link href="/admin">Dashboard</Link><Link href="/admin/verification">User verification</Link></div></header>
    <div className="gb-container">
      <p className="gb-eyebrow">POPULARITY & VERIFICATION</p><h1>Account badges</h1>
      <p className="gb-intro">Manage Gista’s three account identities. Badges represent official status, not popularity or follower count.</p>
      <div className="gb-types">
        <article><span className="gb-star" aria-label="Gista Team star">★</span><div><strong>Gista Team</strong><small>Purple Star · Founder, executives and official team members.</small></div></article>
        <article><span className="gb-tick" aria-label="Verified user tick">✓</span><div><strong>Verified User</strong><small>Purple Tick · Existing identity and public-figure verification workflow.</small><Link href="/admin/verification">Review or revoke user verification →</Link></div></article>
        <article><span className="gb-diamond" aria-label="Verified business diamond">◆</span><div><strong>Verified Business</strong><small>Purple Diamond · Businesses officially reviewed by Gista.</small></div></article>
      </div>
      <section className="gb-panel">
        <h2>Assign an official badge</h2><label htmlFor="gb-search">Find a Gista account</label>
        <input id="gb-search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search username or display name…" />
        {results.length > 0 && <div className="gb-results">{results.map(person => <button key={person.id} className={selected?.id === person.id ? "selected" : ""} onClick={() => setSelected(person)}><span><strong>{person.display_name || "Gista user"}</strong><small>@{person.username || "no-username"} · {person.id.slice(0,8)}</small></span><span>{selected?.id === person.id ? "Selected" : "Select"}</span></button>)}</div>}
        {selected && <div className="gb-assignment"><strong>Selected: {selected.display_name || "Gista user"} (@{selected.username || "no-username"})</strong><label htmlFor="gb-type">Badge type</label><select id="gb-type" value={badgeType} onChange={e => setBadgeType(e.target.value as BadgeType)}><option value="team">★ Gista Team — Purple Star</option><option value="business">◆ Verified Business — Purple Diamond</option></select><button disabled={busy} onClick={() => void saveBadge()}>{busy ? "Saving…" : "Assign badge"}</button></div>}
      </section>
      {message && <p className="gb-message">{message}</p>}{error && <p className="gb-error">{error}</p>}
      <section className="gb-panel"><h2>Current official badges <small>{badges.length}</small></h2>
        {badges.length === 0 ? <p className="gb-muted">No Gista Team or business badges assigned yet.</p> : badges.map(row => <article className="gb-roster" key={row.user_id}><div><strong>{row.badge_type === "team" ? "★ Gista Team" : "◆ Verified Business"}</strong><small>Account ID: {row.user_id.slice(0,8)} · Granted {new Date(row.granted_at).toLocaleDateString()}</small></div><button disabled={busy} onClick={() => void revokeBadge(row.user_id)}>Revoke</button></article>)}
      </section>
      <p className="gb-footnote">The purple tick remains governed by the existing verification review process. The Star and Diamond are separately assigned official account badges.</p>
    </div>
  </main>;
}
