"use client";

import { CSSProperties, FormEvent, useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  defaultFunnelSettings,
  defaultBusinessBranding,
  demoDestinations,
  FunnelSettings,
  ReviewDestination,
} from "@/lib/demo-data";
import { recordPilotEmail, trackPilotEvent } from "@/lib/pilot-tracking";

type Stage = "rating" | "positive" | "recovery" | "complete";

export function ReviewFunnel({slug}:{slug:string}) {
  const connected=useQuery(api.funnel.publicBySlug,{slug});const saveFeedback=useMutation(api.funnel.submitPrivateFeedback);
  const [stage, setStage] = useState<Stage>("rating");
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [settings, setSettings] = useState<FunnelSettings>(defaultFunnelSettings);
  const [destinations, setDestinations] = useState<ReviewDestination[]>(demoDestinations);
  const [branding, setBranding] = useState(defaultBusinessBranding);
  const trackedView = useRef(false);

  useEffect(() => {
    if(!connected)return;
    if(connected.funnel)setSettings({...defaultFunnelSettings,...connected.funnel});
    setBranding({logoUrl:connected.business.logoUrl||defaultBusinessBranding.logoUrl,iconUrl:connected.business.iconUrl||defaultBusinessBranding.iconUrl,primaryColor:connected.business.primaryColor,secondaryColor:connected.business.secondaryColor||connected.business.primaryColor});
    setDestinations(connected.destinations.map(row=>({id:row._id,provider:row.provider,name:row.label,reviewUrl:row.reviewUrl,profileUrl:row.profileUrl,color:row.provider==="google"?"#4285f4":row.provider==="yelp"?"#d32323":"#6857d9",enabled:row.isEnabled})) as ReviewDestination[]);
    if(!trackedView.current){trackedView.current=true;const source=new URLSearchParams(window.location.search).get("src")??"direct";trackPilotEvent({businessSlug:slug,type:"funnel_view",source});if(source==="qr")trackPilotEvent({businessSlug:slug,type:"qr_scan",source})}
  }, [connected,slug]);

  function chooseRating(value: number) {
    setRating(value);
    trackPilotEvent({businessSlug:slug,type:"rating_selected",rating:value});
    setStage(value >= settings.positiveThreshold ? "positive" : "recovery");
  }

  async function submitPrivateFeedback(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const entry = { rating, name: String(data.get("name")||"")||undefined, contact: String(data.get("contact")), message: String(data.get("message")), business: connected?.business.name??slug, slug, createdAt: new Date().toISOString() };
    await saveFeedback({slug,rating,name:entry.name,contact:entry.contact,message:entry.message});
    trackPilotEvent({businessSlug:slug,type:"private_feedback_submitted",rating});
    const recipient=entry.contact; const subject=`Private ${rating}-star feedback for ${entry.business}`;
    try {
      const response=await fetch("/api/feedback", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(entry) });
      const result=await response.json() as {notified?:boolean;recipient?:string;reason?:string;error?:string};
      recordPilotEmail({businessSlug:slug,kind:"private_feedback",status:result.notified?"sent":response.ok?"not_sent":"failed",recipient:result.recipient||recipient,subject,error:result.reason??result.error});
    } catch { recordPilotEmail({businessSlug:slug,kind:"private_feedback",status:"failed",recipient,subject,error:"Delivery endpoint unavailable"}); }
    setStage("complete");
  }

  return <main className="public-page" style={{ "--primary": branding.primaryColor } as CSSProperties}>
    <section className="review-funnel">
      <div className="logo-lockup"><img src={branding.logoUrl} alt={`${connected?.business.name??slug} logo`} /></div>
      {settings.showBusinessName && <strong className="funnel-business-name">{connected?.business.name??slug}</strong>}

      {stage === "rating" && <div className="funnel-stage">
        <h1>{settings.ratingHeadline}</h1><p>{settings.ratingSubtext}</p>
        <div className="rating-picker" onMouseLeave={() => setHovered(0)}>
          {[1,2,3,4,5].map((value) => <button key={value} aria-label={`${value} star${value === 1 ? "" : "s"}`} onMouseEnter={() => setHovered(value)} onClick={() => chooseRating(value)} className={value <= (hovered || rating) ? "selected" : ""}>★</button>)}
        </div>
        <small>Tap a star to rate your experience</small>
      </div>}

      {stage === "positive" && <div className="funnel-stage">
        <div className="success-mark">♥</div><h1>{settings.positiveHeadline}</h1><p>{settings.positiveSubtext}</p>
        <div className="review-buttons">{destinations.filter((item) => item.enabled).map((destination) => <a href={destination.reviewUrl} key={destination.id} target="_blank" rel="noopener noreferrer" onClick={()=>trackPilotEvent({businessSlug:slug,type:"destination_clicked",destinationId:destination.id,destinationName:destination.name,source:new URLSearchParams(window.location.search).get("src")??"direct",rating})}><span className="source-icon" style={{ background: destination.color }}>{destination.name[0]}</span>Review us on {destination.name}<b>↗</b></a>)}</div>
        <button className="quiet-button" onClick={() => {trackPilotEvent({businessSlug:slug,type:"maybe_later",rating});setStage("complete")}}>{settings.maybeLaterText}</button>
      </div>}

      {stage === "recovery" && <div className="funnel-stage recovery-stage">
        <h1>{settings.recoveryHeadline}</h1><p>{settings.recoverySubtext}</p>
        <form onSubmit={submitPrivateFeedback}>
          <label>{settings.nameLabel}<input name="name" placeholder="Jane Doe" /></label>
          <label>{settings.contactLabel}<input name="contact" placeholder="jane@example.com" required /></label>
          <label>{settings.messageLabel}<textarea name="message" placeholder="Tell us what happened and how we can make it right..." required /></label>
          <button className="button primary" type="submit">{settings.submitText}</button>
        </form>
        <button className="quiet-button public-review-link" onClick={() => {trackPilotEvent({businessSlug:slug,type:"public_review_fallback",rating});setStage("positive")}}>{settings.publicLinkText}</button>
      </div>}

      {stage === "complete" && <div className="funnel-stage completion-stage">
        <div className="success-mark">✓</div><h1>{settings.completionHeadline}</h1><p>{settings.completionSubtext}</p>
      </div>}
    </section>
  </main>;
}
