import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireBusinessAccess } from "./helpers";

function verifySecret(secret:string){if(!process.env.ANALYTICS_INGEST_SECRET||secret!==process.env.ANALYTICS_INGEST_SECRET)throw new Error("Invalid ingest secret")}

export const mine=query({args:{businessId:v.id("businesses")},handler:async(ctx,args)=>{await requireBusinessAccess(ctx,args.businessId);return await ctx.db.query("clientNotificationSettings").withIndex("by_business",q=>q.eq("businessId",args.businessId)).unique()}});

export const save=mutation({args:{businessId:v.id("businesses"),notificationEmail:v.string(),notifyPrivateFeedback:v.boolean(),notifyNewReviews:v.boolean()},handler:async(ctx,args)=>{await requireBusinessAccess(ctx,args.businessId);const current=await ctx.db.query("clientNotificationSettings").withIndex("by_business",q=>q.eq("businessId",args.businessId)).unique();if(current){await ctx.db.patch(current._id,{notificationEmail:args.notificationEmail.toLowerCase(),notifyPrivateFeedback:args.notifyPrivateFeedback,notifyNewReviews:args.notifyNewReviews});return current._id}return await ctx.db.insert("clientNotificationSettings",{...args,notificationEmail:args.notificationEmail.toLowerCase()})}});

export const forIngest=query({args:{secret:v.string(),businessSlug:v.string()},handler:async(ctx,args)=>{verifySecret(args.secret);const business=await ctx.db.query("businesses").withIndex("by_slug",q=>q.eq("slug",args.businessSlug)).unique();if(!business)return null;return await ctx.db.query("clientNotificationSettings").withIndex("by_business",q=>q.eq("businessId",business._id)).unique()}});
