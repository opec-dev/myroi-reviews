import { publicSmtpStatus } from "@/lib/smtp";

export const dynamic = "force-dynamic";

export function GET() {
  return Response.json(publicSmtpStatus());
}
