import type { Metadata } from "next";
import "./globals.css";
import "./profile-layout-fix.css";
import "./feed-fixes.css";
import "./gist-fixes.css";
import "./ui-fixes.css";
import "./voice-fixes.css";
import "./theme.css";
import "./action-theme-fixes.css";
import "./performance-fixes.css";
import "./formal-architecture.css";
import "./dark-mode-visibility-fix.css";
import VerifiedBadgeInjector from "@/components/VerifiedBadgeInjector";
import ThemeProvider from "@/components/ThemeProvider";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import FeedSessionTracker from "@/components/FeedSessionTracker";

export const metadata: Metadata = {
  title: "Gista",
  description: "Where people talk, share, connect, and belong. Every Post Starts a Conversation.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try { var savedTheme = localStorage.getItem("gista-theme"); if (savedTheme === "dark" || savedTheme === "light" || savedTheme === "system") { var resolvedTheme = savedTheme === "dark" ? "dark" : "light"; document.documentElement.dataset.theme = resolvedTheme; document.documentElement.style.colorScheme = resolvedTheme; } } catch (e) {}`,
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <VerifiedBadgeInjector />
          <AnalyticsTracker />
          <FeedSessionTracker />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
