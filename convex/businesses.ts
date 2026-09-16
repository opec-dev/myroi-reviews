import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireBusinessAccess, requireUser } from "./helpers";

export const mine = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    if (user.isPlatformAdmin) return await ctx.db.query("businesses").collect();
    const memberships = await ctx.db
      .query("memberships")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    const rows = await Promise.all(
      memberships.map(
        async (m) =>
          await ctx.db
            .query("businesses")
            .withIndex("by_organization", (q) =>
              q.eq("organizationId", m.organizationId),
            )
            .collect(),
      ),
    );
    return rows.flat();
  },
});
export const workspaceBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const business = await ctx.db
      .query("businesses")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (!business) return null;
    await requireBusinessAccess(ctx, business._id);
    const [logoUrl, iconUrl, googleBadgeUrl, yelpBadgeUrl] = await Promise.all([
      business.logoStorageId
        ? ctx.storage.getUrl(business.logoStorageId)
        : null,
      business.iconStorageId
        ? ctx.storage.getUrl(business.iconStorageId)
        : null,
      business.googleBadgeStorageId
        ? ctx.storage.getUrl(business.googleBadgeStorageId)
        : null,
      business.yelpBadgeStorageId
        ? ctx.storage.getUrl(business.yelpBadgeStorageId)
        : null,
    ]);
    return { ...business, logoUrl, iconUrl, googleBadgeUrl, yelpBadgeUrl };
  },
});
export const publicLinkBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const business = await ctx.db
      .query("businesses")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (!business || !business.isPublished) return null;
    return { publicReviewPageUrl: business.publicReviewPageUrl };
  },
});
export const update = mutation({
  args: {
    businessId: v.id("businesses"),
    name: v.string(),
    websiteUrl: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    publicReviewPageUrl: v.optional(v.string()),
    primaryColor: v.string(),
    secondaryColor: v.optional(v.string()),
    isPublished: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireBusinessAccess(ctx, args.businessId);
    const { businessId, ...values } = args;
    await ctx.db.patch(businessId, values);
  },
});
export const generateUploadUrl = mutation({
  args: { businessId: v.id("businesses") },
  handler: async (ctx, { businessId }) => {
    await requireBusinessAccess(ctx, businessId);
    return await ctx.storage.generateUploadUrl();
  },
});
const socialProvider = v.union(
  v.literal("facebook"),
  v.literal("instagram"),
  v.literal("x"),
  v.literal("tiktok"),
  v.literal("youtube"),
  v.literal("linkedin"),
  v.literal("website"),
);
export const saveBranding = mutation({
  args: {
    businessId: v.id("businesses"),
    logoStorageId: v.optional(v.id("_storage")),
    iconStorageId: v.optional(v.id("_storage")),
    googleBadgeStorageId: v.optional(v.id("_storage")),
    yelpBadgeStorageId: v.optional(v.id("_storage")),
    publicReviewPageUrl: v.optional(v.string()),
    socialLinks: v.optional(
      v.array(v.object({ provider: socialProvider, url: v.string() })),
    ),
    primaryColor: v.string(),
    secondaryColor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireBusinessAccess(ctx, args.businessId);
    const { businessId, ...values } = args;
    const publicReviewPageUrl = values.publicReviewPageUrl?.trim() || undefined;
    if (
      publicReviewPageUrl &&
      new URL(publicReviewPageUrl).protocol !== "https:"
    )
      throw new Error("The customer review link must use https://.");
    const socialLinks = (values.socialLinks ?? [])
      .map((link) => ({ ...link, url: link.url.trim() }))
      .filter((link) => link.url);
    for (const link of socialLinks) {
      if (new URL(link.url).protocol !== "https:")
        throw new Error("Social links must use https://.");
    }
    await ctx.db.patch(businessId, {
      ...values,
      publicReviewPageUrl,
      socialLinks,
    });
  },
});
