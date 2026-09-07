import { demoBusiness, demoReviews } from "@/lib/demo-data";

export function generateStaticParams() {
  return [{ slug: demoBusiness.slug }];
}

export default async function ReviewWallPage({ params }: { params: Promise<{ slug: string }> }) {
  await params;
  return (
    <main className="review-wall-page">
      <header className="review-wall-header">
        <div className="logo-lockup"><img src={demoBusiness.logoUrl} alt={`${demoBusiness.name} logo`} /></div>
        <div><span className="stars">★★★★★</span><strong>Trusted by local homeowners</strong></div>
      </header>
      <section className="review-wall">
        {demoReviews.map((review) => (
          <article className="wall-review" key={review.id}>
            <div className="review-meta"><span className="stars">★★★★★</span><span>{review.source}</span></div>
            <blockquote>“{review.excerpt}”</blockquote>
            <div><span className="reviewer-avatar">{review.reviewer.slice(0, 1)}</span><strong>{review.reviewer}</strong></div>
            <a href={review.sourceUrl} target="_blank" rel="noopener noreferrer">Read at the source ↗</a>
          </article>
        ))}
      </section>
    </main>
  );
}
