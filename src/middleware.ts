import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: ["/", "/posts/:path*"],
};

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  if (path.startsWith("/_next")) {
    return NextResponse.next();
  }

  const referrer = req.headers.get("referer");
  const searchParams = req.nextUrl.searchParams;

  const utm_source = searchParams.get("utm_source");
  const hasFbclid = searchParams.has("fbclid");

  const res = NextResponse.next();

  res.headers.set("x-referrer", referrer || "");
  res.headers.set("x-utm-source", utm_source || "");
  res.headers.set("x-has-fbclid", hasFbclid ? "true" : "");
  res.headers.set("x-path", req.nextUrl.pathname);

  return res;
}
