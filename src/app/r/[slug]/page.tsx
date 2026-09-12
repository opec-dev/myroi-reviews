import { demoBusiness } from "@/lib/demo-data";
import { ReviewFunnel } from "@/components/review-funnel";

export function generateStaticParams() {
  return [{ slug: demoBusiness.slug }];
}

export default async function ReviewPage({ params,searchParams }: { params: Promise<{ slug: string }>;searchParams:Promise<{preview?:string}> }) {
  const [{slug},query]=await Promise.all([params,searchParams]);
  return <ReviewFunnel slug={slug} preview={query.preview==="1"} />;
}
