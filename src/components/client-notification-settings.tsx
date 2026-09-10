"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { ClientNotificationSettings, defaultClientNotificationSettings } from "@/lib/demo-data";

export function ClientNotificationSettingsEditor({businessId,businessName}:{businessId:Id<"businesses">;businessName:string}){
  const stored=useQuery(api.clientNotifications.mine,{businessId});const saveSettings=useMutation(api.clientNotifications.save);
  const [settings,setSettings]=useState<ClientNotificationSettings>(defaultClientNotificationSettings);
  const [saved,setSaved]=useState(false);
  useEffect(()=>{if(stored)setSettings({...defaultClientNotificationSettings,...stored})},[stored]);
  function change(event:ChangeEvent<HTMLInputElement>){const key=event.target.name as keyof ClientNotificationSettings;setSettings(current=>({...current,[key]:event.target.type==="checkbox"?event.target.checked:event.target.value}));setSaved(false)}
  async function save(){await saveSettings({businessId,...settings});setSaved(true)}
  return <>
    <div className="section-heading"><div><span className="eyebrow">Client notifications</span><h2>Who should receive alerts?</h2></div></div>
    <p className="panel-intro">Messages are sent from the reseller’s master email account to this client’s notification address.</p>
    <div className="settings-grid"><label>Client notification email<input name="notificationEmail" type="email" value={settings.notificationEmail} onChange={change}/></label></div>
    <div className="notification-options"><label><input type="checkbox" name="notifyPrivateFeedback" checked={settings.notifyPrivateFeedback} onChange={change}/> Email this client when private low-rating feedback is submitted</label><label><input type="checkbox" name="notifyNewReviews" checked={settings.notifyNewReviews} onChange={change}/> Email this client when a new review is imported</label></div>
    <div className="notification-flow"><span><b>From</b> Master reseller email service</span><strong>→</strong><span><b>To</b> {settings.notificationEmail||"Client email not set"}</span></div>
    <div className="settings-save"><small>{saved?"Client notification preferences saved.":`These preferences apply only to ${businessName}.`}</small><button className="button primary" onClick={save}>Save notification settings</button></div>
  </>;
}
