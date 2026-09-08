import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireUser } from "./helpers";

export const mine=query({args:{},handler:async ctx=>{const user=await requireUser(ctx);if(!user.isPlatformAdmin)throw new Error("Administrator access required");return await ctx.db.query("resellerEmailSettings").withIndex("by_owner",q=>q.eq("ownerUserId",user._id)).unique();}});
export const save=mutation({args:{smtpHost:v.string(),smtpPort:v.number(),smtpUser:v.string(),fromName:v.string(),fromEmail:v.string(),notifyEmailFailures:v.optional(v.boolean()),failureAlertEmail:v.optional(v.string()),alertSmtpHost:v.optional(v.string()),alertSmtpUser:v.optional(v.string()),alertFromEmail:v.optional(v.string())},handler:async(ctx,args)=>{const user=await requireUser(ctx);if(!user.isPlatformAdmin)throw new Error("Administrator access required");const current=await ctx.db.query("resellerEmailSettings").withIndex("by_owner",q=>q.eq("ownerUserId",user._id)).unique();if(current)await ctx.db.patch(current._id,args);else await ctx.db.insert("resellerEmailSettings",{ownerUserId:user._id,...args});}});
