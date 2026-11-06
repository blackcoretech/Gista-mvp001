"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import styles from "./relationship.module.css";
import VoiceNote from "@/components/VoiceNote";

type Person = {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
};

type Profile = {
  id: string;
  username: string;
  display_name: string | null;
  is_private: boolean;
  following_private: boolean;
};

type UserComment = {
  id: string;
  body: string | null;
  content_type: string;
  media_url: string | null;
  voice_duration_seconds: number | null;
  created_at: string;
  post_id: string;
  posts: { id: string; body: string | null; created_at: string } | null;
};

async function countDistinctCommentedPosts(supabase: ReturnType<typeof createClient>, profileId: string) {
  const postIds = new Set<string>();
  const pageSize = 1000;
  let offset = 0;
  while (true) {
    const { data, error } = await supabase
      .from("responses")
      .select("post_id")
      .eq("author_id", profileId)
      .order("created_at", { ascending: true })
      .range(offset, offset + pageSize - 1);
    if (error) break;
    for (const row of data ?? []) if (row.post_id) postIds.add(row.post_id);
    if ((data ?? []).length < pageSize) break;
    offset += pageSize;
  }
  return postIds.size;
}

export default function RelationshipPage() {
  const { username, relationship } = useParams<{ username: string; relationship: string }>();
  const supabase = useMemo(() => createClient(), []);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [people, setPeople] = useState<Person[]>([]);
  const [comments, setComments] = useState<UserComment[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [privateList, setPrivateList] = useState(false);

  const kind = relationship === "following" ? "following" : relationship === "conversations" ? "conversations" : "followers";
  const title = kind === "following" ? "Following" : kind === "conversations" ? "Conversations" : "Followers";

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const { data: userData } = await supabase.auth.getUser();
      const { data: target, error: profileError } = await supabase
        .from("profiles")
        .select("id,username,display_name,is_private,following_private")
        .eq("username", username)
        .single();

      if (cancelled) return;
      if (profileError || !target) {
        setProfile(null);
        setLoading(false);
        return;
      }

      setProfile(target as Profile);
      const isOwner = userData.user?.id === target.id;

      if (kind === "conversations") {
        if (target.is_private && !isOwner) {
          setComments([]);
          setPrivateList(true);
          setLoading(false);
          return;
        }
        const [commentResult, conversationCount] = await Promise.all([
          supabase.from("responses")
            .select("id,body,content_type,media_url,voice_duration_seconds,created_at,post_id,posts!inner(id,body,created_at)")
            .eq("author_id", target.id)
            .order("created_at", { ascending: false })
            .limit(50),
          countDistinctCommentedPosts(supabase, target.id),
        ]);
        if (cancelled) return;
        setComments((commentResult.data ?? []) as unknown as UserComment[]);
        setCount(conversationCount);
        setPrivateList(Boolean(commentResult.error));
        setLoading(false);
        return;
      }

      const { data: statsData } = await supabase.rpc("get_profile_stats", { target_profile_id: target.id });
      const stats = statsData?.[0] as { followers?: number; following?: number } | undefined;
      const targetCount = kind === "following" ? Number(stats?.following ?? 0) : Number(stats?.followers ?? 0);
      setCount(targetCount);
      if (kind === "following" && target.following_private && !isOwner) {
        setPeople([]);
        setPrivateList(true);
        setLoading(false);
        return;
      }

      const rpcName = kind === "following" ? "get_profile_following" : "get_profile_followers";
      const { data, error } = await supabase.rpc(rpcName, { target_profile_id: target.id });
      if (cancelled) return;
      setPeople((data ?? []) as Person[]);
      setPrivateList(Boolean(error) || (target.is_private && !isOwner && !(data ?? []).length && targetCount > 0));
      setLoading(false);
    }
    void load();
    return () => { cancelled = true; };
  }, [supabase, username, kind]);

  if (loading) return <main className="content"><p>Loading {title.toLowerCase()}…</p></main>;
  if (!profile) return <main className="content"><p>Profile not found.</p></main>;

  return (
    <main className="profile-page">
      <header className="simple-header">
        <Link href={"/profile/" + profile.username}>‹ Profile</Link>
        <strong>{title}</strong>
        <span />
      </header>

      <section className={styles.page}>
        <div className={styles.heading}>
          <h1>{title}</h1>
          <span>{count}</span>
        </div>

        {privateList ? (
          <div className={styles.empty}>
            <h3>{kind === "following" ? "Following is private" : kind === "conversations" ? "Conversations are private" : "This list is private"}</h3>
            <p>{kind === "following" ? "This user has chosen to keep the people they follow private." : kind === "conversations" ? "Follow this account to see its conversation activity." : "Follow this account to see its followers."}</p>
          </div>
        ) : kind === "conversations" ? (
          comments.length === 0 ? (
            <div className={styles.empty}><h3>No conversations yet</h3><p>Comments this user has contributed will appear here.</p></div>
          ) : (
            <div className={styles.list}>
              {comments.map((comment) => (
                <article className={styles.person} key={comment.id} style={{ display: "block" }}>
                  <strong>Commented on a Gist</strong>
                  {comment.body && <p style={{ margin: "8px 0" }}>{comment.body}</p>}
                  {comment.content_type === "voice" && comment.media_url && <VoiceNote src={comment.media_url} durationHint={comment.voice_duration_seconds ?? undefined} />}
                  <Link href={"/post/" + comment.post_id}>View Gist{comment.posts?.body ? ": " + comment.posts.body.slice(0, 100) : ""}</Link>
                  <small style={{ display: "block", marginTop: 6 }}>{new Date(comment.created_at).toLocaleString()}</small>
                </article>
              ))}
            </div>
          )
        ) : people.length === 0 ? (
          <div className={styles.empty}>
            <h3>No {title.toLowerCase()} yet</h3>
            <p>There is nobody to show here yet.</p>
          </div>
        ) : (
          <div className={styles.list}>
            {people.map((person) => (
              <Link className={styles.person} href={"/profile/" + (person.username ?? "")} key={person.id}>
                <div className={styles.avatar}>
                  {person.avatar_url ? <img src={person.avatar_url} alt="" /> : (person.display_name?.[0]?.toUpperCase() ?? "G")}
                </div>
                <div>
                  <strong>{person.display_name ?? "Gista User"}</strong>
                  <span>@{person.username ?? "username"}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
