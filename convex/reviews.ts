import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireBusinessAccess } from "./helpers";

const provider=v.union(v.literal("google"),v.literal("facebook"),v.literal("yelp"),v.literal("tripadvisor"),v.literal("trustpilot"),v.literal("g2"),v.literal("capterra"),v.literal("healthgrades"),v.literal("diamond"),v.literal("custom"));
const importedReview=v.object({externalId:v.optional(v.string()),reviewerName:v.string(),rating:v.number(),excerpt:v.string(),reviewDate:v.optional(v.string()),sourceLabel:v.string(),sourceUrl:v.string(),sourceProvider:provider,isPublished:v.boolean()});

export const listForBusiness=query({args:{businessId:v.id("businesses")},handler:async(ctx,{businessId})=>{await requireBusinessAccess(ctx,businessId);return await ctx.db.query("reviews").withIndex("by_business",q=>q.eq("businessId",businessId)).collect();}});

export const importMany=mutation({args:{businessId:v.id("businesses"),reviews:v.array(importedReview)},handler:async(ctx,{businessId,reviews})=>{
  await requireBusinessAccess(ctx,businessId);let added=0,updated=0;
  for(const item of reviews.slice(0,1000)){
    if(item.rating<1||item.rating>5||!item.reviewerName.trim()||!item.excerpt.trim())continue;
    const externalId=item.externalId?.trim()||fingerprint(item);
    const existing=await ctx.db.query("reviews").withIndex("by_business_provider_external_id",q=>q.eq("businessId",businessId).eq("sourceProvider",item.sourceProvider).eq("externalId",externalId)).first();
    const values={...item,externalId,reviewerName:item.reviewerName.trim(),excerpt:item.excerpt.trim(),sourceLabel:item.sourceLabel.trim(),sourceUrl:item.sourceUrl.trim(),importMethod:"csv" as const};
    if(existing){await ctx.db.patch(existing._id,values);updated++}else{await ctx.db.insert("reviews",{businessId,...values});added++}
  }
  return{added,updated,total:added+updated};
}});

export const publicBySlug=query({args:{slug:v.string()},handler:async(ctx,{slug})=>{
  const business=await ctx.db.query("businesses").withIndex("by_slug",q=>q.eq("slug",slug)).unique();if(!business||!business.isPublished)return null;
  const rows=await ctx.db.query("reviews").withIndex("by_business_published",q=>q.eq("businessId",business._id).eq("isPublished",true)).collect();
  const logoUrl=business.logoStorageId?await ctx.storage.getUrl(business.logoStorageId):null;
  return{business:{name:business.name,slug:business.slug,primaryColor:business.primaryColor,logoUrl,publicReviewPageUrl:business.publicReviewPageUrl},reviews:rows.sort((a,b)=>String(b.reviewDate??"").localeCompare(String(a.reviewDate??"")))};
}});

function fingerprint(item:{reviewerName:string;reviewDate?:string;excerpt:string}){return `${item.reviewerName}|${item.reviewDate??""}|${item.excerpt}`.toLowerCase().replace(/\s+/g," ").slice(0,500)}
