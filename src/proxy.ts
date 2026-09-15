import { authkitProxy } from "@workos-inc/authkit-nextjs";
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import { WORKOS_REDIRECT_URI } from "@/lib/auth-config";

const securedProxy = authkitProxy({
  redirectUri: WORKOS_REDIRECT_URI,
  middlewareAuth: { enabled: true, unauthenticatedPaths: ["/login"] },
});

export default function proxy(request: NextRequest, event: NextFetchEvent) {
  const configured = Boolean(process.env.WORKOS_CLIENT_ID && process.env.WORKOS_API_KEY && process.env.WORKOS_COOKIE_PASSWORD);
  if (!configured) return NextResponse.redirect(new URL("/login", request.url));
  return securedProxy(request, event);
}
export const config = { matcher: ["/", "/admin/:path*", "/client/:path*", "/api/admin/:path*", "/api/email-status"] };
