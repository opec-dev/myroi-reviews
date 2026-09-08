"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { clientNotificationSettingsStorageKey, ClientNotificationSettings, defaultClientNotificationSettings } from "@/lib/demo-data";

export function ClientNotificationSettingsEditor(){
  const [settings,setSettings]=useState<ClientNotificationSettings>(defaultClientNotificationSettings);
  const [saved,setSaved]=useState(false);
  useEffect(()=>{const value=localStorage.getItem(clientNotificationSettingsStorageKey);if(value)try{setSettings({...defaultClientNotificationSettings,...JSON.parse(value)})}catch{}},[]);
  function change(event:ChangeEvent<HTMLInputElement>){const key=event.target.name as keyof ClientNotificationSettings;setSettings(current=>({...current,[key]:event.target.type==="checkbox"?event.target.checked:event.target.value}));setSaved(false)}
  function save(){localStorage.setItem(clientNotificationSettingsStorageKey,JSON.stringify(settings));setSaved(true);window.dispatchEvent(new Event("myroi-client-notifications-updated"))}
  return <>
    <div className="section-heading"><div><span className="eyebrow">Client notifications</span><h2>Who should receive alerts?</h2></div></div>
    <p className="panel-intro">Messages are sent from the reseller’s master email account to this client’s notification address.</p>
    <div className="settings-grid"><label>Client notification email<input name="notificationEmail" type="email" value={settings.notificationEmail} onChange={change}/></label></div>
    <div className="notification-options"><label><input type="checkbox" name="notifyPrivateFeedback" checked={settings.notifyPrivateFeedback} onChange={change}/> Email this client when private low-rating feedback is submitted</label><label><input type="checkbox" name="notifyNewReviews" checked={settings.notifyNewReviews} onChange={change}/> Email this client when a new review is imported</label></div>
    <div className="notification-flow"><span><b>From</b> Master reseller email service</span><strong>→</strong><span><b>To</b> {settings.notificationEmail||"Client email not set"}</span></div>
    <div className="settings-save"><small>{saved?"Client notification preferences saved.":"These preferences apply only to Yorkshire Roofing."}</small><button className="button primary" onClick={save}>Save notification settings</button></div>
  </>;
}
