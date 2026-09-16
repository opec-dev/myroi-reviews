import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { makeFunctionReference } from "convex/server";
import { APP_ORIGIN } from "@/lib/auth-config";
import { persistAnalyticsEvent } from "@/lib/server-events";

export const dynamic="force-dynamic";

export async function GET(_request:Request,{params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;
  let target=new URL(`/r/${encodeURIComponent(slug)}`,APP_ORIGIN);
  const convexUrl=process.env.NEXT_PUBLIC_CONVEX_URL;
  if(convexUrl){
    try{
      const data=await new ConvexHttpClient(convexUrl).query(makeFunctionReference<"query">("businesses:publicLinkBySlug"),{slug}) as null|{publicReviewPageUrl?:string};
      if(data?.publicReviewPageUrl)target=new URL(data.publicReviewPageUrl);
    }catch{/* The permanent hosted funnel remains a safe fallback. */}
  }
  target.searchParams.set("src","qr");
  target.searchParams.set("tracked","1");
  await persistAnalyticsEvent({businessSlug:slug,eventType:"qr_scan",occurredAt:Date.now(),sessionId:crypto.randomUUID(),source:"qr"}).catch(()=>{});
  return NextResponse.redirect(target,302);
}
