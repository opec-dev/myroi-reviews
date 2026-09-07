import { getWorkOS, withAuth } from "@workos-inc/authkit-nextjs";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { user } = await withAuth({ ensureSignedIn: true });
  if (user.email.toLowerCase() !== "support-team@myroiagency.com") {
    return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
  }
  const body = await request.json() as { email?: string; businessName?: string };
  const email = body.email?.trim().toLowerCase();
  const businessName = body.businessName?.trim();
  if (!email || !businessName) return NextResponse.json({ error: "Business name and owner email are required." }, { status: 400 });
  try {
    const invitation = await getWorkOS().userManagement.sendInvitation({ email, expiresInDays: 14 });
    return NextResponse.json({ invitationId: invitation.id });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "The invitation could not be created." }, { status: 502 });
  }
}
