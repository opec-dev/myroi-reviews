import { demoBusiness } from "@/lib/demo-data";
import { PrintCardPreview } from "@/components/print-card-preview";

export function generateStaticParams() {
  return [{ slug: demoBusiness.slug }];
}

export default async function PrintCardPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const qrSuffix = process.env.STATIC_EXPORT === "true" ? ".svg" : "";

  return <main className="print-page"><PrintCardPreview slug={slug} qrSuffix={qrSuffix} /></main>;
}
