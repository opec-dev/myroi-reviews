import QRCode from "qrcode";
import { demoBusiness } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return [{ slug: demoBusiness.slug }];
}

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const appOrigin = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;
  const target = `${appOrigin}/r/${encodeURIComponent(slug)}?src=qr`;
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
      "Cache-Control": "public, max-age=300, stale-while-revalidate=86400",
      "Content-Disposition": `inline; filename="${slug}-review-qr.svg"`,
    },
  });
}
