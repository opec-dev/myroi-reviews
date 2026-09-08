"use client";

import { useEffect, useMemo, useState } from "react";
import { AnalyticsEvent, EmailDeliveryLog } from "@/lib/demo-data";
import { readPilotEmailLog, readPilotEvents } from "@/lib/pilot-tracking";

const eventNames:Record<AnalyticsEvent["type"],string>={funnel_view:"Funnel viewed",qr_scan:"QR code scanned",rating_selected:"Rating selected",private_feedback_submitted:"Private form completed",destination_clicked:"Review link clicked",maybe_later:"Maybe later selected",public_review_fallback:"Public review fallback selected"};

export function ClientAnalytics({businessSlug}:{businessSlug:string}){
  const [events,setEvents]=useState<AnalyticsEvent[]>([]); const [emails,setEmails]=useState<EmailDeliveryLog[]>([]);
  useEffect(()=>{const load=()=>{setEvents(readPilotEvents().filter(x=>x.businessSlug===businessSlug));setEmails(readPilotEmailLog().filter(x=>x.businessSlug===businessSlug))};load();window.addEventListener("myroi-analytics-updated",load);window.addEventListener("myroi-email-log-updated",load);return()=>{window.removeEventListener("myroi-analytics-updated",load);window.removeEventListener("myroi-email-log-updated",load)}},[businessSlug]);
  const stats=useMemo(()=>summarize(events),[events]);
  return <><div className="analytics-metrics"><Metric label="Funnel visits" value={stats.views}/><Metric label="QR scans" value={stats.scans}/><Metric label="Forms completed" value={stats.forms}/><Metric label="Review-link clicks" value={stats.clicks}/><Metric label="Click conversion" value={`${stats.conversion}%`}/></div><div className="analytics-columns"><ActivityTable events={events}/><EmailTable emails={emails}/></div><small className="pilot-note">The public pilot stores activity in this browser. The connected deployment writes the same records to Convex for account-wide reporting.</small></>;
}

export function ResellerAnalytics(){
  const [emails,setEmails]=useState<EmailDeliveryLog[]>([]);
  useEffect(()=>{const load=()=>setEmails(readPilotEmailLog());load();window.addEventListener("myroi-email-log-updated",load);return()=>window.removeEventListener("myroi-email-log-updated",load)},[]);
  const failed=emails.filter(x=>x.status==="failed"); const unsent=emails.filter(x=>x.status!=="sent");
  return <>{unsent.length>0?<div className="delivery-alert"><strong>Email delivery needs attention</strong><span>{failed.length} failed and {unsent.length-failed.length} not sent. Client activity remains in each client workspace; this page only reports delivery-system health.</span></div>:<div className="delivery-ok"><strong>Email delivery health</strong><span>No unsuccessful email attempts recorded.</span></div>}<div className="system-health-grid"><Metric label="Failed deliveries" value={failed.length}/><Metric label="Not sent" value={unsent.length-failed.length}/><Metric label="Successful deliveries" value={emails.filter(x=>x.status==="sent").length}/></div><EmailTable emails={emails}/></>;
}

export function ResellerEmailHealth({openLog}:{openLog:()=>void}){
  const [emails,setEmails]=useState<EmailDeliveryLog[]>([]);
  useEffect(()=>{const load=()=>setEmails(readPilotEmailLog());load();window.addEventListener("myroi-email-log-updated",load);return()=>window.removeEventListener("myroi-email-log-updated",load)},[]);
  const unsent=emails.filter(x=>x.status!=="sent");
  return unsent.length?<button className="delivery-alert dashboard-alert" onClick={openLog}><span><strong>Email delivery needs attention</strong><small>{unsent.length} unsuccessful attempt{unsent.length===1?"":"s"} recorded. Open the delivery log.</small></span><b>Review →</b></button>:<div className="delivery-ok dashboard-alert"><span><strong>Email delivery health</strong><small>No unsuccessful attempts recorded.</small></span><b>Healthy</b></div>;
}

function summarize(events:AnalyticsEvent[]){const views=events.filter(x=>x.type==="funnel_view").length;const scans=events.filter(x=>x.type==="qr_scan").length;const forms=events.filter(x=>x.type==="private_feedback_submitted").length;const clicks=events.filter(x=>x.type==="destination_clicked").length;return{views,scans,forms,clicks,conversion:views?Math.round(clicks/views*100):0}}
function Metric({label,value}:{label:string;value:string|number}){return <article><span>{label}</span><strong>{value}</strong></article>}
function ActivityTable({events}:{events:AnalyticsEvent[]}){return <section className="activity-card"><div className="section-heading"><div><span className="eyebrow">Timestamped audit trail</span><h3>Recent activity</h3></div></div>{events.length?<div className="activity-list">{[...events].reverse().slice(0,20).map(row=><div key={row.id}><span><strong>{eventNames[row.type]}</strong><small>{[row.destinationName,row.rating?`${row.rating} stars`:undefined,row.source].filter(Boolean).join(" · ")}</small></span><time>{formatTime(row.occurredAt)}</time></div>)}</div>:<Empty text="No tracked activity yet."/>}</section>}
function EmailTable({emails}:{emails:EmailDeliveryLog[]}){return <section className="activity-card"><div className="section-heading"><div><span className="eyebrow">SMTP audit</span><h3>Email delivery history</h3></div></div>{emails.length?<div className="activity-list">{[...emails].reverse().slice(0,20).map(row=><div key={row.id}><span><strong>{row.subject}</strong><small>{[row.businessSlug,row.recipient,row.error].filter(Boolean).join(" · ")}</small></span><span><b className={`delivery-status ${row.status}`}>{row.status.replace("_"," ")}</b><time>{formatTime(row.occurredAt)}</time></span></div>)}</div>:<Empty text="No email attempts recorded yet."/>}</section>}
function Empty({text}:{text:string}){return <div className="analytics-empty">{text}</div>}
function formatTime(value:string){return new Intl.DateTimeFormat(undefined,{dateStyle:"medium",timeStyle:"short"}).format(new Date(value))}
