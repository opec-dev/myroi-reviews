"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { defaultFunnelSettings, FunnelSettings, funnelSettingsStorageKey } from "@/lib/demo-data";

const fields: Array<{ key: keyof FunnelSettings; label: string; area?: boolean }> = [
  { key: "ratingHeadline", label: "Rating headline" },
  { key: "ratingSubtext", label: "Rating subtext", area: true },
  { key: "positiveHeadline", label: "Positive headline" },
  { key: "positiveSubtext", label: "Positive message", area: true },
  { key: "maybeLaterText", label: "Maybe-later link" },
  { key: "completionHeadline", label: "Completion headline" },
  { key: "completionSubtext", label: "Completion message", area: true },
  { key: "recoveryHeadline", label: "Recovery headline" },
  { key: "recoverySubtext", label: "Recovery message", area: true },
  { key: "nameLabel", label: "Name field label" },
  { key: "contactLabel", label: "Contact field label" },
  { key: "messageLabel", label: "Feedback field label" },
  { key: "submitText", label: "Private-submit button" },
  { key: "publicLinkText", label: "Public-review fallback link" },
];

export function FunnelSettingsEditor() {
  const [settings, setSettings] = useState(defaultFunnelSettings);
  const [saved, setSaved] = useState(false);
  useEffect(() => { const value = localStorage.getItem(funnelSettingsStorageKey); if (value) try { setSettings({ ...defaultFunnelSettings, ...JSON.parse(value) }); } catch {} }, []);
  function change(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const key = event.target.name as keyof FunnelSettings;
    setSettings((current) => ({ ...current, [key]: key === "positiveThreshold" ? Number(event.target.value) : event.target.value })); setSaved(false);
  }
  function save() { localStorage.setItem(funnelSettingsStorageKey, JSON.stringify(settings)); setSaved(true); }
  return <>
    <div className="section-heading"><div><span className="eyebrow">Good and bad paths</span><h2>Review funnel wording</h2></div><a className="button" href="/r/yorkshire-roofing" target="_blank">Preview funnel</a></div>
    <div className="settings-grid">
      <label>Positive-review threshold<select name="positiveThreshold" value={settings.positiveThreshold} onChange={change}>{[1,2,3,4,5].map(n => <option value={n} key={n}>{n}+ stars</option>)}</select></label>
      {fields.map((field) => <label key={field.key}>{field.label}{field.area ? <textarea name={field.key} value={String(settings[field.key])} onChange={change} /> : <input name={field.key} value={String(settings[field.key])} onChange={change} />}</label>)}
    </div>
    <div className="settings-save"><small>{saved ? "Saved in this pilot browser." : "Every line can be customized per client."}</small><button className="button primary" onClick={save}>Save funnel copy</button></div>
  </>;
}
