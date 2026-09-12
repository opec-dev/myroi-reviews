import { mutation, query } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { v } from "convex/values";
import { requireUser } from "./helpers";

function isPlatformAdmin(email: string) {
  const configured = (process.env.PLATFORM_ADMIN_EMAILS ?? "oliver@sicconsulting.com,support-team@myroiagency.com")
    .split(",").map(value => value.trim().toLowerCase()).filter(Boolean);
  return configured.includes(email);
}

function slugify(value: string) { return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "business"; }

async function seedYorkshireReviews(ctx:MutationCtx,businessId:Id<"businesses">){const seeds=[{externalId:"pilot-google-dane-gibson",reviewerName:"Dane Gibson",rating:5,excerpt:"The job is always completed with meticulous attention to detail and cleaned up professionally.",sourceLabel:"Google",sourceUrl:"https://maps.app.goo.gl/nxMPvZYEQbnqxyqF6",sourceProvider:"google" as const},{externalId:"pilot-yelp-tim-k",reviewerName:"Tim K.",rating:5,excerpt:"Five-star customer service and repair. I was impressed by the team's professionalism and work ethic.",sourceLabel:"Yelp",sourceUrl:"https://www.yelp.com/biz/yorkshire-roofing-livermore-2",sourceProvider:"yelp" as const},{externalId:"pilot-diamond-bonnie-f",reviewerName:"Bonnie F.",rating:5,excerpt:"They were prompt, came when they said they would, and did a good job.",sourceLabel:"Diamond Certified",sourceUrl:"https://www.diamondcertified.org/report/yorkshire-roofing-of-northern-california-inc-dba-roofmax/",sourceProvider:"diamond" as const}];for(const seed of seeds){const existing=await ctx.db.query("reviews").withIndex("by_business_provider_external_id",q=>q.eq("businessId",businessId).eq("sourceProvider",seed.sourceProvider).eq("externalId",seed.externalId)).first();if(!existing)await ctx.db.insert("reviews",{businessId,...seed,importMethod:"manual",isPublished:true})}}

async function createBusiness(ctx: MutationCtx, ownerUserId: Id<"users">, name: string, preferredSlug?: string) {
  const organizationId = await ctx.db.insert("organizations", { name, ownerUserId });
  const baseSlug = preferredSlug ?? slugify(name);
  const existing = await ctx.db.query("businesses").withIndex("by_slug", q => q.eq("slug", baseSlug)).first();
  const slug = existing ? `${baseSlug}-${Date.now().toString(36)}` : baseSlug;
  const businessId = await ctx.db.insert("businesses", { organizationId, name, slug, primaryColor: "#B100FF", secondaryColor: "#8e00cc", isPublished: true });
  await Promise.all([
    ctx.db.insert("funnelSettings", { businessId, showBusinessName: false, ratingHeadline: "How was your experience?", ratingSubtext: "Your feedback helps us serve you better. It only takes a few seconds.", positiveThreshold: 4, positiveHeadline: "Thank you so much!", positiveSubtext: "We're thrilled you had a great experience. Would you mind sharing it? It only takes a moment.", maybeLaterText: "Maybe later", completionHeadline: "Thanks for your feedback!", completionSubtext: "We truly appreciate you taking the time. You can close this window.", recoveryHeadline: "We're sorry we missed the mark", recoverySubtext: "Tell us what went wrong and we'll make it right. Your feedback goes straight to the owner.", nameLabel: "Your name", contactLabel: "Email or phone", messageLabel: "What went wrong?", submitText: "Send feedback privately", publicLinkText: "I prefer to post a public review" }),
    ctx.db.insert("printCardSettings", { businessId, title: "Please Leave Us a Review", subtitle: "Your feedback helps our business grow. Scan the code, choose a review site, and share your experience.", phone: "", website: "", scanLabel: "Scan to review", titleSize: 37, subtitleSize: 17, titleColor: "#B100FF", backTitle: "Thank You!", backSubtitle: "We appreciate your business and the opportunity to serve you.", backFooter: "We look forward to seeing you again.", backTitleSize: 44, backSubtitleSize: 18, backTitleColor: "#8e00cc", platformBadges: ["google", "yelp"], additionalLogoStorageIds: [] }),
    ctx.db.insert("embedSettings", { businessId, popupEnabled: true, popupPosition: "left", firstDelaySeconds: 10, rotationSeconds: 15, minimumRating: 4, wallEnabled: true, wallPageSize: 9 }),
  ]);
  return { organizationId, businessId, slug };
}

async function provisionUser(ctx: MutationCtx, identity: { subject: string; name?: string }, emailValue: string, displayName?: string) {
  const email = emailValue.trim().toLowerCase();
  const current = await ctx.db.query("users").withIndex("by_auth_subject", q => q.eq("authSubject", identity.subject)).unique();
  const values = { email, displayName: displayName ?? identity.name, isPlatformAdmin: isPlatformAdmin(email) };
  if (current) {
    await ctx.db.patch(current._id, values);
    return current._id;
  }

  const userId = await ctx.db.insert("users", { authSubject: identity.subject, ...values });
  const invitation = await ctx.db.query("pendingInvitations").withIndex("by_email", q => q.eq("email", email)).filter(q => q.eq(q.field("status"), "pending")).first();
  if (!invitation) return userId;

  let organizationId = invitation.organizationId;
  if (organizationId) await ctx.db.patch(organizationId, { ownerUserId: userId });
  else ({ organizationId } = await createBusiness(ctx, userId, invitation.businessName));
  await ctx.db.insert("memberships", { organizationId: organizationId!, userId, role: "owner" });
  await ctx.db.patch(invitation._id, { status: "accepted" });
  return userId;
}

async function secretsMatch(provided: string, expected: string) {
  const encoder = new TextEncoder();
  const [providedDigest, expectedDigest] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(provided)),
    crypto.subtle.digest("SHA-256", encoder.encode(expected)),
  ]);
  const left = new Uint8Array(providedDigest);
  const right = new Uint8Array(expectedDigest);
  let difference = 0;
  for (let index = 0; index < left.length; index++) difference |= left[index] ^ right[index];
  return difference === 0;
}

export const syncCurrentUser = mutation({ args: {}, handler: async ctx => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Authentication required");
  return await provisionUser(ctx, identity, String(identity.email ?? ""));
}});

export const syncCurrentUserFromServer = mutation({
  args: { email: v.string(), displayName: v.optional(v.string()), provisioningSecret: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Authentication required");
    const expected = process.env.ANALYTICS_INGEST_SECRET;
    if (!expected || !(await secretsMatch(args.provisioningSecret, expected))) throw new Error("Provisioning authorization failed");
    return await provisionUser(ctx, identity, args.email, args.displayName);
  },
});

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
  const {organizationId,businessId}=await createBusiness(ctx,user._id,args.businessName);
  return await ctx.db.insert("pendingInvitations",{...args,organizationId,businessId,email:args.email.toLowerCase(),invitedByUserId:user._id,status:"pending"});
}});

export const bootstrapYorkshire = mutation({ args: {}, handler: async ctx => {
  const user = await requireUser(ctx); if (!user.isPlatformAdmin) throw new Error("Administrator access required");
  const existing = await ctx.db.query("businesses").withIndex("by_slug", q => q.eq("slug", "yorkshire-roofing")).unique();
  if (existing){await seedYorkshireReviews(ctx,existing._id);return existing._id}
  const created = await createBusiness(ctx, user._id, "Yorkshire Roofing", "yorkshire-roofing");
  await ctx.db.patch(created.businessId, { websiteUrl: "https://yorkshireroofing.com", phone: "(800) 794-7444", address: "7610 National Dr, Livermore, CA 94550", primaryColor: "#155aa8", secondaryColor: "#e63946" });
  await Promise.all([
    ctx.db.insert("reviewDestinations", { businessId: created.businessId, provider: "google", label: "Google", reviewUrl: "https://search.google.com/local/writereview?placeid=ChIJO_c-yLjgj4ARDnH58VKbhIg", profileUrl: "https://maps.app.goo.gl/nxMPvZYEQbnqxyqF6", displayOrder: 0, isEnabled: true }),
    ctx.db.insert("reviewDestinations", { businessId: created.businessId, provider: "yelp", label: "Yelp", reviewUrl: "https://www.yelp.com/writeareview/biz/XiuDvYUoONhqJLmLPNrkeg", profileUrl: "https://www.yelp.com/biz/yorkshire-roofing-livermore-2", displayOrder: 1, isEnabled: true }),
    ctx.db.insert("clientNotificationSettings", { businessId: created.businessId, notificationEmail: "opecora@sicconsulting.com", notifyPrivateFeedback: true, notifyNewReviews: false }),
  ]);
  await seedYorkshireReviews(ctx,created.businessId);
  return created.businessId;
} });

export const updateInvitation = mutation({ args: { invitationId: v.id("pendingInvitations"), workosInvitationId: v.optional(v.string()), status: v.optional(v.union(v.literal("pending"), v.literal("accepted"), v.literal("revoked"))) }, handler: async (ctx, args) => {
  const user = await requireUser(ctx); if (!user.isPlatformAdmin) throw new Error("Administrator access required");
  const { invitationId, ...values } = args; await ctx.db.patch(invitationId, values);
} });

export const removePendingClient = mutation({ args: { invitationId: v.id("pendingInvitations") }, handler: async (ctx, { invitationId }) => {
  const user = await requireUser(ctx); if (!user.isPlatformAdmin) throw new Error("Administrator access required");
  const invitation = await ctx.db.get(invitationId); if (!invitation || invitation.status !== "pending") throw new Error("Only pending client setups can be removed");
  if (invitation.businessId) {
    const businessId=invitation.businessId;
    const collections=await Promise.all([
      ctx.db.query("reviewDestinations").withIndex("by_business",q=>q.eq("businessId",businessId)).collect(),
      ctx.db.query("funnelSettings").withIndex("by_business",q=>q.eq("businessId",businessId)).collect(),
      ctx.db.query("printCardSettings").withIndex("by_business",q=>q.eq("businessId",businessId)).collect(),
      ctx.db.query("clientNotificationSettings").withIndex("by_business",q=>q.eq("businessId",businessId)).collect(),
      ctx.db.query("embedSettings").withIndex("by_business",q=>q.eq("businessId",businessId)).collect(),
    ]);
    for(const rows of collections)for(const row of rows)await ctx.db.delete(row._id);
    await ctx.db.delete(businessId);
  }
  if(invitation.organizationId){const memberships=await ctx.db.query("memberships").withIndex("by_organization",q=>q.eq("organizationId",invitation.organizationId!)).collect();for(const membership of memberships)await ctx.db.delete(membership._id);await ctx.db.delete(invitation.organizationId);}
  await ctx.db.delete(invitationId);
} });
