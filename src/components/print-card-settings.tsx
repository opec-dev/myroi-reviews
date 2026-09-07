"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { defaultPrintSettings, PrintSettings, printSettingsStorageKey } from "@/lib/demo-data";

export function PrintCardSettingsEditor() {
  const [settings, setSettings] = useState(defaultPrintSettings);
  const [saved, setSaved] = useState(false);
  useEffect(() => { const value = localStorage.getItem(printSettingsStorageKey); if (value) try { const stored = JSON.parse(value) as Partial<PrintSettings>; const badges = stored.platformBadges?.includes("google-yelp") ? [...stored.platformBadges.filter((id) => id !== "google-yelp"), "google", "yelp"] : stored.platformBadges; setSettings({ ...defaultPrintSettings, ...stored, ...(badges ? { platformBadges: [...new Set(badges)] } : {}) }); } catch {} }, []);
  function change(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const key = event.target.name as keyof PrintSettings;
    setSettings((current) => ({ ...current, [key]: event.target.type === "range" ? Number(event.target.value) : event.target.value })); setSaved(false);
  }
  function toggleBadge(id: string) { setSettings((current) => ({ ...current, platformBadges: current.platformBadges.includes(id) ? current.platformBadges.filter(x => x !== id) : [...current.platformBadges, id] })); setSaved(false); }
  function save() { localStorage.setItem(printSettingsStorageKey, JSON.stringify(settings)); setSaved(true); }
  return <>
    <div className="section-heading"><div><span className="eyebrow">Print-ready controls</span><h2>Business card content</h2></div><a className="button" href="/print/yorkshire-roofing" target="_blank">Preview card</a></div>
    <div className="settings-grid compact-settings">
      <label>Title<input name="title" value={settings.title} onChange={change} /></label>
      <label>Subtitle<textarea name="subtitle" value={settings.subtitle} onChange={change} /></label>
      <label>Phone line<input name="phone" value={settings.phone} onChange={change} /></label>
      <label>Website line<input name="website" value={settings.website} onChange={change} /></label>
      <label>QR caption<input name="scanLabel" value={settings.scanLabel} onChange={change} /></label>
      <label>Title font size <output>{settings.titleSize}px</output><input type="range" min="24" max="52" name="titleSize" value={settings.titleSize} onChange={change} /></label>
      <label>Subtitle font size <output>{settings.subtitleSize}px</output><input type="range" min="12" max="26" name="subtitleSize" value={settings.subtitleSize} onChange={change} /></label>
    </div>
    <div className="badge-options"><strong>Platform logos</strong><div className="badge-choice-grid"><label><input type="checkbox" checked={settings.platformBadges.includes("google")} onChange={() => toggleBadge("google")} /><img src="/brands/review-us-google.svg" alt="Google logo option" /> Google</label><label><input type="checkbox" checked={settings.platformBadges.includes("yelp")} onChange={() => toggleBadge("yelp")} /><img src="/brands/review-us-yelp.svg" alt="Yelp logo option" /> Yelp</label></div><small>Each logo is separate. Turn either one on or off independently; additional client or industry logos can occupy a second row.</small></div>
    <div className="settings-save"><small>{saved ? "Saved in this pilot browser." : "Defaults are ready to print or customize."}</small><button className="button primary" onClick={save}>Save card settings</button></div>
  </>;
}
