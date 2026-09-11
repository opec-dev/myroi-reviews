import { NextResponse } from "next/server";
import { createSmtpTransport, loadEmailConfiguration } from "@/lib/smtp";
import { persistEmailLog } from "@/lib/server-events";
import { withAuth } from "@workos-inc/authkit-nextjs";

export async function POST(request: Request) {
  try { const {user}=await withAuth({ensureSignedIn:true});const admins=(process.env.PLATFORM_ADMIN_EMAILS??"").split(",").map(value=>value.trim().toLowerCase());if(!admins.includes(user.email.toLowerCase()))return NextResponse.json({error:"Administrator access required."},{status:403}); }
  catch { return NextResponse.json({error:"Secure administrator sign-in is required."},{status:401}); }
  const requestOrigin = request.headers.get("origin");
  if (requestOrigin && requestOrigin !== new URL(request.url).origin) {
    return NextResponse.json({ error: "Cross-site SMTP tests are not allowed." }, { status: 403 });
  }

  const {primary}=await loadEmailConfiguration().catch(()=>({primary:null}));
  const recipient = primary?.testRecipient??"";
  const subject = "myROI Reviews SMTP test";
  if (!primary || !recipient) {
    const missing = [...(!primary?["saved SMTP credentials"]:[]),...(!recipient?["test recipient"]:[])];
    await logTest({ status: "not_sent", recipient, subject, error: `Missing: ${missing.join(", ")}` });
    return NextResponse.json({ error: "SMTP test is not fully configured.", missing }, { status: 503 });
  }

  try {
    const transport = createSmtpTransport(primary);
    await transport.verify();
    const result = await transport.sendMail({
      from: { name: primary.fromName, address: primary.fromEmail },
      to: recipient,
      subject,
      text: `The myROI Reviews Worker connected to the master email service and sent this test successfully.\n\nTime: ${new Date().toISOString()}`,
    });
    await logTest({ status: "sent", recipient, subject });
    return NextResponse.json({ sent: true, recipient: maskEmail(recipient), messageId: result.messageId });
  } catch (error) {
    const problem = sanitizeSmtpError(error);
    await logTest({ status: "failed", recipient, subject, error: problem });
    return NextResponse.json({ sent: false, recipient: maskEmail(recipient), error: problem }, { status: 502 });
  }
}

async function logTest(input: { status: "sent" | "not_sent" | "failed"; recipient: string; subject: string; error?: string }) {
  try { await persistEmailLog({ ...input, kind: "smtp_test", occurredAt: Date.now() }); } catch { /* Diagnostics must still be returned when logging is unavailable. */ }
}

function maskEmail(value: string) {
  const [name, domain] = value.split("@");
  if (!domain) return "configured recipient";
  return `${name.slice(0, 2)}***@${domain}`;
}

function sanitizeSmtpError(error: unknown) {
  if (!(error instanceof Error)) return "SMTP connection or delivery failed.";
  return error.message.replace(/(pass(?:word)?|token|secret)=?\s*[^\s,;]+/gi, "$1=[redacted]").slice(0, 500);
}
