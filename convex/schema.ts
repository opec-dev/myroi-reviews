import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    authSubject: v.string(),
    email: v.string(),
    displayName: v.optional(v.string()),
    isPlatformAdmin: v.boolean(),
  }).index("by_auth_subject", ["authSubject"]),

  organizations: defineTable({
    name: v.string(),
    ownerUserId: v.id("users"),
  }).index("by_owner", ["ownerUserId"]),

  pendingInvitations: defineTable({
    email: v.string(),
    businessName: v.string(),
    invitedByUserId: v.id("users"),
    status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("revoked")),
    workosInvitationId: v.optional(v.string()),
  }).index("by_email", ["email"]),

  memberships: defineTable({
    organizationId: v.id("organizations"),
    userId: v.id("users"),
    role: v.union(v.literal("owner"), v.literal("admin")),
  })
    .index("by_organization", ["organizationId"])
    .index("by_user", ["userId"])
    .index("by_organization_user", ["organizationId", "userId"]),

  businesses: defineTable({
    organizationId: v.id("organizations"),
    name: v.string(),
    slug: v.string(),
    websiteUrl: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    logoStorageId: v.optional(v.id("_storage")),
    iconStorageId: v.optional(v.id("_storage")),
    primaryColor: v.string(),
    secondaryColor: v.optional(v.string()),
    isPublished: v.boolean(),
  })
    .index("by_organization", ["organizationId"])
    .index("by_slug", ["slug"]),

  reviewDestinations: defineTable({
    businessId: v.id("businesses"),
    provider: v.union(
      v.literal("google"),
      v.literal("facebook"),
      v.literal("yelp"),
      v.literal("tripadvisor"),
      v.literal("trustpilot"),
      v.literal("g2"),
      v.literal("capterra"),
      v.literal("healthgrades"),
      v.literal("diamond"),
      v.literal("custom"),
    ),
    label: v.string(),
    reviewUrl: v.string(),
    profileUrl: v.optional(v.string()),
    displayOrder: v.number(),
    isEnabled: v.boolean(),
  }).index("by_business", ["businessId", "displayOrder"]),

  funnelSettings: defineTable({
    businessId: v.id("businesses"),
    showBusinessName: v.boolean(),
    ratingHeadline: v.string(),
    ratingSubtext: v.string(),
    positiveThreshold: v.number(),
    positiveHeadline: v.string(),
    positiveSubtext: v.string(),
    maybeLaterText: v.string(),
    completionHeadline: v.string(),
    completionSubtext: v.string(),
    recoveryHeadline: v.string(),
    recoverySubtext: v.string(),
    nameLabel: v.string(),
    contactLabel: v.string(),
    messageLabel: v.string(),
    submitText: v.string(),
    publicLinkText: v.string(),
  }).index("by_business", ["businessId"]),

  privateFeedback: defineTable({
    businessId: v.id("businesses"),
    rating: v.number(),
    name: v.optional(v.string()),
    contact: v.string(),
    message: v.string(),
    status: v.union(v.literal("new"), v.literal("contacted"), v.literal("resolved")),
  })
    .index("by_business", ["businessId"])
    .index("by_business_status", ["businessId", "status"]),

  printCardSettings: defineTable({
    businessId: v.id("businesses"),
    title: v.string(),
    subtitle: v.string(),
    phone: v.string(),
    website: v.string(),
    scanLabel: v.string(),
    titleSize: v.number(),
    subtitleSize: v.number(),
    titleColor: v.string(),
    backTitle: v.string(),
    backSubtitle: v.string(),
    backFooter: v.string(),
    backTitleSize: v.number(),
    backSubtitleSize: v.number(),
    backTitleColor: v.string(),
    platformBadges: v.array(v.string()),
    additionalLogoStorageIds: v.array(v.id("_storage")),
  }).index("by_business", ["businessId"]),

  resellerEmailSettings: defineTable({
    ownerUserId: v.id("users"),
    smtpHost: v.string(),
    smtpPort: v.number(),
    smtpUser: v.string(),
    fromName: v.string(),
    fromEmail: v.string(),
    notificationEmail: v.optional(v.string()),
    notifyPrivateFeedback: v.optional(v.boolean()),
    notifyNewReviews: v.optional(v.boolean()),
    notifyEmailFailures: v.optional(v.boolean()),
    failureAlertEmail: v.optional(v.string()),
    alertSmtpHost: v.optional(v.string()),
    alertSmtpUser: v.optional(v.string()),
    alertFromEmail: v.optional(v.string()),
  }).index("by_owner", ["ownerUserId"]),

  clientNotificationSettings: defineTable({
    businessId: v.id("businesses"),
    notificationEmail: v.string(),
    notifyPrivateFeedback: v.boolean(),
    notifyNewReviews: v.boolean(),
  }).index("by_business", ["businessId"]),

  reviews: defineTable({
    businessId: v.id("businesses"),
    externalId: v.optional(v.string()),
    reviewerName: v.string(),
    rating: v.number(),
    excerpt: v.string(),
    reviewDate: v.optional(v.string()),
    sourceLabel: v.string(),
    sourceUrl: v.string(),
    sourceProvider: v.union(
      v.literal("google"),
      v.literal("facebook"),
      v.literal("yelp"),
      v.literal("tripadvisor"),
      v.literal("trustpilot"),
      v.literal("g2"),
      v.literal("capterra"),
      v.literal("healthgrades"),
      v.literal("diamond"),
      v.literal("custom"),
    ),
    importMethod: v.union(v.literal("manual"), v.literal("csv"), v.literal("provider")),
    isPublished: v.boolean(),
  })
    .index("by_business", ["businessId"])
    .index("by_business_published", ["businessId", "isPublished"])
    .index("by_provider_external_id", ["sourceProvider", "externalId"]),

  embedSettings: defineTable({
    businessId: v.id("businesses"),
    popupEnabled: v.boolean(),
    popupPosition: v.union(v.literal("left"), v.literal("right")),
    firstDelaySeconds: v.number(),
    rotationSeconds: v.number(),
    minimumRating: v.number(),
    wallEnabled: v.boolean(),
    wallPageSize: v.number(),
  }).index("by_business", ["businessId"]),

  outboundClicks: defineTable({
    businessId: v.id("businesses"),
    destinationId: v.id("reviewDestinations"),
    source: v.union(v.literal("review_page"), v.literal("qr"), v.literal("popup"), v.literal("wall")),
    occurredAt: v.number(),
  })
    .index("by_business_time", ["businessId", "occurredAt"])
    .index("by_destination_time", ["destinationId", "occurredAt"]),

  analyticsEvents: defineTable({
    businessId: v.id("businesses"),
    eventType: v.union(v.literal("funnel_view"),v.literal("qr_scan"),v.literal("rating_selected"),v.literal("private_feedback_submitted"),v.literal("destination_clicked"),v.literal("maybe_later"),v.literal("public_review_fallback")),
    occurredAt: v.number(),
    sessionId: v.string(),
    source: v.optional(v.string()),
    destinationId: v.optional(v.string()),
    destinationName: v.optional(v.string()),
    rating: v.optional(v.number()),
  })
    .index("by_business_time",["businessId","occurredAt"])
    .index("by_business_type_time",["businessId","eventType","occurredAt"]),

  emailDeliveryLogs: defineTable({
    businessId: v.optional(v.id("businesses")),
    kind: v.union(v.literal("private_feedback"),v.literal("new_review"),v.literal("admin_failure_alert"),v.literal("invitation")),
    status: v.union(v.literal("sent"),v.literal("not_sent"),v.literal("failed")),
    recipient: v.string(),
    subject: v.string(),
    error: v.optional(v.string()),
    occurredAt: v.number(),
  })
    .index("by_business_time",["businessId","occurredAt"])
    .index("by_status_time",["status","occurredAt"]),
});
