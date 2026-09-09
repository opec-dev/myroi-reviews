export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({
    smtpPasswordConfigured: Boolean(process.env.SMTP_PASSWORD),
    alertSmtpPasswordConfigured: Boolean(process.env.ALERT_SMTP_PASSWORD),
  });
}
