import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireBusinessAccess, requireUser } from "./helpers";

const eventType=v.union(v.literal("funnel_view"),v.literal("qr_scan"),v.literal("rating_selected"),v.literal("private_feedback_submitted"),v.literal("destination_clicked"),v.literal("maybe_later"),v.literal("public_review_fallback"));
const emailKind=v.union(v.literal("private_feedback"),v.literal("new_review"),v.literal("admin_failure_alert"),v.literal("invitation"));
const emailStatus=v.union(v.literal("sent"),v.literal("not_sent"),v.literal("failed"));

function verifySecret(secret:string){if(!process.env.ANALYTICS_INGEST_SECRET||secret!==process.env.ANALYTICS_INGEST_SECRET)throw new Error("Invalid ingest secret")}

export const recordEvent=mutation({args:{secret:v.string(),businessSlug:v.string(),eventType,occurredAt:v.number(),sessionId:v.string(),source:v.optional(v.string()),destinationId:v.optional(v.string()),destinationName:v.optional(v.string()),rating:v.optional(v.number())},handler:async(ctx,args)=>{verifySecret(args.secret);const business=await ctx.db.query("businesses").withIndex("by_slug",q=>q.eq("slug",args.businessSlug)).unique();if(!business)throw new Error("Business not found");const {secret,businessSlug,...event}=args;return await ctx.db.insert("analyticsEvents",{businessId:business._id,...event})}});

export const recordEmail=mutation({args:{secret:v.string(),businessSlug:v.optional(v.string()),kind:emailKind,status:emailStatus,recipient:v.string(),subject:v.string(),error:v.optional(v.string()),occurredAt:v.number()},handler:async(ctx,args)=>{verifySecret(args.secret);const business=args.businessSlug?await ctx.db.query("businesses").withIndex("by_slug",q=>q.eq("slug",args.businessSlug!)).unique():null;const {secret,businessSlug,...log}=args;return await ctx.db.insert("emailDeliveryLogs",{...log,...(business?{businessId:business._id}:{})})}});

export const forBusiness=query({args:{businessId:v.id("businesses"),since:v.optional(v.number())},handler:async(ctx,args)=>{await requireBusinessAccess(ctx,args.businessId);const events=await ctx.db.query("analyticsEvents").withIndex("by_business_time",q=>q.eq("businessId",args.businessId).gte("occurredAt",args.since??0)).collect();const emails=await ctx.db.query("emailDeliveryLogs").withIndex("by_business_time",q=>q.eq("businessId",args.businessId).gte("occurredAt",args.since??0)).collect();return{events,emails}}});

export const resellerOverview=query({args:{since:v.optional(v.number())},handler:async(ctx,args)=>{const user=await requireUser(ctx);if(!user.isPlatformAdmin)throw new Error("Administrator access required");const since=args.since??0;const events=await ctx.db.query("analyticsEvents").collect();const emails=await ctx.db.query("emailDeliveryLogs").collect();return{events:events.filter(x=>x.occurredAt>=since),emails:emails.filter(x=>x.occurredAt>=since)}}});
