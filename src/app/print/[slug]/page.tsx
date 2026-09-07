import { demoBusiness } from "@/lib/demo-data";

export function generateStaticParams() {
  return [{ slug: demoBusiness.slug }];
}

export default async function PrintCardPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const qrSuffix = process.env.STATIC_EXPORT === "true" ? ".svg" : "";

  return (
    <main className="print-page">
      <section className="review-card" aria-label={`${demoBusiness.name} review request card`}>
        <div className="review-card-grid">
          <div className="review-card-copy">
            <img src={demoBusiness.logoUrl} alt={`${demoBusiness.name} logo`} />
            <h1>How was your experience?</h1>
            <p>Scan to share your feedback. Your review helps local homeowners choose with confidence.</p>
            <div className="contact-line">{demoBusiness.phone} · yorkshireroofing.com</div>
          </div>
          <div className="card-qr">
            <img src={`/api/qr/${slug}${qrSuffix}`} alt="QR code to leave a review" />
            <strong>Scan to review</strong>
            <small>Google · Yelp · Diamond Certified</small>
          </div>
        </div>
      </section>
    </main>
  );
}
