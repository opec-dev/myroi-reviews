import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    authSubject: v.string(),
    email: v.string(),
    displayName: v.optional(v.string()),
  }).index("by_auth_subject", ["authSubject"]),

  organizations: defineTable({
    name: v.string(),
    ownerUserId: v.id("users"),
  }).index("by_owner", ["ownerUserId"]),

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
});
