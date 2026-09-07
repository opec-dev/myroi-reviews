import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireUser } from "./helpers";

export const syncCurrentUser = mutation({ args: {}, handler: async ctx => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Authentication required");
  const current = await ctx.db.query("users").withIndex("by_auth_subject", q => q.eq("authSubject", identity.subject)).unique();
  const email = String(identity.email ?? "").toLowerCase();
  const values = { email, displayName: identity.name, isPlatformAdmin: email === "support-team@myroiagency.com" };
  if (current) { await ctx.db.patch(current._id, values); return current._id; }
  const userId = await ctx.db.insert("users", { authSubject: identity.subject, ...values });
  const invitation = await ctx.db.query("pendingInvitations").withIndex("by_email", q => q.eq("email", email)).filter(q => q.eq(q.field("status"), "pending")).first();
  if (!invitation) return userId;

  const organizationId = await ctx.db.insert("organizations", { name: invitation.businessName, ownerUserId: userId });
  await ctx.db.insert("memberships", { organizationId, userId, role: "owner" });
  const baseSlug = invitation.businessName.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "business";
  const existingSlug = await ctx.db.query("businesses").withIndex("by_slug", q => q.eq("slug", baseSlug)).first();
  const slug = existingSlug ? `${baseSlug}-${Date.now().toString(36)}` : baseSlug;
  const businessId = await ctx.db.insert("businesses", { organizationId, name: invitation.businessName, slug, primaryColor: "#B100FF", isPublished: false });
  await Promise.all([
    ctx.db.insert("funnelSettings", {
      businessId, ratingHeadline: "How was your experience?", ratingSubtext: "Your feedback helps us serve you better. It only takes a few seconds.", positiveThreshold: 4,
      positiveHeadline: "Thank you so much!", positiveSubtext: "We're thrilled you had a great experience. Would you mind sharing it? It only takes a moment.", maybeLaterText: "Maybe later",
      completionHeadline: "Thanks for your feedback!", completionSubtext: "We truly appreciate you taking the time. You can close this window.",
      recoveryHeadline: "We're sorry we missed the mark", recoverySubtext: "Tell us what went wrong and we'll make it right. Your feedback goes straight to the owner.",
      nameLabel: "Your name", contactLabel: "Email or phone", messageLabel: "What went wrong?", submitText: "Send feedback privately", publicLinkText: "I prefer to post a public review",
    }),
    ctx.db.insert("printCardSettings", { businessId, title: "How was your experience?", subtitle: "Scan to share your feedback.", phone: "", website: "", scanLabel: "Scan to review", titleSize: 37, subtitleSize: 17, platformBadges: ["google", "yelp"], additionalLogoStorageIds: [] }),
    ctx.db.insert("embedSettings", { businessId, popupEnabled: true, popupPosition: "left", firstDelaySeconds: 10, rotationSeconds: 15, minimumRating: 4, wallEnabled: true, wallPageSize: 9 }),
  ]);
  await ctx.db.patch(invitation._id, { status: "accepted" });
  return userId;
}});

export const current = query({ args: {}, handler: async ctx => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  return await ctx.db.query("users").withIndex("by_auth_subject", q => q.eq("authSubject", identity.subject)).unique();
}});

export const listClients = query({ args: {}, handler: async ctx => {
  const user = await requireUser(ctx); if (!user.isPlatformAdmin) throw new Error("Administrator access required");
  const [users, invitations, businesses] = await Promise.all([ctx.db.query("users").collect(),ctx.db.query("pendingInvitations").collect(),ctx.db.query("businesses").collect()]);
  return { users, invitations, businesses };
}});

export const recordInvitation = mutation({ args: { email:v.string(), businessName:v.string(), workosInvitationId:v.optional(v.string()) }, handler: async(ctx,args)=>{
  const user=await requireUser(ctx); if(!user.isPlatformAdmin) throw new Error("Administrator access required");
  return await ctx.db.insert("pendingInvitations",{...args,email:args.email.toLowerCase(),invitedByUserId:user._id,status:"pending"});
}});
