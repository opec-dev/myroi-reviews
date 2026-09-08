"use client";

import { CSSProperties, FormEvent, useEffect, useRef, useState } from "react";
import {
  defaultFunnelSettings,
  defaultBusinessBranding,
  businessBrandingStorageKey,
  demoBusiness,
  demoDestinations,
  destinationStorageKey,
  FunnelSettings,
  funnelSettingsStorageKey,
  privateFeedbackStorageKey,
  ReviewDestination,
} from "@/lib/demo-data";
import { recordPilotEmail, trackPilotEvent } from "@/lib/pilot-tracking";

type Stage = "rating" | "positive" | "recovery" | "complete";

export function ReviewFunnel() {
  const [stage, setStage] = useState<Stage>("rating");
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [settings, setSettings] = useState<FunnelSettings>(defaultFunnelSettings);
  const [destinations, setDestinations] = useState<ReviewDestination[]>(demoDestinations);
  const [branding, setBranding] = useState(defaultBusinessBranding);
  const trackedView = useRef(false);

  useEffect(() => {
    const funnel = localStorage.getItem(funnelSettingsStorageKey);
    const sites = localStorage.getItem(destinationStorageKey);
    const brand = localStorage.getItem(businessBrandingStorageKey);
    if (funnel) try { setSettings({ ...defaultFunnelSettings, ...JSON.parse(funnel) }); } catch { /* use defaults */ }
    if (sites) try { setDestinations(JSON.parse(sites)); } catch { /* use defaults */ }
    if (brand) try { setBranding({ ...defaultBusinessBranding, ...JSON.parse(brand) }); } catch { /* use defaults */ }
    if(!trackedView.current){trackedView.current=true;const source=new URLSearchParams(window.location.search).get("src")??"direct";trackPilotEvent({businessSlug:demoBusiness.slug,type:"funnel_view",source});if(source==="qr")trackPilotEvent({businessSlug:demoBusiness.slug,type:"qr_scan",source})}
  }, []);

  function chooseRating(value: number) {
    setRating(value);
    trackPilotEvent({businessSlug:demoBusiness.slug,type:"rating_selected",rating:value});
    setStage(value >= settings.positiveThreshold ? "positive" : "recovery");
  }

  async function submitPrivateFeedback(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const previous = JSON.parse(localStorage.getItem(privateFeedbackStorageKey) ?? "[]");
    const entry = { rating, name: data.get("name"), contact: data.get("contact"), message: data.get("message"), business: demoBusiness.name, slug: demoBusiness.slug, createdAt: new Date().toISOString() };
    previous.push(entry);
    localStorage.setItem(privateFeedbackStorageKey, JSON.stringify(previous));
    trackPilotEvent({businessSlug:demoBusiness.slug,type:"private_feedback_submitted",rating});
    const recipient=String(data.get("contact")); const subject=`Private ${rating}-star feedback for ${demoBusiness.name}`;
    try {
      const response=await fetch("/api/feedback", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(entry) });
      const result=await response.json() as {notified?:boolean;recipient?:string;reason?:string;error?:string};
      recordPilotEmail({businessSlug:demoBusiness.slug,kind:"private_feedback",status:result.notified?"sent":response.ok?"not_sent":"failed",recipient:result.recipient||recipient,subject,error:result.reason??result.error});
    } catch { recordPilotEmail({businessSlug:demoBusiness.slug,kind:"private_feedback",status:"failed",recipient,subject,error:"Delivery endpoint unavailable"}); }
    setStage("complete");
  }

  return <main className="public-page" style={{ "--primary": branding.primaryColor } as CSSProperties}>
    <section className="review-funnel">
      <div className="logo-lockup"><img src={branding.logoUrl} alt={`${demoBusiness.name} logo`} /></div>
      {settings.showBusinessName && <strong className="funnel-business-name">{demoBusiness.name}</strong>}

      {stage === "rating" && <div className="funnel-stage">
        <h1>{settings.ratingHeadline}</h1><p>{settings.ratingSubtext}</p>
        <div className="rating-picker" onMouseLeave={() => setHovered(0)}>
          {[1,2,3,4,5].map((value) => <button key={value} aria-label={`${value} star${value === 1 ? "" : "s"}`} onMouseEnter={() => setHovered(value)} onClick={() => chooseRating(value)} className={value <= (hovered || rating) ? "selected" : ""}>★</button>)}
        </div>
        <small>Tap a star to rate your experience</small>
      </div>}

      {stage === "positive" && <div className="funnel-stage">
        <div className="success-mark">♥</div><h1>{settings.positiveHeadline}</h1><p>{settings.positiveSubtext}</p>
        <div className="review-buttons">{destinations.filter((item) => item.enabled).map((destination) => <a href={destination.reviewUrl} key={destination.id} target="_blank" rel="noopener noreferrer" onClick={()=>trackPilotEvent({businessSlug:demoBusiness.slug,type:"destination_clicked",destinationId:destination.id,destinationName:destination.name,source:new URLSearchParams(window.location.search).get("src")??"direct",rating})}><span className="source-icon" style={{ background: destination.color }}>{destination.name[0]}</span>Review us on {destination.name}<b>↗</b></a>)}</div>
        <button className="quiet-button" onClick={() => {trackPilotEvent({businessSlug:demoBusiness.slug,type:"maybe_later",rating});setStage("complete")}}>{settings.maybeLaterText}</button>
      </div>}

      {stage === "recovery" && <div className="funnel-stage recovery-stage">
        <h1>{settings.recoveryHeadline}</h1><p>{settings.recoverySubtext}</p>
        <form onSubmit={submitPrivateFeedback}>
          <label>{settings.nameLabel}<input name="name" placeholder="Jane Doe" /></label>
          <label>{settings.contactLabel}<input name="contact" placeholder="jane@example.com" required /></label>
          <label>{settings.messageLabel}<textarea name="message" placeholder="Tell us what happened and how we can make it right..." required /></label>
          <button className="button primary" type="submit">{settings.submitText}</button>
        </form>
        <button className="quiet-button public-review-link" onClick={() => {trackPilotEvent({businessSlug:demoBusiness.slug,type:"public_review_fallback",rating});setStage("positive")}}>{settings.publicLinkText}</button>
      </div>}

      {stage === "complete" && <div className="funnel-stage completion-stage">
        <div className="success-mark">✓</div><h1>{settings.completionHeadline}</h1><p>{settings.completionSubtext}</p>
      </div>}
    </section>
  </main>;
}
