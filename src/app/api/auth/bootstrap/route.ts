import { withAuth } from "@workos-inc/authkit-nextjs";
import { ConvexHttpClient } from "convex/browser";
import { NextResponse } from "next/server";
import { api } from "../../../../../convex/_generated/api";

export async function POST() {
  try {
    const { user, accessToken } = await withAuth({ ensureSignedIn: true });
    const provisioningSecret = process.env.ANALYTICS_INGEST_SECRET;
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!provisioningSecret || !convexUrl) {
      return NextResponse.json({ error: "Provisioning is not configured." }, { status: 503 });
    }

    const convex = new ConvexHttpClient(convexUrl);
    convex.setAuth(accessToken);
    await convex.mutation(api.accounts.syncCurrentUserFromServer, {
      email: user.email,
      displayName: [user.firstName, user.lastName].filter(Boolean).join(" ") || undefined,
      provisioningSecret,
    });
    return NextResponse.json({ provisioned: true });
  } catch (error) {
    console.error("Account provisioning failed", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Account provisioning failed." }, { status: 401 });
  }
}
