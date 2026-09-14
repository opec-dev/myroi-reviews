import QRCode from "qrcode";
import { ConvexHttpClient } from "convex/browser";
import { makeFunctionReference } from "convex/server";
import { demoBusiness } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return [{ slug: demoBusiness.slug }];
}

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const appOrigin = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;
  let targetUrl = new URL(`/r/${encodeURIComponent(slug)}`, appOrigin);
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (convexUrl) {
    try {
      const data = await new ConvexHttpClient(convexUrl).query(
        makeFunctionReference<"query">("businesses:publicLinkBySlug"),
        { slug },
      ) as null | { publicReviewPageUrl?: string };
      if (data?.publicReviewPageUrl) targetUrl = new URL(data.publicReviewPageUrl);
    } catch {
      // Keep QR codes usable on the hosted funnel if client configuration is unavailable.
    }
  }
  targetUrl.searchParams.set("src", "qr");
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
    },
  });
}
