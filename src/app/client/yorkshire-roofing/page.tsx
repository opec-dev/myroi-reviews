import Link from "next/link";
import { BusinessBrandingSettings } from "@/components/business-branding-settings";
import { DestinationManager } from "@/components/destination-manager";
import { FunnelSettingsEditor } from "@/components/funnel-settings";
import { PrintCardSettingsEditor } from "@/components/print-card-settings";
import { ClientAnalytics } from "@/components/analytics-dashboard";
import { ClientNotificationSettingsEditor } from "@/components/client-notification-settings";
import { demoBusiness, demoDestinations, demoReviews } from "@/lib/demo-data";

const appOrigin=process.env.NEXT_PUBLIC_APP_URL??"http://127.0.0.1:3000";
const staticExport=process.env.STATIC_EXPORT==="true";

export default function ClientWorkspace(){
  const installCode=`<script async src="${appOrigin}/widget/${demoBusiness.slug}${staticExport?".js":""}"></script>`;
  return <main className="app-shell">
    <aside className="sidebar"><a className="platform-brand" href="/"><img src="/brands/myroiagency-logo.png" alt=""/><strong>myROIagency</strong><span>Reviews</span></a><nav><a className="active" href="#overview">Overview</a><a href="#analytics">Activity & analytics</a><a href="#notifications">Email notifications</a><a href="#branding">Branding</a><a href="#destinations">Review sites</a><a href="#funnel">Review funnel</a><a href="#reviews">Published reviews</a><a href="#embeds">Website embeds</a><a href="#print">QR & print card</a><Link className="admin-nav-link" href="/">← Reseller dashboard</Link></nav></aside>
    <section className="workspace"><header className="topbar"><div className="business-avatar"><img src={demoBusiness.logoUrl} alt=""/></div><div><strong>{demoBusiness.name}</strong><small>Client workspace · powered by myROIagency</small></div></header><div className="content"><div className="eyebrow">Client workspace</div><h1>Turn every good experience into visible trust.</h1><p className="lede">Connect review destinations, share one branded link, and publish selected reviews on the business website.</p>
      <section id="overview" className="hero-card"><div><span className="status">Ready to share</span><h2>Your branded review link</h2><code>{appOrigin}/r/{demoBusiness.slug}/</code><div className="actions"><Link className="button primary" href={demoBusiness.reviewUrl}>Preview review page</Link><Link className="button" href={`/reviews/${demoBusiness.slug}`}>Preview review wall</Link><Link className="button" href={`/print/${demoBusiness.slug}`}>Preview print card</Link></div></div><div className="qr-placeholder"><div className="qr-art dashboard-qr"><img className="qr-image" src={`/api/qr/${demoBusiness.slug}${staticExport?".svg":""}`} alt="Review QR with business icon"/></div><small>Square icon centered in QR</small></div></section>
      <div className="metric-grid"><article><span>Review destinations</span><strong>{demoDestinations.filter(x=>x.enabled).length}</strong><small>Google + Yelp active</small></article><article><span>Published reviews</span><strong>{demoReviews.length}</strong><small>Ready for embeds</small></article><article><span>Website displays</span><strong>2</strong><small>Popup + review wall</small></article></div>
      <section id="analytics" className="panel"><div className="section-heading"><div><span className="eyebrow">Client reporting</span><h2>Activity & analytics</h2></div></div><p className="panel-intro">Track the funnel from first visit through QR scans, form completions, and review-site clicks.</p><ClientAnalytics businessSlug={demoBusiness.slug}/></section>
      <section id="notifications" className="panel"><ClientNotificationSettingsEditor/></section>
      <section id="branding" className="panel"><BusinessBrandingSettings/></section>
      <section id="destinations" className="panel"><DestinationManager initialDestinations={demoDestinations}/></section>
      <section id="funnel" className="panel"><FunnelSettingsEditor/></section>
      <section id="reviews" className="panel"><div className="section-heading"><div><span className="eyebrow">Curated social proof</span><h2>Published reviews</h2></div><button className="button">Import CSV</button></div><div className="review-row-grid">{demoReviews.map(review=><article className="mini-review" key={review.id}><span className="stars">★★★★★</span><p>“{review.excerpt}”</p><small>{review.reviewer} · {review.source}</small></article>)}</div></section>
      <section id="embeds" className="panel"><span className="eyebrow">Install once</span><h2>Website embeds</h2><div className="embed-grid"><article><strong>Rotating popup</strong><p>A compact review appears every 15 seconds.</p><code>{installCode}</code></article><article><strong>Review wall</strong><p>A responsive testimonials page.</p><code>{`<iframe src="${appOrigin}/reviews/${demoBusiness.slug}/" title="Customer reviews"></iframe>`}</code></article></div></section>
      <section id="print" className="panel"><PrintCardSettingsEditor/></section>
    </div></section>
  </main>;
}
