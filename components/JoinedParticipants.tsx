"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Person = { id: string; display_name: string | null; username: string | null; avatar_url: string | null };

export default function JoinedParticipants({ postId, participantCount, previewParticipants }: { postId: string; participantCount: number; previewParticipants: Person[] }) {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [people, setPeople] = useState<Person[]>([]);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const [myId, setMyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    let active = true;
    const load = async () => {
      setLoading(true); setError("");
      const { data: auth } = await supabase.auth.getUser();
      const currentUserId = auth.user?.id ?? null;
      if (active) setMyId(currentUserId);
      const { data: responseRows, error: responseError } = await supabase.from("responses").select("author_id,created_at").eq("post_id", postId).order("created_at", { ascending: true }).limit(1000);
      if (responseError) { if (active) { setError("Couldn’t load the people who joined. Please try again."); setLoading(false); } return; }
      const ids = [...new Set((responseRows ?? []).map((row) => String(row.author_id)))];
      if (!ids.length) { if (active) { setPeople([]); setFollowingIds(new Set()); setLoading(false); } return; }
      const { data: profiles, error: profilesError } = await supabase.from("profiles").select("id,display_name,username,avatar_url").in("id", ids);
      if (profilesError) { if (active) { setError("Couldn’t load participant profiles. Please try again."); setLoading(false); } return; }
      const byId = new Map((profiles ?? []).map((person) => [person.id, person as Person]));
      const ordered = ids.map((id) => byId.get(id)).filter((person): person is Person => Boolean(person));
      let followed = new Set<string>();
      if (currentUserId && ordered.length) {
        const { data: rows } = await supabase.from("follows").select("following_id").eq("follower_id", currentUserId).in("following_id", ordered.map((person) => person.id));
        followed = new Set((rows ?? []).map((row) => String(row.following_id)));
      }
      if (active) { setPeople(ordered); setFollowingIds(followed); setLoading(false); }
    };
    void load();
    return () => { active = false; };
  }, [open, postId, supabase]);

  async function toggleFollow(person: Person) {
    if (!myId) { setOpen(false); router.push("/auth"); return; }
    if (person.id === myId || busyId) return;
    setBusyId(person.id);
    const isFollowing = followingIds.has(person.id);
    const result = isFollowing
      ? await supabase.from("follows").delete().eq("follower_id", myId).eq("following_id", person.id)
      : await supabase.from("follows").insert({ follower_id: myId, following_id: person.id });
    if (!result.error) setFollowingIds((current) => {
      const next = new Set(current);
      if (isFollowing) next.delete(person.id); else next.add(person.id);
      return next;
    });
    setBusyId(null);
  }

  return <>
    <button type="button" className="gist-joined gist-joined-trigger" onClick={() => setOpen(true)} aria-label={"View " + participantCount + " people who joined this conversation"}>
      <span className="gist-joined-avatars">{previewParticipants.map((person) => <span className="gist-joined-avatar" key={person.id} title={person.display_name ?? person.username ?? "Participant"}>{person.avatar_url ? <img src={person.avatar_url} alt="" loading="lazy" /> : (person.display_name?.[0] ?? person.username?.[0] ?? "G").toUpperCase()}</span>)}</span>
      <span className="gist-joined-count">{participantCount.toLocaleString()} joined</span>
      <span className="gist-joined-hint">View people</span>
    </button>
    {open && <div className="joined-sheet-backdrop" onClick={() => setOpen(false)}>
      <section className="joined-sheet" role="dialog" aria-modal="true" aria-labelledby="joined-sheet-title" onClick={(event) => event.stopPropagation()}>
        <div className="joined-sheet-handle" />
        <header className="joined-sheet-header"><div><h2 id="joined-sheet-title">People in this conversation</h2><p>{participantCount.toLocaleString()} {participantCount === 1 ? "person has" : "people have"} joined</p></div><button type="button" className="joined-sheet-close" onClick={() => setOpen(false)} aria-label="Close"><X size={20} /></button></header>
        <div className="joined-sheet-list">
          {loading ? <p className="joined-sheet-state">Loading people…</p> : error ? <p className="joined-sheet-state">{error}</p> : people.length === 0 ? <p className="joined-sheet-state">No participants to show yet.</p> : people.map((person) => <div className="joined-person" key={person.id}>
            <Link className="joined-person-profile" href={person.username ? "/profile/" + person.username : "/profile"} onClick={() => setOpen(false)}>
              <span className="joined-person-avatar">{person.avatar_url ? <img src={person.avatar_url} alt="" /> : (person.display_name?.[0] ?? person.username?.[0] ?? "G").toUpperCase()}</span>
              <span className="joined-person-copy"><strong>{person.display_name ?? "Gista User"}</strong><span>@{person.username ?? "user"}</span></span>
            </Link>
            {person.id !== myId && <button type="button" className={followingIds.has(person.id) ? "joined-follow-button is-following" : "joined-follow-button"} onClick={() => void toggleFollow(person)} disabled={busyId === person.id}>{busyId === person.id ? "…" : followingIds.has(person.id) ? "Following" : "Follow"}</button>}
          </div>)}
        </div>
      </section>
    </div>}
  </>;
}
