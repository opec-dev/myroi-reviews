import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

export async function requireUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Authentication required");
  const user = await ctx.db.query("users").withIndex("by_auth_subject", q => q.eq("authSubject", identity.subject)).unique();
  if (!user) throw new Error("User account has not been provisioned");
  return user;
}

export async function requireBusinessAccess(ctx: QueryCtx | MutationCtx, businessId: Id<"businesses">) {
  const user = await requireUser(ctx);
  if (user.isPlatformAdmin) return user;
  const business = await ctx.db.get(businessId);
  if (!business) throw new Error("Business not found");
  const membership = await ctx.db.query("memberships").withIndex("by_organization_user", q => q.eq("organizationId", business.organizationId).eq("userId", user._id)).unique();
  if (!membership) throw new Error("Access denied");
  return user;
}
