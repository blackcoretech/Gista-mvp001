"use client";

import PostPage from "@/app/post/[id]/page";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PostModalPage() {
  const router = useRouter();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") router.back();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [router]);

  return (
    <div className="gista-post-modal-layer" role="presentation">
      <div className="gista-post-modal-panel" role="dialog" aria-modal="true" aria-label="Post">
        <PostPage />
      </div>
    </div>
  );
}
