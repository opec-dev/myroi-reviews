import Link from "next/link";
import { demoBusiness, demoDestinations, demoReviews } from "@/lib/demo-data";

const appOrigin = process.env.NEXT_PUBLIC_APP_URL ?? "http://127.0.0.1:3000";
const staticExport = process.env.STATIC_EXPORT === "true";
const installCode = `<script async src="${appOrigin}/widget/yorkshire-roofing${staticExport ? ".js" : ""}"></script>`;

export default function DashboardPage() {
  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand-mark"><span>★</span> myROI Reviews</div>
        <nav>
          <a className="active" href="#overview">Overview</a>
          <a href="#destinations">Review sites</a>
          <a href="#reviews">Published reviews</a>
          <a href="#embeds">Website embeds</a>
          <a href="#qr">QR & print card</a>
        </nav>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div className="business-avatar"><img src={demoBusiness.logoUrl} alt="" /></div>
          <div><strong>{demoBusiness.name}</strong><small>Demo workspace</small></div>
        </header>

        <div className="content">
          <div className="eyebrow">MVP workspace</div>
          <h1>Turn every good experience into visible trust.</h1>
          <p className="lede">Connect review destinations, share one branded link, and publish selected reviews on the business website.</p>

          <section id="overview" className="hero-card">
            <div>
              <span className="status">Ready to share</span>
              <h2>Your branded review link</h2>
              <code>{appOrigin}/r/{demoBusiness.slug}/</code>
              <div className="actions">
              <Link className="button primary" href={demoBusiness.reviewUrl}>Preview review page</Link>
              <Link className="button" href={`/reviews/${demoBusiness.slug}`}>Preview review wall</Link>
              <Link className="button" href={`/print/${demoBusiness.slug}`}>Preview print card</Link>
              </div>
            </div>
            <div className="qr-placeholder">
              <img className="qr-image" src={`/api/qr/${demoBusiness.slug}${staticExport ? ".svg" : ""}`} alt={`QR code for ${demoBusiness.name} review page`} />
              <small>Logo-centered QR</small>
            </div>
          </section>

          <div className="metric-grid">
            <article><span>Review destinations</span><strong>{demoDestinations.length}</strong><small>All enabled</small></article>
            <article><span>Published reviews</span><strong>{demoReviews.length}</strong><small>Ready for embeds</small></article>
            <article><span>Website displays</span><strong>2</strong><small>Popup + review wall</small></article>
          </div>

          <section id="destinations" className="panel">
            <div className="section-heading"><div><span className="eyebrow">Where reviews happen</span><h2>Review destinations</h2></div><button className="button primary">Add destination</button></div>
            <div className="destination-list">
              {demoDestinations.map((destination) => (
                <div className="destination" key={destination.id}>
                  <span className="source-icon" style={{ background: destination.color }}>{destination.name[0]}</span>
                  <div><strong>{destination.name}</strong><small>{destination.reviewUrl}</small></div>
                  <span className="enabled">Enabled</span>
                </div>
              ))}
            </div>
          </section>

          <section id="reviews" className="panel">
            <div className="section-heading"><div><span className="eyebrow">Curated social proof</span><h2>Published reviews</h2></div><button className="button">Import CSV</button></div>
            <div className="review-row-grid">
              {demoReviews.map((review) => (
                <article className="mini-review" key={review.id}>
                  <span className="stars">★★★★★</span>
                  <p>“{review.excerpt}”</p>
                  <small>{review.reviewer} · {review.source}</small>
                </article>
              ))}
            </div>
          </section>

          <section id="embeds" className="panel">
            <span className="eyebrow">Install once</span><h2>Website embeds</h2>
            <div className="embed-grid">
              <article><strong>Rotating popup</strong><p>A compact review appears every 15 seconds and opens into a browsable panel.</p><code>{installCode}</code></article>
              <article><strong>Review wall</strong><p>A responsive review grid for a dedicated testimonials page.</p><code>{`<iframe src="${appOrigin}/reviews/${demoBusiness.slug}/" title="Customer reviews"></iframe>`}</code></article>
            </div>
          </section>

          <section id="qr" className="panel qr-download-panel">
            <div>
              <span className="eyebrow">Share offline</span><h2>QR & print card</h2>
              <p>The QR uses high error correction and a protected center mark so it remains scannable when branded.</p>
            </div>
            <a className="button primary" href={`/api/qr/${demoBusiness.slug}${staticExport ? ".svg" : ""}`} download={`${demoBusiness.slug}-review-qr.svg`}>Download vector QR</a>
          </section>
        </div>
      </section>
    </main>
  );
}
