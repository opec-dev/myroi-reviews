import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireBusinessAccess } from "./helpers";

const provider = v.union(v.literal("google"),v.literal("facebook"),v.literal("yelp"),v.literal("tripadvisor"),v.literal("trustpilot"),v.literal("g2"),v.literal("capterra"),v.literal("healthgrades"),v.literal("diamond"),v.literal("custom"));
export const listForBusiness = query({ args:{ businessId:v.id("businesses") }, handler:async(ctx,args)=>{ await requireBusinessAccess(ctx,args.businessId); return await ctx.db.query("reviewDestinations").withIndex("by_business",q=>q.eq("businessId",args.businessId)).collect(); }});
export const upsert = mutation({ args:{ id:v.optional(v.id("reviewDestinations")),businessId:v.id("businesses"),provider,label:v.string(),reviewUrl:v.string(),profileUrl:v.optional(v.string()),displayOrder:v.number(),isEnabled:v.boolean() }, handler:async(ctx,args)=>{ await requireBusinessAccess(ctx,args.businessId); const {id,...values}=args; if(id){await ctx.db.patch(id,values);return id;} return await ctx.db.insert("reviewDestinations",values); }});
export const remove = mutation({ args:{ id:v.id("reviewDestinations") }, handler:async(ctx,{id})=>{ const item=await ctx.db.get(id); if(!item) return; await requireBusinessAccess(ctx,item.businessId); await ctx.db.delete(id); }});
