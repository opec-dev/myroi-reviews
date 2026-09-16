import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireBusinessAccess } from "./helpers";

const values = {
  popupEnabled: v.boolean(),
  popupPosition: v.union(v.literal("left"), v.literal("right")),
  firstDelaySeconds: v.number(),
  rotationSeconds: v.number(),
  minimumRating: v.number(),
  wallEnabled: v.boolean(),
  wallPageSize: v.number(),
  wallBackgroundColor: v.string(),
  showReviewDates: v.boolean(),
};

export const forBusiness = query({
  args: { businessId: v.id("businesses") },
  handler: async (ctx, { businessId }) => {
    await requireBusinessAccess(ctx, businessId);
    return await ctx.db.query("embedSettings").withIndex("by_business", q => q.eq("businessId", businessId)).unique();
  },
});

export const save = mutation({
  args: { businessId: v.id("businesses"), ...values },
  handler: async (ctx, args) => {
    await requireBusinessAccess(ctx, args.businessId);
    if (args.rotationSeconds < 5 || args.rotationSeconds > 300) throw new Error("Popup interval must be between 5 and 300 seconds.");
    if (!/^#[0-9a-f]{6}$/i.test(args.wallBackgroundColor)) throw new Error("Choose a valid wall background color.");
    const current = await ctx.db.query("embedSettings").withIndex("by_business", q => q.eq("businessId", args.businessId)).unique();
    const { businessId, ...settings } = args;
    if (current) await ctx.db.patch(current._id, settings);
    else await ctx.db.insert("embedSettings", { businessId, ...settings });
  },
});
