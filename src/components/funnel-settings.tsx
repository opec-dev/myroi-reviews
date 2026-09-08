"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { defaultFunnelSettings, demoBusiness, FunnelSettings, funnelSettingsStorageKey } from "@/lib/demo-data";

type PreviewStage = "rating" | "positive" | "recovery" | "complete";

export function FunnelSettingsEditor() {
  const [settings, setSettings] = useState(defaultFunnelSettings);
  const [stage, setStage] = useState<PreviewStage>("rating");
  const [saved, setSaved] = useState(false);
  useEffect(() => { const value = localStorage.getItem(funnelSettingsStorageKey); if (value) try { setSettings({ ...defaultFunnelSettings, ...JSON.parse(value) }); } catch {} }, []);
  function change(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const key = event.target.name as keyof FunnelSettings;
    const value = event.target instanceof HTMLInputElement && event.target.type === "checkbox" ? event.target.checked : key === "positiveThreshold" ? Number(event.target.value) : event.target.value;
    setSettings(current => ({ ...current, [key]: value })); setSaved(false);
  }
  function save() { localStorage.setItem(funnelSettingsStorageKey, JSON.stringify(settings)); setSaved(true); }
  return <>
    <div className="section-heading"><div><span className="eyebrow">Good and recovery paths</span><h2>Review funnel editor</h2></div><a className="button" href="/r/yorkshire-roofing" target="_blank">Open full funnel</a></div>
    <p className="panel-intro">Each section controls one customer-facing step. Use the live preview to confirm the wording before saving.</p>
    <div className="editor-preview-layout"><div className="funnel-editor-sections">
      <EditorSection title="1. Initial rating" note="Everyone sees this first. Their star choice determines which path appears next." active={stage === "rating"} onPreview={() => setStage("rating")}>
        <label className="check-row"><input type="checkbox" name="showBusinessName" checked={settings.showBusinessName} onChange={change} /> Show business name below logo</label><label>Rating headline<input name="ratingHeadline" value={settings.ratingHeadline} onChange={change} /></label><label>Rating subtext<textarea name="ratingSubtext" value={settings.ratingSubtext} onChange={change} /></label><label>Positive-review threshold<select name="positiveThreshold" value={settings.positiveThreshold} onChange={change}>{[1,2,3,4,5].map(n => <option value={n} key={n}>{n}+ stars</option>)}</select></label>
      </EditorSection>
      <EditorSection title="2. Positive experience" note="Shown at or above the threshold; sends the customer to enabled review sites." active={stage === "positive"} onPreview={() => setStage("positive")}>
        <label>Headline<input name="positiveHeadline" value={settings.positiveHeadline} onChange={change} /></label><label>Message<textarea name="positiveSubtext" value={settings.positiveSubtext} onChange={change} /></label><label>Maybe-later link<input name="maybeLaterText" value={settings.maybeLaterText} onChange={change} /></label>
      </EditorSection>
      <EditorSection title="3. Private recovery" note="Shown below the threshold. This feedback is private and can trigger an email notification." active={stage === "recovery"} onPreview={() => setStage("recovery")} tone="recovery">
        <label>Recovery headline<input name="recoveryHeadline" value={settings.recoveryHeadline} onChange={change} /></label><label>Recovery message<textarea name="recoverySubtext" value={settings.recoverySubtext} onChange={change} /></label><label>Name field<input name="nameLabel" value={settings.nameLabel} onChange={change} /></label><label>Contact field<input name="contactLabel" value={settings.contactLabel} onChange={change} /></label><label>Feedback field<input name="messageLabel" value={settings.messageLabel} onChange={change} /></label><label>Submit button<input name="submitText" value={settings.submitText} onChange={change} /></label><label>Public-review fallback<input name="publicLinkText" value={settings.publicLinkText} onChange={change} /></label>
      </EditorSection>
      <EditorSection title="4. Completion" note="Shown after private feedback or when the customer chooses “Maybe later.”" active={stage === "complete"} onPreview={() => setStage("complete")}>
        <label>Completion headline<input name="completionHeadline" value={settings.completionHeadline} onChange={change} /></label><label>Completion message<textarea name="completionSubtext" value={settings.completionSubtext} onChange={change} /></label>
      </EditorSection>
    </div><FunnelMiniPreview settings={settings} stage={stage} /></div>
    <div className="settings-save"><small>{saved ? "Saved in this pilot browser." : "Every line can be customized per client."}</small><button className="button primary" onClick={save}>Save funnel settings</button></div>
  </>;
}

function EditorSection({ title, note, active, onPreview, tone, children }: { title:string; note:string; active:boolean; onPreview:()=>void; tone?:string; children:React.ReactNode }) {
  return <section className={`editor-section ${active ? "active" : ""} ${tone ?? ""}`}><div className="editor-section-head"><div><h3>{title}</h3><p>{note}</p></div><button className="small-action text-action" onClick={onPreview}>Preview</button></div><div className="settings-grid">{children}</div></section>;
}

function FunnelMiniPreview({ settings, stage }: { settings:FunnelSettings; stage:PreviewStage }) {
  return <aside className="live-preview-sticky"><span className="eyebrow">Live funnel preview</span><div className="mini-funnel"><img src={demoBusiness.logoUrl} alt="" />{settings.showBusinessName && <strong>{demoBusiness.name}</strong>}{stage === "rating" && <><h3>{settings.ratingHeadline}</h3><p>{settings.ratingSubtext}</p><div className="mini-stars">★★★★★</div><small>Tap a star to rate your experience</small></>}{stage === "positive" && <><span className="preview-mark">♥</span><h3>{settings.positiveHeadline}</h3><p>{settings.positiveSubtext}</p><button>Review us on Google</button><button>Review us on Yelp</button><small>{settings.maybeLaterText}</small></>}{stage === "recovery" && <><h3>{settings.recoveryHeadline}</h3><p>{settings.recoverySubtext}</p><input readOnly placeholder={settings.nameLabel} /><input readOnly placeholder={settings.contactLabel} /><textarea readOnly placeholder={settings.messageLabel} /><button>{settings.submitText}</button><small>{settings.publicLinkText}</small></>}{stage === "complete" && <><span className="preview-mark">✓</span><h3>{settings.completionHeadline}</h3><p>{settings.completionSubtext}</p></>}</div></aside>;
}
