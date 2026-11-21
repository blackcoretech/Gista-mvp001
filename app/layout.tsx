import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./splash-theme.css";
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
import "./post-modal.css";
import "./auth-stationary.css";
import ThemeProvider from "@/components/ThemeProvider";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import FeedSessionTracker from "@/components/FeedSessionTracker";
import FeedScrollRestoration from "@/components/FeedScrollRestoration";

export const metadata: Metadata = {
  applicationName: "Gista",
  title: "Gista",
  description: "Where people talk, share, connect, and belong. Every Post Starts a Conversation.",
  icons: {
    icon: [{ url: "/icon", sizes: "512x512", type: "image/png" }],
    apple: [{ url: "/apple-icon", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    title: "Gista",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#17131f" },
  ],
};

export default function RootLayout({ children, modal }: { children: React.ReactNode; modal: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <script
          dangerouslySetInnerHTML={{
            __html: `try { var savedTheme = localStorage.getItem("gista-theme"); if (savedTheme === "dark" || savedTheme === "light" || savedTheme === "system") { var resolvedTheme = savedTheme === "dark" ? "dark" : "light"; document.documentElement.dataset.theme = resolvedTheme; document.documentElement.style.colorScheme = resolvedTheme; } } catch (e) {}`,
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <AnalyticsTracker />
          <FeedSessionTracker />
          <FeedScrollRestoration />
          {children}
          {modal}
        </ThemeProvider>
      </body>
    </html>
  );
}
