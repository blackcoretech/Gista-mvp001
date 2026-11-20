"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const HOME_FEED_POSITION_KEY = "gista:home-feed-position";

type SavedFeedPosition = {
  scrollY: number;
  postIndex: number;
  postTop: number;
};

export default function FeedScrollRestoration() {
  const pathname = usePathname();
  const previousPath = useRef(pathname);

  // Save the visible post before Next.js handles navigation away from Home.
  useEffect(() => {
    const saveBeforeProfileNavigation = (event: MouseEvent) => {
      if (pathname !== "/" || !(event.target instanceof Element)) return;
      const link = event.target.closest("a[href]");
      if (!(link instanceof HTMLAnchorElement)) return;

      let destination: URL;
      try {
        destination = new URL(link.href, window.location.href);
      } catch {
        return;
      }
      if (destination.origin !== window.location.origin || !destination.pathname.startsWith("/profile")) return;

      const articles = Array.from(document.querySelectorAll<HTMLElement>(".feed > article"));
      const visibleIndex = articles.findIndex((article) => article.getBoundingClientRect().bottom > 0);
      const visiblePost = visibleIndex >= 0 ? articles[visibleIndex] : null;
      const position: SavedFeedPosition = {
        scrollY: window.scrollY,
        postIndex: visibleIndex,
        postTop: visiblePost?.getBoundingClientRect().top ?? 0,
      };

      try {
        window.sessionStorage.setItem(HOME_FEED_POSITION_KEY, JSON.stringify(position));
      } catch {}
    };

    document.addEventListener("click", saveBeforeProfileNavigation, true);
    return () => document.removeEventListener("click", saveBeforeProfileNavigation, true);
  }, [pathname]);

  // Restore only when returning from a profile route. Wait until the same feed
  // cards have rendered so the saved post can be placed at its previous offset.
  useEffect(() => {
    const fromPath = previousPath.current;
    previousPath.current = pathname;
    if (pathname !== "/" || !fromPath?.startsWith("/profile")) return;

    let saved: SavedFeedPosition | null = null;
    try {
      const raw = window.sessionStorage.getItem(HOME_FEED_POSITION_KEY);
      if (raw) saved = JSON.parse(raw) as SavedFeedPosition;
    } catch {}
    if (!saved || !Number.isFinite(saved.scrollY)) return;

    let restored = false;
    const restore = () => {
      if (restored) return;
      const feed = document.querySelector(".feed");
      if (!feed) return;

      if (Number.isInteger(saved!.postIndex) && saved!.postIndex >= 0) {
        const articles = feed.querySelectorAll<HTMLElement>(":scope > article");
        const article = articles[saved!.postIndex];
        if (!article) return;
        const currentTop = article.getBoundingClientRect().top;
        window.scrollTo(0, Math.max(0, window.scrollY + currentTop - saved!.postTop));
      } else {
        window.scrollTo(0, saved!.scrollY);
      }

      restored = true;
      try {
        window.sessionStorage.removeItem(HOME_FEED_POSITION_KEY);
      } catch {}
      observer.disconnect();
    };

    const observer = new MutationObserver(() => requestAnimationFrame(restore));
    observer.observe(document.body, { childList: true, subtree: true });
    requestAnimationFrame(restore);

    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
