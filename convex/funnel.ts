import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireBusinessAccess } from "./helpers";

const settings = {
  showBusinessName: v.boolean(), ratingHeadline: v.string(), ratingSubtext: v.string(), positiveThreshold: v.number(), positiveHeadline: v.string(), positiveSubtext: v.string(), maybeLaterText: v.string(), completionHeadline: v.string(), completionSubtext: v.string(), recoveryHeadline: v.string(), recoverySubtext: v.string(), nameLabel: v.string(), contactLabel: v.string(), messageLabel: v.string(), submitText: v.string(), publicLinkText: v.string(),
};

export const publicBySlug = query({ args: { slug: v.string() }, handler: async (ctx, { slug }) => {
  const business = await ctx.db.query("businesses").withIndex("by_slug", q => q.eq("slug", slug)).unique();
  if (!business || !business.isPublished) return null;
  const [funnel, destinations] = await Promise.all([
    ctx.db.query("funnelSettings").withIndex("by_business", q => q.eq("businessId", business._id)).unique(),
    ctx.db.query("reviewDestinations").withIndex("by_business", q => q.eq("businessId", business._id)).collect(),
  ]);
  return { business, funnel, destinations: destinations.filter(x => x.isEnabled) };
}});

export const saveSettings = mutation({ args: { businessId: v.id("businesses"), ...settings }, handler: async (ctx, args) => {
  await requireBusinessAccess(ctx, args.businessId);
  const current = await ctx.db.query("funnelSettings").withIndex("by_business", q => q.eq("businessId", args.businessId)).unique();
  const { businessId, ...values } = args;
  if (current) await ctx.db.patch(current._id, values); else await ctx.db.insert("funnelSettings", args);
}});

export const submitPrivateFeedback = mutation({ args: { slug: v.string(), rating: v.number(), name: v.optional(v.string()), contact: v.string(), message: v.string() }, handler: async (ctx, args) => {
  const business = await ctx.db.query("businesses").withIndex("by_slug", q => q.eq("slug", args.slug)).unique();
  if (!business || !business.isPublished) throw new Error("Business not found");
  if (args.rating < 1 || args.rating > 5 || args.contact.length > 200 || args.message.length > 5000) throw new Error("Invalid feedback");
  return await ctx.db.insert("privateFeedback", { businessId: business._id, rating: args.rating, name: args.name, contact: args.contact, message: args.message, status: "new" });
}});
