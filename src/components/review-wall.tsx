"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ProviderBadge } from "@/components/provider-badge";

export function ReviewWall({ slug, preview }: { slug: string; preview: boolean }) {
  const data = useQuery(api.reviews.publicBySlug, { slug });
  if (data === undefined) return <main className="review-wall-page"><div className="empty-state">Loading reviews…</div></main>;
  if (!data) return <main className="review-wall-page"><div className="empty-state">This review wall is not published.</div></main>;
  const background = data.settings?.wallBackgroundColor || "#f7f8fb";
  const showDates = data.settings?.showReviewDates ?? true;
  return (
    <main className="review-wall-page" style={{ "--wall-background": background } as CSSProperties}>
      {preview && <Link className="preview-back" href={`/client/${slug}#reviews`}>← Back to client dashboard</Link>}
      <header className="review-wall-header">
        <div className="logo-lockup"><img src={data.business.logoUrl ?? "/brands/yorkshire-roofing.png"} alt={`${data.business.name} logo`} /></div>
        <div><span className="stars wall-header-stars">★★★★★</span><strong>Trusted by our customers</strong></div>
      </header>
      <section className="review-wall">
        {data.reviews.map(review => (
          <article className="wall-review" key={review._id}>
            <div className="review-meta">
              <span className="stars">{"★".repeat(review.rating)}</span>
              <span className="review-provider"><ProviderBadge provider={review.sourceProvider} label={review.sourceLabel} iconUrl={data.providerIcons[review.sourceProvider]} size="small" />{review.sourceLabel}</span>
            </div>
            <blockquote>“{review.excerpt}”</blockquote>
            <div className="review-author-line">
              <span className="reviewer-avatar">{review.reviewerName.slice(0, 1)}</span>
              <span><strong>{review.reviewerName}</strong>{showDates && review.reviewDate && <time>{formatDate(review.reviewDate)}</time>}</span>
            </div>
            {review.sourceUrl && <a href={review.sourceUrl} target="_blank" rel="noopener noreferrer">View original review ↗</a>}
          </article>
        ))}
        {!data.reviews.length && <div className="empty-state">No published reviews yet.</div>}
      </section>
    </main>
  );
}

function formatDate(value: string) {
  const date = new Date(value.length === 10 ? `${value}T12:00:00` : value);
  return Number.isNaN(date.valueOf()) ? value : new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date);
}
