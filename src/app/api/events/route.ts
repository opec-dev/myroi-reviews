import { NextResponse } from "next/server";
import { z } from "zod";
import { persistAnalyticsEvent } from "@/lib/server-events";

const schema=z.object({businessSlug:z.string().max(160),type:z.enum(["funnel_view","qr_scan","rating_selected","private_feedback_submitted","destination_clicked","maybe_later","public_review_fallback"]),occurredAt:z.string().datetime(),sessionId:z.string().max(100),source:z.string().max(60).optional(),destinationId:z.string().max(160).optional(),destinationName:z.string().max(160).optional(),rating:z.number().int().min(1).max(5).optional()});

export async function POST(request:Request){
  const parsed=schema.safeParse(await request.json().catch(()=>null));
  if(!parsed.success)return NextResponse.json({error:"Invalid analytics event"},{status:400});
  const {type,occurredAt,...event}=parsed.data;
  try{const persisted=await persistAnalyticsEvent({...event,eventType:type,occurredAt:new Date(occurredAt).getTime()});return NextResponse.json({accepted:true,persisted},{status:persisted?201:202})}
  catch{return NextResponse.json({accepted:false,error:"Analytics storage unavailable"},{status:503})}
}
