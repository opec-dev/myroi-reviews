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
import { ReviewManager } from "@/components/review-manager";

export function ClientWorkspace({slug}:{slug:string}){
  const user=useQuery(api.accounts.current,{});const business=useQuery(api.businesses.workspaceBySlug,user?{slug}:"skip");
  if(user===undefined||business===undefined)return <main className="login-page"><section className="login-card"><h1>Loading client workspace…</h1></section></main>;
  if(!user)return <main className="login-page"><section className="login-card"><h1>Preparing your account…</h1><p>Your secure profile is being connected. Refresh in a moment if this message remains.</p></section></main>;
  if(!business)return <main className="login-page"><section className="login-card"><h1>Workspace unavailable</h1><p>This account does not have access to the requested client.</p><Link className="button" href="/admin">Return to dashboard</Link></section></main>;
  const logoUrl=business.logoUrl||"/brands/yorkshire-roofing.png";const appOrigin=typeof window!=="undefined"?window.location.origin:"";const installCode=`<script defer src="${appOrigin}/widget/${business.slug}"></script>`;
  return <main className="app-shell"><aside className="sidebar"><a className="platform-brand" href="/admin"><img src="/brands/myroiagency-mark.png" alt=""/><strong>myROI Reviews</strong></a><nav><a className="active" href="#overview">Overview</a><a href="#analytics">Activity & analytics</a><a href="#notifications">Email notifications</a><a href="#branding">Branding</a><a href="#destinations">Review sites</a><a href="#funnel">Review funnel</a><a href="#reviews">Published reviews</a><a href="#embeds">Website embeds</a><a href="#print">QR & print card</a>{user.isPlatformAdmin&&<Link className="admin-nav-link" href="/admin">← Reseller dashboard</Link>}</nav><a className="sidebar-signout" href="/sign-out">Sign out</a></aside><section className="workspace"><header className="topbar"><div className="business-avatar"><img src={logoUrl} alt=""/></div><div><strong>{business.name}</strong><small>Client workspace · powered by myROI Reviews</small></div><a className="topbar-signout" href="/sign-out">Sign out</a></header><div className="content"><div className="eyebrow">Client workspace</div><h1>Turn every good experience into visible trust.</h1><p className="lede">Connect review destinations, share one branded link, and publish selected reviews on the business website.</p>
    <section id="overview" className="hero-card"><div><span className="status">{business.isPublished?"Published":"Draft"}</span><h2>Your branded review link</h2><code>{appOrigin}/r/{business.slug}</code><div className="actions"><Link className="button primary" href={`/r/${business.slug}?preview=1`}>Preview review page</Link><Link className="button" href={`/reviews/${business.slug}?preview=1`}>Preview review wall</Link><Link className="button" href={`/print/${business.slug}?preview=1`}>Preview print card</Link></div></div><div className="qr-placeholder"><div className="qr-art dashboard-qr"><img className="qr-image" src={`/api/qr/${business.slug}`} alt="Review QR with business icon"/><span aria-hidden="true"><img src={business.iconUrl||"/brands/yorkshire-roofing-icon.png"} alt=""/></span></div><small>Square icon centered and fitted in QR</small></div></section>
    <section id="analytics" className="panel"><div className="section-heading"><div><span className="eyebrow">Client reporting</span><h2>Activity & analytics</h2></div></div><p className="panel-intro">Track the funnel from first visit through QR scans, form completions, and review-site clicks.</p><ClientAnalytics businessId={business._id}/></section>
    <section id="notifications" className="panel"><ClientNotificationSettingsEditor businessId={business._id} businessName={business.name}/></section>
    <section id="branding" className="panel"><BusinessBrandingSettings businessId={business._id} initial={{logoUrl:business.logoUrl,iconUrl:business.iconUrl,googleBadgeUrl:business.googleBadgeUrl,yelpBadgeUrl:business.yelpBadgeUrl,publicReviewPageUrl:business.publicReviewPageUrl,primaryColor:business.primaryColor,secondaryColor:business.secondaryColor}}/></section>
    <section id="destinations" className="panel"><DestinationManager businessId={business._id}/></section>
    <section id="funnel" className="panel"><FunnelSettingsEditor businessId={business._id} business={{name:business.name,slug:business.slug,logoUrl}}/></section>
    <section id="reviews" className="panel"><ReviewManager businessId={business._id} slug={business.slug}/></section>
    <section id="embeds" className="panel"><span className="eyebrow">Install once</span><h2>Website embeds</h2><div className="embed-grid"><article><strong>Rotating popup</strong><p>Paste before the closing &lt;/body&gt; tag when possible. If your builder only accepts head code, this deferred script is still non-render-blocking.</p><code>{installCode}</code></article><article><strong>Review wall</strong><p>An iframe is the standard isolated embed. Add width and height so the page reserves space before it loads.</p><code>{`<iframe src="${appOrigin}/reviews/${business.slug}" title="Customer reviews" loading="lazy" style="width:100%;min-height:720px;border:0"></iframe>`}</code></article></div></section>
    <section id="print" className="panel"><PrintCardSettingsEditor businessId={business._id} slug={business.slug}/></section>
  </div></section></main>;
}
