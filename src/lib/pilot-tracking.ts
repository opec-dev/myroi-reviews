"use client";

import { AnalyticsEvent, AnalyticsEventType, analyticsStorageKey, EmailDeliveryLog, emailLogStorageKey } from "@/lib/demo-data";

function read<T>(key:string):T[]{
  try{return JSON.parse(localStorage.getItem(key)??"[]") as T[]}catch{return []}
}

export function getPilotSessionId(){
  const key="myroi:analytics-session";
  let value=sessionStorage.getItem(key);
  if(!value){value=crypto.randomUUID();sessionStorage.setItem(key,value)}
  return value;
}

export function trackPilotEvent(event:{businessSlug:string;type:AnalyticsEventType;source?:string;destinationId?:string;destinationName?:string;rating?:number}){
  const row:AnalyticsEvent={id:crypto.randomUUID(),occurredAt:new Date().toISOString(),sessionId:getPilotSessionId(),...event};
  localStorage.setItem(analyticsStorageKey,JSON.stringify([...read<AnalyticsEvent>(analyticsStorageKey),row].slice(-1000)));
  window.dispatchEvent(new Event("myroi-analytics-updated"));
  fetch("/api/events",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(row)}).catch(()=>{});
  return row;
}

export function recordPilotEmail(log:Omit<EmailDeliveryLog,"id"|"occurredAt">){
  const row:EmailDeliveryLog={id:crypto.randomUUID(),occurredAt:new Date().toISOString(),...log};
  localStorage.setItem(emailLogStorageKey,JSON.stringify([...read<EmailDeliveryLog>(emailLogStorageKey),row].slice(-500)));
  window.dispatchEvent(new Event("myroi-email-log-updated"));
  return row;
}

export function readPilotEvents(){return read<AnalyticsEvent>(analyticsStorageKey)}
export function readPilotEmailLog(){return read<EmailDeliveryLog>(emailLogStorageKey)}
