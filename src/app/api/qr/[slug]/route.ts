import QRCode from "qrcode";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { demoBusiness } from "@/lib/demo-data";

export const dynamic = "force-static";

export function generateStaticParams() {
  return [{ slug: demoBusiness.slug }];
}

async function addCenterLogo(svg: string) {
  const match = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
  if (!match) return svg;

  const size = Number(match[1]);
  const center = size / 2;
  const whiteWidth = size * 0.27;
  const whiteHeight = size * 0.27;
  const logoWidth = size * 0.22;
  const logoHeight = size * 0.22;
  const logo = await readFile(path.join(process.cwd(), "public", "brands", "yorkshire-roofing-icon.png"));
  const dataUrl = `data:image/png;base64,${logo.toString("base64")}`;
  const mark = `<g aria-label="${demoBusiness.name} icon"><rect x="${center - whiteWidth / 2}" y="${center - whiteHeight / 2}" width="${whiteWidth}" height="${whiteHeight}" rx="3" fill="#fff"/><image href="${dataUrl}" x="${center - logoWidth / 2}" y="${center - logoHeight / 2}" width="${logoWidth}" height="${logoHeight}" preserveAspectRatio="xMidYMid meet"/></g>`;
  return svg.replace("</svg>", `${mark}</svg>`);
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const appOrigin = process.env.NEXT_PUBLIC_APP_URL ?? "http://127.0.0.1:3000";
  const target = `${appOrigin}/r/${encodeURIComponent(slug)}?src=qr`;
  const rawSvg = await QRCode.toString(target, {
    type: "svg",
    width: 600,
    margin: 4,
    errorCorrectionLevel: "H",
    color: { dark: "#101a31", light: "#ffffff" },
  });

  return new Response(await addCenterLogo(rawSvg), {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=300, stale-while-revalidate=86400",
      "Content-Disposition": `inline; filename="${slug}-review-qr.svg"`,
    },
  });
}
