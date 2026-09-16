"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

export function FeedbackInbox({businessId}:{businessId:Id<"businesses">}){
  const rows=useQuery(api.funnel.feedbackForBusiness,{businessId});
  const update=useMutation(api.funnel.updateFeedbackStatus);
  const unresolved=(rows??[]).filter(row=>row.status!=="resolved");
  return <>
    <div className="section-heading"><div><span className="eyebrow">Private recovery</span><h2>Feedback to follow up</h2></div><span className={`feedback-count ${unresolved.length?"has-items":""}`}>{unresolved.length} unresolved</span></div>
    <p className="panel-intro">Private comments from customers below the public-review threshold. Mark each item contacted or resolved so nothing gets lost.</p>
    {rows?.length?<div className="feedback-list">{rows.slice(0,20).map(row=><article key={row._id}><header><span><strong>{row.name||"Customer"}</strong><small>{row.rating}/5 · {row.contact}</small></span><time>{new Intl.DateTimeFormat(undefined,{dateStyle:"medium",timeStyle:"short"}).format(new Date(row._creationTime))}</time></header><p>{row.message}</p><footer><b className={`feedback-status ${row.status}`}>{row.status}</b><select aria-label="Follow-up status" value={row.status} onChange={event=>void update({feedbackId:row._id,status:event.target.value as "new"|"contacted"|"resolved"})}><option value="new">New</option><option value="contacted">Contacted</option><option value="resolved">Resolved</option></select></footer></article>)}</div>:<div className="analytics-empty">No private feedback yet.</div>}
  </>;
}
