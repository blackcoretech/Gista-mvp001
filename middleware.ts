import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const pathname = request.nextUrl.pathname;
  const protectedPaths = ["/create", "/profile", "/settings", "/notifications", "/saved"];

  // Public routes do not need a server-side auth lookup. Keep the lookup for
  // routes whose redirects or access rules depend on the authenticated user.
  if (pathname.startsWith("/gist/")) {
    const postId = pathname.split("/")[2];
    return NextResponse.redirect(new URL(`/post/${postId ?? ""}${request.nextUrl.search}`, request.url));
  }

  const needsUser =
    pathname === "/auth" ||
    pathname.startsWith("/post/") ||
    protectedPaths.some((path) => pathname.startsWith(path));

  if (!needsUser) return response;

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

  if (!user && pathname.startsWith("/post/")) {
    const authUrl = new URL("/auth", request.url);
    authUrl.searchParams.set("returnTo", `${pathname}${request.nextUrl.search}${request.nextUrl.hash}`);
    return NextResponse.redirect(authUrl);
  }

  if (!user && protectedPaths.some((path) => pathname.startsWith(path))) return NextResponse.redirect(new URL("/auth", request.url));
  if (user && pathname === "/auth") return NextResponse.redirect(new URL("/", request.url));
  return response;
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
