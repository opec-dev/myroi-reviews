import { demoBusiness } from "@/lib/demo-data";
import { ReviewFunnel } from "@/components/review-funnel";

export function generateStaticParams() {
  return [{ slug: demoBusiness.slug }];
}

export default async function ReviewPage({ params }: { params: Promise<{ slug: string }> }) {
  await params;
  return <ReviewFunnel />;
}
