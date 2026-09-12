import { demoBusiness } from "@/lib/demo-data";
import { PrintCardPreview } from "@/components/print-card-preview";

export function generateStaticParams() {
  return [{ slug: demoBusiness.slug }];
}

export default async function PrintCardPage({ params,searchParams }: { params: Promise<{ slug: string }>;searchParams:Promise<{preview?:string}> }) {
  const [{ slug },query] = await Promise.all([params,searchParams]);
  const qrSuffix = process.env.STATIC_EXPORT === "true" ? ".svg" : "";

  return <main className="print-page">{query.preview==="1"&&<a className="preview-back" href={`/client/${slug}#print`}>← Back to client dashboard</a>}<PrintCardPreview slug={slug} qrSuffix={qrSuffix} /></main>;
}
