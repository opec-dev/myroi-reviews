"use client";

import { CSSProperties, FormEvent, useEffect, useState } from "react";
import {
  defaultFunnelSettings,
  demoBusiness,
  demoDestinations,
  destinationStorageKey,
  FunnelSettings,
  funnelSettingsStorageKey,
  privateFeedbackStorageKey,
  ReviewDestination,
} from "@/lib/demo-data";

type Stage = "rating" | "positive" | "recovery" | "complete";

export function ReviewFunnel() {
  const [stage, setStage] = useState<Stage>("rating");
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [settings, setSettings] = useState<FunnelSettings>(defaultFunnelSettings);
  const [destinations, setDestinations] = useState<ReviewDestination[]>(demoDestinations);

  useEffect(() => {
    const funnel = localStorage.getItem(funnelSettingsStorageKey);
    const sites = localStorage.getItem(destinationStorageKey);
    if (funnel) try { setSettings({ ...defaultFunnelSettings, ...JSON.parse(funnel) }); } catch { /* use defaults */ }
    if (sites) try { setDestinations(JSON.parse(sites)); } catch { /* use defaults */ }
  }, []);

  function chooseRating(value: number) {
    setRating(value);
    setStage(value >= settings.positiveThreshold ? "positive" : "recovery");
  }

  function submitPrivateFeedback(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const previous = JSON.parse(localStorage.getItem(privateFeedbackStorageKey) ?? "[]");
    previous.push({ rating, name: data.get("name"), contact: data.get("contact"), message: data.get("message"), createdAt: new Date().toISOString() });
    localStorage.setItem(privateFeedbackStorageKey, JSON.stringify(previous));
    setStage("complete");
  }

  return <main className="public-page" style={{ "--primary": demoBusiness.accent } as CSSProperties}>
    <section className="review-funnel">
      <div className="logo-lockup"><img src={demoBusiness.logoUrl} alt={`${demoBusiness.name} logo`} /></div>
      <strong className="funnel-business-name">{demoBusiness.name}</strong>

      {stage === "rating" && <div className="funnel-stage">
        <h1>{settings.ratingHeadline}</h1><p>{settings.ratingSubtext}</p>
        <div className="rating-picker" onMouseLeave={() => setHovered(0)}>
          {[1,2,3,4,5].map((value) => <button key={value} aria-label={`${value} star${value === 1 ? "" : "s"}`} onMouseEnter={() => setHovered(value)} onClick={() => chooseRating(value)} className={value <= (hovered || rating) ? "selected" : ""}>★</button>)}
        </div>
        <small>Tap a star to rate your experience</small>
      </div>}

      {stage === "positive" && <div className="funnel-stage">
        <div className="success-mark">♥</div><h1>{settings.positiveHeadline}</h1><p>{settings.positiveSubtext}</p>
        <div className="review-buttons">{destinations.filter((item) => item.enabled).map((destination) => <a href={destination.reviewUrl} key={destination.id} target="_blank" rel="noopener noreferrer"><span className="source-icon" style={{ background: destination.color }}>{destination.name[0]}</span>Review us on {destination.name}<b>↗</b></a>)}</div>
        <button className="quiet-button" onClick={() => setStage("complete")}>{settings.maybeLaterText}</button>
      </div>}

      {stage === "recovery" && <div className="funnel-stage recovery-stage">
        <h1>{settings.recoveryHeadline}</h1><p>{settings.recoverySubtext}</p>
        <form onSubmit={submitPrivateFeedback}>
          <label>{settings.nameLabel}<input name="name" placeholder="Jane Doe" /></label>
          <label>{settings.contactLabel}<input name="contact" placeholder="jane@example.com" required /></label>
          <label>{settings.messageLabel}<textarea name="message" placeholder="Tell us what happened and how we can make it right..." required /></label>
          <button className="button primary" type="submit">{settings.submitText}</button>
        </form>
        <button className="quiet-button public-review-link" onClick={() => setStage("positive")}>{settings.publicLinkText}</button>
      </div>}

      {stage === "complete" && <div className="funnel-stage completion-stage">
        <div className="success-mark">✓</div><h1>{settings.completionHeadline}</h1><p>{settings.completionSubtext}</p>
      </div>}
    </section>
  </main>;
}
