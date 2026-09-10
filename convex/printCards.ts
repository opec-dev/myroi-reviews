import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireBusinessAccess } from "./helpers";

const fields = {
  title: v.string(), subtitle: v.string(), phone: v.string(), website: v.string(), scanLabel: v.string(),
  titleSize: v.number(), subtitleSize: v.number(), titleColor: v.string(), backTitle: v.string(),
  backSubtitle: v.string(), backFooter: v.string(), backTitleSize: v.number(), backSubtitleSize: v.number(),
  backTitleColor: v.string(), platformBadges: v.array(v.string()),
};

export const forBusiness = query({ args: { businessId: v.id("businesses") }, handler: async (ctx, { businessId }) => {
  await requireBusinessAccess(ctx, businessId);
  return await ctx.db.query("printCardSettings").withIndex("by_business", q => q.eq("businessId", businessId)).unique();
} });

export const publicBySlug = query({ args: { slug: v.string() }, handler: async (ctx, { slug }) => {
  const business = await ctx.db.query("businesses").withIndex("by_slug", q => q.eq("slug", slug)).unique();
  if (!business || !business.isPublished) return null;
  const settings = await ctx.db.query("printCardSettings").withIndex("by_business", q => q.eq("businessId", business._id)).unique();
  return {
    business: {
      name: business.name,
      slug: business.slug,
      primaryColor: business.primaryColor,
      secondaryColor: business.secondaryColor,
      logoUrl: business.logoStorageId ? await ctx.storage.getUrl(business.logoStorageId) : null,
      iconUrl: business.iconStorageId ? await ctx.storage.getUrl(business.iconStorageId) : null,
    },
    settings,
  };
} });

export const save = mutation({ args: { businessId: v.id("businesses"), ...fields }, handler: async (ctx, args) => {
  await requireBusinessAccess(ctx, args.businessId);
  const current = await ctx.db.query("printCardSettings").withIndex("by_business", q => q.eq("businessId", args.businessId)).unique();
  if (current) { const { businessId, ...values } = args; await ctx.db.patch(current._id, values); return current._id; }
  return await ctx.db.insert("printCardSettings", { ...args, additionalLogoStorageIds: [] });
} });
