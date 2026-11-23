import { NextResponse, type NextRequest } from "next/server";

/** Vérification optimiste : redirige vers la connexion si aucun cookie de session. */
export function proxy(request: NextRequest) {
  const hasSession = request.cookies.has("hf_session");
  if (!hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/connexion";
    url.search = `?next=${encodeURIComponent(request.nextUrl.pathname + request.nextUrl.search)}`;
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/espace/:path*", "/admin/:path*"],
};
