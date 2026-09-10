import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { requireUser } from "./helpers";

async function requireAdmin(ctx: QueryCtx | MutationCtx) {
  const user = await requireUser(ctx);
  if (!user.isPlatformAdmin) throw new Error("Administrator access required");
  return user;
}

export const mine = query({ args: {}, handler: async ctx => {
  const user = await requireAdmin(ctx);
  const row = await ctx.db.query("resellerSettings").withIndex("by_owner", q => q.eq("ownerUserId", user._id)).unique();
  if (!row) return null;
  const [logoUrl, iconUrl] = await Promise.all([
    row.logoStorageId ? ctx.storage.getUrl(row.logoStorageId) : null,
    row.iconStorageId ? ctx.storage.getUrl(row.iconStorageId) : null,
  ]);
  return { ...row, logoUrl, iconUrl };
} });

export const save = mutation({ args: {
  businessName: v.string(), supportEmail: v.string(), website: v.string(),
  logoStorageId: v.optional(v.id("_storage")), iconStorageId: v.optional(v.id("_storage")),
}, handler: async (ctx, args) => {
  const user = await requireAdmin(ctx);
  const current = await ctx.db.query("resellerSettings").withIndex("by_owner", q => q.eq("ownerUserId", user._id)).unique();
  if (current) { await ctx.db.patch(current._id, args); return current._id; }
  return await ctx.db.insert("resellerSettings", { ownerUserId: user._id, ...args });
} });

export const generateUploadUrl = mutation({ args: {}, handler: async ctx => {
  await requireAdmin(ctx);
  return await ctx.storage.generateUploadUrl();
} });
