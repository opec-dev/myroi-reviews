"use client";

import { CSSProperties, useEffect, useState } from "react";
import { defaultPrintSettings, demoBusiness, printSettingsStorageKey } from "@/lib/demo-data";

export function PrintCardPreview({ slug, qrSuffix }: { slug: string; qrSuffix: string }) {
  const [settings, setSettings] = useState(defaultPrintSettings);
  useEffect(() => { const value = localStorage.getItem(printSettingsStorageKey); if (value) try { setSettings({ ...defaultPrintSettings, ...JSON.parse(value) }); } catch {} }, []);
  const typeScale = { "--card-title-scale": settings.titleSize / 37, "--card-subtitle-scale": settings.subtitleSize / 17 } as CSSProperties;
  return <section className="review-card" style={typeScale} aria-label={`${demoBusiness.name} review request card`}>
    <div className="review-card-grid">
      <div className="review-card-copy"><img src={demoBusiness.logoUrl} alt={`${demoBusiness.name} logo`} /><h1>{settings.title}</h1><p>{settings.subtitle}</p><div className="contact-lines"><span>{settings.phone}</span><span>{settings.website}</span></div></div>
      <div className="card-qr"><img src={`/api/qr/${slug}${qrSuffix}`} alt="QR code to leave a review" /><strong>{settings.scanLabel}</strong>{settings.platformBadges.includes("google-yelp") && <img className="platform-badge-art" src="/brands/review-us-google-yelp.png" alt="Review us on Google and Yelp" />}</div>
    </div>
  </section>;
}
