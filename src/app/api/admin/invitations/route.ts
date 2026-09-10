import { getWorkOS, withAuth } from "@workos-inc/authkit-nextjs";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  let user;
  try {
    ({ user } = await withAuth({ ensureSignedIn: true }));
  } catch {
    return NextResponse.json({ error: "Secure administrator sign-in is required before an invitation can be emailed." }, { status: 401 });
  }
  const admins=(process.env.PLATFORM_ADMIN_EMAILS??"oliver@sicconsulting.com,support-team@myroiagency.com").split(",").map(value=>value.trim().toLowerCase());
  if (!admins.includes(user.email.toLowerCase())) {
    return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
  }
  const body = await request.json() as { action?: "send" | "resend" | "revoke"; email?: string; businessName?: string; invitationId?: string };
  const action = body.action ?? "send";
  try {
    if (action === "resend") {
      if (!body.invitationId) return NextResponse.json({ error: "The original invitation ID is missing." }, { status: 400 });
      const invitation = await getWorkOS().userManagement.resendInvitation(body.invitationId);
      return NextResponse.json({ invitationId: invitation.id, status: "sent" });
    }
    if (action === "revoke") {
      if (!body.invitationId) return NextResponse.json({ error: "The invitation ID is missing." }, { status: 400 });
      await getWorkOS().userManagement.revokeInvitation(body.invitationId);
      return NextResponse.json({ revoked: true });
    }
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : `The invitation could not be ${action === "resend" ? "resent" : "revoked"}.` }, { status: 502 });
  }
  const email = body.email?.trim().toLowerCase();
  const businessName = body.businessName?.trim();
  if (!email || !businessName) return NextResponse.json({ error: "Business name and owner email are required." }, { status: 400 });
  try {
    const invitation = await getWorkOS().userManagement.sendInvitation({ email, expiresInDays: 14 });
    return NextResponse.json({ invitationId: invitation.id, status: "sent" });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "The invitation could not be created." }, { status: 502 });
  }
}
