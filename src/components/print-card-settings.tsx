"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { defaultBusinessBranding, defaultPrintSettings, PrintSettings } from "@/lib/demo-data";
import { CardArtwork } from "@/components/print-card-preview";

export function PrintCardSettingsEditor({businessId,slug}:{businessId:Id<"businesses">;slug:string}) {
  const stored=useQuery(api.printCards.forBusiness,{businessId});const saveSettings=useMutation(api.printCards.save);
  const workspace=useQuery(api.businesses.workspaceBySlug,{slug});
  const [settings, setSettings] = useState(defaultPrintSettings);
  const [face, setFace] = useState<"front"|"back">("front");
  const [saved, setSaved] = useState(false);
  useEffect(() => { if(stored)setSettings({...defaultPrintSettings,...stored}); }, [stored]);
  function change(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) { const key = event.target.name as keyof PrintSettings; setSettings(current => ({ ...current, [key]: event.target.type === "range" ? Number(event.target.value) : event.target.value })); setSaved(false); }
  function toggleBadge(id:string) { setSettings(current => ({ ...current, platformBadges:current.platformBadges.includes(id) ? current.platformBadges.filter(x => x !== id) : [...current.platformBadges,id] })); setSaved(false); }
  async function save() { await saveSettings({businessId,...settings}); setSaved(true); }
  return <>
    <div className="section-heading"><div><span className="eyebrow">Print-ready controls</span><h2>Business card front & back</h2></div><a className="button" href={`/print/${slug}`} target="_blank">Open print view</a></div>
    <p className="panel-intro">Edit every line and see the finished card immediately. The banner uses each client’s primary and secondary colors.</p>
    <div className="editor-preview-layout card-editor-layout"><div>
      <div className="segmented-tabs"><button className={face === "front" ? "active" : ""} onClick={() => setFace("front")}>Front</button><button className={face === "back" ? "active" : ""} onClick={() => setFace("back")}>Back</button></div>
      {face === "front" ? <div className="editor-section active"><h3>Review request side</h3><div className="settings-grid compact-settings"><label>Headline<input name="title" value={settings.title} onChange={change} /></label><label>Message<textarea name="subtitle" value={settings.subtitle} onChange={change} /></label><label>Phone<input name="phone" value={settings.phone} onChange={change} /></label><label>Website<input name="website" value={settings.website} onChange={change} /></label><label>QR caption<input name="scanLabel" value={settings.scanLabel} onChange={change} /></label><label>Headline color<input type="color" name="titleColor" value={settings.titleColor} onChange={change} /></label><label>Headline size <output>{settings.titleSize}px</output><input type="range" min="24" max="52" name="titleSize" value={settings.titleSize} onChange={change} /></label><label>Message size <output>{settings.subtitleSize}px</output><input type="range" min="12" max="26" name="subtitleSize" value={settings.subtitleSize} onChange={change} /></label></div><div className="badge-options"><strong>Review-site logos</strong><label><input type="checkbox" checked={settings.platformBadges.includes("google")} onChange={() => toggleBadge("google")} /> Google</label><label><input type="checkbox" checked={settings.platformBadges.includes("yelp")} onChange={() => toggleBadge("yelp")} /> Yelp</label><small>These are separate and stack vertically at a readable size.</small></div></div> : <div className="editor-section active"><h3>Thank-you side</h3><p>Professional defaults work across industries; every line remains client-specific.</p><div className="settings-grid"><label>Thank-you headline<input name="backTitle" value={settings.backTitle} onChange={change} /></label><label>Message<textarea name="backSubtitle" value={settings.backSubtitle} onChange={change} /></label><label>Footer<input name="backFooter" value={settings.backFooter} onChange={change} /></label><label>Headline color<input type="color" name="backTitleColor" value={settings.backTitleColor} onChange={change} /></label><label>Headline size <output>{settings.backTitleSize}px</output><input type="range" min="28" max="64" name="backTitleSize" value={settings.backTitleSize} onChange={change} /></label><label>Message size <output>{settings.backSubtitleSize}px</output><input type="range" min="12" max="30" name="backSubtitleSize" value={settings.backSubtitleSize} onChange={change} /></label></div></div>}
    </div><aside className="live-preview-sticky card-live-preview"><span className="eyebrow">Live {face} preview</span><CardArtwork face={face} settings={settings} slug={slug} businessName={workspace?.name} branding={workspace ? {logoUrl:workspace.logoUrl ?? defaultBusinessBranding.logoUrl,iconUrl:workspace.iconUrl ?? defaultBusinessBranding.iconUrl,googleBadgeUrl:workspace.googleBadgeUrl??defaultBusinessBranding.googleBadgeUrl,yelpBadgeUrl:workspace.yelpBadgeUrl??defaultBusinessBranding.yelpBadgeUrl,primaryColor:workspace.primaryColor,secondaryColor:workspace.secondaryColor ?? workspace.primaryColor} : defaultBusinessBranding} compact /></aside></div>
    <div className="settings-save"><small>{saved ? "Saved to this client account." : "Defaults are ready to customize."}</small><button className="button primary" onClick={save}>Save card settings</button></div>
  </>;
}
