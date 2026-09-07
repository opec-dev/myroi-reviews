import Link from "next/link";
import { demoBusiness, demoDestinations } from "@/lib/demo-data";
import { ReviewDestinationChooser } from "@/components/review-destination-chooser";

export function generateStaticParams() {
  return [{ slug: demoBusiness.slug }];
}

export default async function ReviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return (
    <main className="public-page">
      <section className="review-funnel">
        <div className="logo-lockup"><img src={demoBusiness.logoUrl} alt={`${demoBusiness.name} logo`} /></div>
        <div className="success-mark">♥</div>
        <p className="eyebrow">Thank you for choosing us</p>
        <h1>Where would you like to share your experience?</h1>
        <p>Your feedback helps neighbors choose a business they can trust.</p>
        <ReviewDestinationChooser initialDestinations={demoDestinations} />
        <Link className="quiet-link" href={`/reviews/${slug}`}>Read what customers are saying</Link>
      </section>
    </main>
  );
}
