import { NextRequest, NextResponse } from "next/server";

const RESERVED = new Set(["www", "app", "admin", "api", "localhost"]);

function getSubdomain(host: string | null): string | null {
  if (!host) return null;
  const hostname = host.split(":")[0];
  const root = (process.env.ROOT_DOMAIN || "localhost:3000").split(":")[0];

  if (hostname === root || hostname === "localhost" || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
    return null;
  }
  // strip root domain suffix
  if (hostname.endsWith("." + root)) {
    const sub = hostname.slice(0, -(root.length + 1));
    if (sub && !RESERVED.has(sub)) return sub;
  }
  // generic: first label if there are 3+ labels
  const parts = hostname.split(".");
  if (parts.length >= 3 && !RESERVED.has(parts[0])) return parts[0];
  return null;
}

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const host = req.headers.get("host");
  const sub = getSubdomain(host);

  // --- Subdomain-based public menu rewrite ---
  if (sub) {
    // pizzax.qrmenu.com/menu/<slug> -> /m/pizzax/<slug>
    if (url.pathname === "/" || url.pathname === "") {
      return NextResponse.rewrite(new URL(`/m/${sub}`, req.url));
    }
    if (url.pathname.startsWith("/menu/")) {
      const slug = url.pathname.replace("/menu/", "");
      return NextResponse.rewrite(new URL(`/m/${sub}/${slug}`, req.url));
    }
    // allow assets / api / m routes through
    return NextResponse.next();
  }

  // --- Auth guards (lightweight cookie presence; full verify in layouts) ---
  const hasSession = Boolean(req.cookies.get("qrm_session")?.value);

  if (url.pathname.startsWith("/admin") && url.pathname !== "/admin/login") {
    if (!hasSession) return NextResponse.redirect(new URL("/admin/login", req.url));
  }
  if (
    url.pathname.startsWith("/business") &&
    !["/business/login"].includes(url.pathname) &&
    !url.pathname.startsWith("/business/onboarding")
  ) {
    if (!hasSession) return NextResponse.redirect(new URL("/business/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icons|sw.js|manifest.webmanifest).*)"],
};
