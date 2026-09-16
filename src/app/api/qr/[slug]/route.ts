import QRCode from "qrcode";
import { demoBusiness } from "@/lib/demo-data";
import { APP_ORIGIN } from "@/lib/auth-config";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return [{ slug: demoBusiness.slug }];
}

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const targetUrl = new URL(`/go/${encodeURIComponent(slug)}`, APP_ORIGIN);
  const target = targetUrl.toString();
  const svg = await QRCode.toString(target, {
    type: "svg",
    width: 600,
    margin: 4,
    errorCorrectionLevel: "H",
    color: { dark: "#101a31", light: "#ffffff" },
  });

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "no-store",
      "Content-Disposition": `inline; filename="${slug}-review-qr.svg"`,
      "X-QR-Target": target,
    },
  });
}
