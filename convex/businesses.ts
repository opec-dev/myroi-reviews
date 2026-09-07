import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireBusinessAccess, requireUser } from "./helpers";

export const mine = query({ args:{}, handler:async ctx=>{ const user=await requireUser(ctx); if(user.isPlatformAdmin) return await ctx.db.query("businesses").collect(); const memberships=await ctx.db.query("memberships").withIndex("by_user",q=>q.eq("userId",user._id)).collect(); const rows=await Promise.all(memberships.map(async m=>await ctx.db.query("businesses").withIndex("by_organization",q=>q.eq("organizationId",m.organizationId)).collect())); return rows.flat(); }});
export const update = mutation({ args:{ businessId:v.id("businesses"),name:v.string(),websiteUrl:v.optional(v.string()),phone:v.optional(v.string()),address:v.optional(v.string()),primaryColor:v.string(),secondaryColor:v.optional(v.string()),isPublished:v.boolean() }, handler:async(ctx,args)=>{ await requireBusinessAccess(ctx,args.businessId); const {businessId,...values}=args; await ctx.db.patch(businessId,values); }});
