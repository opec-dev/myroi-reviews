"use client";

import { useMemo } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { AnalyticsEvent, EmailDeliveryLog } from "@/lib/demo-data";
import { readPilotEmailLog, readPilotEvents } from "@/lib/pilot-tracking";

const eventNames:Record<AnalyticsEvent["type"],string>={funnel_view:"Funnel viewed",qr_scan:"QR code scanned",rating_selected:"Rating selected",private_feedback_submitted:"Private form completed",destination_clicked:"Review link clicked",maybe_later:"Maybe later selected",public_review_fallback:"Public review fallback selected"};

export function ClientAnalytics({businessId}:{businessId:Id<"businesses">}){
  const data=useQuery(api.analytics.forBusiness,{businessId});
  const events:AnalyticsEvent[]=(data?.events??[]).map(row=>({id:row._id,businessSlug:"",type:row.eventType,occurredAt:new Date(row.occurredAt).toISOString(),sessionId:row.sessionId,source:row.source,destinationId:row.destinationId,destinationName:row.destinationName,rating:row.rating}));
  const emails:EmailDeliveryLog[]=(data?.emails??[]).map(row=>({id:row._id,kind:row.kind,status:row.status,recipient:row.recipient,subject:row.subject,occurredAt:new Date(row.occurredAt).toISOString(),error:row.error,providerRole:row.providerRole}));
  const stats=useMemo(()=>summarize(events),[events]);
  return <><div className="analytics-metrics"><Metric label="Funnel visits" value={stats.views}/><Metric label="QR scans" value={stats.scans}/><Metric label="Forms completed" value={stats.forms}/><Metric label="Review-link clicks" value={stats.clicks}/><Metric label="Click conversion" value={`${stats.conversion}%`}/></div><div className="analytics-columns"><ActivityTable events={events}/><EmailTable emails={emails}/></div><small className="pilot-note">Activity is stored in Convex and shared across authorized users for this client.</small></>;
}

export function ResellerAnalytics(){
  const data=useQuery(api.analytics.resellerOverview,{});const acknowledge=useMutation(api.emailSettings.acknowledgeAlerts);const emails:EmailDeliveryLog[]=(data?.emails??[]).map(row=>({id:row._id,kind:row.kind,status:row.status,recipient:row.recipient,subject:row.subject,occurredAt:new Date(row.occurredAt).toISOString(),error:row.error,providerRole:row.providerRole}));
  const active=emails.filter(x=>x.status!=="sent"&&new Date(x.occurredAt).getTime()>(data?.alertsAcknowledgedAt??0));const failed=active.filter(x=>x.status==="failed");
  return <>{active.length>0?<div className="delivery-alert"><span><strong>Email delivery needs attention</strong><small>{failed.length} failed and {active.length-failed.length} not sent since the last acknowledgement.</small></span><button className="button" onClick={()=>void acknowledge({})}>Acknowledge current alerts</button></div>:<div className="delivery-ok"><strong>Email delivery health</strong><span>No unacknowledged delivery warnings. Full history remains below.</span></div>}<div className="system-health-grid"><Metric label="Active failed" value={failed.length}/><Metric label="Active not sent" value={active.length-failed.length}/><Metric label="All successful deliveries" value={emails.filter(x=>x.status==="sent").length}/></div><EmailTable emails={emails}/></>;
}

export function ResellerEmailHealth({openLog}:{openLog:()=>void}){
  const data=useQuery(api.analytics.resellerOverview,{});const emails=data?.emails??[];
  const unsent=emails.filter(x=>x.status!=="sent"&&x.occurredAt>(data?.alertsAcknowledgedAt??0));
  return unsent.length?<button className="delivery-alert dashboard-alert" onClick={openLog}><span><strong>Email delivery needs attention</strong><small>{unsent.length} unsuccessful attempt{unsent.length===1?"":"s"} recorded. Open the delivery log.</small></span><b>Review →</b></button>:<div className="delivery-ok dashboard-alert"><span><strong>Email delivery health</strong><small>No unsuccessful attempts recorded.</small></span><b>Healthy</b></div>;
}

function summarize(events:AnalyticsEvent[]){const views=events.filter(x=>x.type==="funnel_view").length;const scans=events.filter(x=>x.type==="qr_scan").length;const forms=events.filter(x=>x.type==="private_feedback_submitted").length;const clicks=events.filter(x=>x.type==="destination_clicked").length;return{views,scans,forms,clicks,conversion:views?Math.round(clicks/views*100):0}}
function Metric({label,value}:{label:string;value:string|number}){return <article><span>{label}</span><strong>{value}</strong></article>}
function ActivityTable({events}:{events:AnalyticsEvent[]}){return <section className="activity-card"><div className="section-heading"><div><span className="eyebrow">Timestamped audit trail</span><h3>Recent activity</h3></div></div>{events.length?<div className="activity-list">{[...events].reverse().slice(0,20).map(row=><div key={row.id}><span><strong>{eventNames[row.type]}</strong><small>{[row.destinationName,row.rating?`${row.rating} stars`:undefined,row.source?`Source: ${sourceLabel(row.source)}`:undefined].filter(Boolean).join(" · ")}</small></span><time>{formatTime(row.occurredAt)}</time></div>)}</div>:<Empty text="No tracked activity yet."/>}</section>}
function EmailTable({emails}:{emails:EmailDeliveryLog[]}){return <section className="activity-card"><div className="section-heading"><div><span className="eyebrow">Delivery audit</span><h3>Email delivery history</h3></div></div>{emails.length?<div className="activity-list">{[...emails].reverse().slice(0,20).map(row=><div key={row.id}><span><strong>{row.subject}</strong><small>{[row.providerRole?`${row.providerRole} provider`:undefined,row.businessSlug,row.recipient,row.error].filter(Boolean).join(" · ")}</small></span><span><b className={`delivery-status ${row.status}`}>{row.status.replace("_"," ")}</b><time>{formatTime(row.occurredAt)}</time></span></div>)}</div>:<Empty text="No email attempts recorded yet."/>}</section>}
function Empty({text}:{text:string}){return <div className="analytics-empty">{text}</div>}
function formatTime(value:string){return new Intl.DateTimeFormat(undefined,{dateStyle:"medium",timeStyle:"short"}).format(new Date(value))}
function sourceLabel(value:string){return value==="qr"?"QR code":value==="direct"?"Direct link":value.replaceAll("_"," ")}
