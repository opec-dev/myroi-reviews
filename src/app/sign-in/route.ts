import { getSignInUrl } from "@workos-inc/authkit-nextjs";
import { redirect } from "next/navigation";
import { WORKOS_REDIRECT_URI } from "@/lib/auth-config";

export async function GET() {
  redirect(await getSignInUrl({ redirectUri: WORKOS_REDIRECT_URI, returnTo: "/admin" }));
}
