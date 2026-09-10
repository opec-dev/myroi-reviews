"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { BusinessBrandingSettings } from "@/components/business-branding-settings";
import { DestinationManager } from "@/components/destination-manager";
import { FunnelSettingsEditor } from "@/components/funnel-settings";
import { PrintCardSettingsEditor } from "@/components/print-card-settings";
import { ClientAnalytics } from "@/components/analytics-dashboard";
import { ClientNotificationSettingsEditor } from "@/components/client-notification-settings";
import { demoReviews } from "@/lib/demo-data";

export function ClientWorkspace({slug}:{slug:string}){
  const user=useQuery(api.accounts.current,{});const business=useQuery(api.businesses.workspaceBySlug,user?{slug}:"skip");
  if(user===undefined||business===undefined)return <main className="login-page"><section className="login-card"><h1>Loading client workspace…</h1></section></main>;
  if(!user)return <main className="login-page"><section className="login-card"><h1>Preparing your account…</h1><p>Your secure profile is being connected. Refresh in a moment if this message remains.</p></section></main>;
  if(!business)return <main className="login-page"><section className="login-card"><h1>Workspace unavailable</h1><p>This account does not have access to the requested client.</p><Link className="button" href="/admin">Return to dashboard</Link></section></main>;
  const logoUrl=business.logoUrl||"/brands/yorkshire-roofing.png";const appOrigin=typeof window!=="undefined"?window.location.origin:"";const installCode=`<script async src="${appOrigin}/widget/${business.slug}"></script>`;
  return <main className="app-shell"><aside className="sidebar"><a className="platform-brand" href="/admin"><img src="/brands/myroiagency-logo.png" alt=""/><span>Reviews</span></a><nav><a className="active" href="#overview">Overview</a><a href="#analytics">Activity & analytics</a><a href="#notifications">Email notifications</a><a href="#branding">Branding</a><a href="#destinations">Review sites</a><a href="#funnel">Review funnel</a><a href="#reviews">Published reviews</a><a href="#embeds">Website embeds</a><a href="#print">QR & print card</a>{user.isPlatformAdmin&&<Link className="admin-nav-link" href="/admin">← Reseller dashboard</Link>}</nav></aside><section className="workspace"><header className="topbar"><div className="business-avatar"><img src={logoUrl} alt=""/></div><div><strong>{business.name}</strong><small>Client workspace · powered by myROIagency</small></div><a className="topbar-signout" href="/sign-out">Sign out</a></header><div className="content"><div className="eyebrow">Client workspace</div><h1>Turn every good experience into visible trust.</h1><p className="lede">Connect review destinations, share one branded link, and publish selected reviews on the business website.</p>
    <section id="overview" className="hero-card"><div><span className="status">{business.isPublished?"Published":"Draft"}</span><h2>Your branded review link</h2><code>{appOrigin}/r/{business.slug}</code><div className="actions"><Link className="button primary" href={`/r/${business.slug}`}>Preview review page</Link><Link className="button" href={`/reviews/${business.slug}`}>Preview review wall</Link><Link className="button" href={`/print/${business.slug}`}>Preview print card</Link></div></div><div className="qr-placeholder"><div className="qr-art dashboard-qr"><img className="qr-image" src={`/api/qr/${business.slug}`} alt="Review QR with business icon"/></div><small>Square icon centered in QR</small></div></section>
    <div className="metric-grid"><article><span>Account status</span><strong>{business.isPublished?"Live":"Draft"}</strong><small>Public funnel availability</small></article><article><span>Published reviews</span><strong>{demoReviews.length}</strong><small>Demo review library</small></article><article><span>Website displays</span><strong>2</strong><small>Popup + review wall</small></article></div>
    <section id="analytics" className="panel"><div className="section-heading"><div><span className="eyebrow">Client reporting</span><h2>Activity & analytics</h2></div></div><p className="panel-intro">Track the funnel from first visit through QR scans, form completions, and review-site clicks.</p><ClientAnalytics businessId={business._id}/></section>
    <section id="notifications" className="panel"><ClientNotificationSettingsEditor businessId={business._id} businessName={business.name}/></section>
    <section id="branding" className="panel"><BusinessBrandingSettings businessId={business._id} initial={{logoUrl:business.logoUrl,iconUrl:business.iconUrl,primaryColor:business.primaryColor,secondaryColor:business.secondaryColor}}/></section>
    <section id="destinations" className="panel"><DestinationManager businessId={business._id}/></section>
    <section id="funnel" className="panel"><FunnelSettingsEditor businessId={business._id} business={{name:business.name,slug:business.slug,logoUrl}}/></section>
    <section id="reviews" className="panel"><div className="section-heading"><div><span className="eyebrow">Curated social proof</span><h2>Published reviews</h2></div><button className="button" disabled>CSV import next</button></div><div className="review-row-grid">{demoReviews.map(review=><article className="mini-review" key={review.id}><span className="stars">★★★★★</span><p>“{review.excerpt}”</p><small>{review.reviewer} · {review.source}</small></article>)}</div></section>
    <section id="embeds" className="panel"><span className="eyebrow">Install once</span><h2>Website embeds</h2><div className="embed-grid"><article><strong>Rotating popup</strong><p>A compact review appears every 15 seconds.</p><code>{installCode}</code></article><article><strong>Review wall</strong><p>A responsive testimonials page.</p><code>{`<iframe src="${appOrigin}/reviews/${business.slug}" title="Customer reviews"></iframe>`}</code></article></div></section>
    <section id="print" className="panel"><PrintCardSettingsEditor businessId={business._id} slug={business.slug}/></section>
  </div></section></main>;
}
