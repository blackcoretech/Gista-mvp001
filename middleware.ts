import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const protectedPaths = ["/create", "/profile", "/settings", "/notifications", "/saved"];
  const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path));
  const isPostPath = pathname.startsWith("/post/");
  const isLegacyGistPath = pathname.startsWith("/gist/");
  const isAuthPath = pathname === "/auth";

  // Most Gista routes are public and do not need a server-side auth lookup.
  // Avoid a Supabase network request on ordinary page navigation; retain the
  // existing verified-user check on every route that actually needs it.
  if (!isProtectedPath && !isPostPath && !isLegacyGistPath && !isAuthPath) {
    return NextResponse.next({ request });
  }

  if (isLegacyGistPath) {
    const postId = pathname.split("/")[2];
    return NextResponse.redirect(new URL(`/post/${postId ?? ""}${request.nextUrl.search}`, request.url));
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user && isPostPath) {
    const authUrl = new URL("/auth", request.url);
    authUrl.searchParams.set("returnTo", `${pathname}${request.nextUrl.search}${request.nextUrl.hash}`);
    return NextResponse.redirect(authUrl);
  }

  if (!user && isProtectedPath) return NextResponse.redirect(new URL("/auth", request.url));
  if (user && isAuthPath) return NextResponse.redirect(new URL("/", request.url));
  return response;
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
