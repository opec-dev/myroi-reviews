export type ReviewProvider =
  | "google" | "facebook" | "yelp" | "tripadvisor" | "trustpilot"
  | "g2" | "capterra" | "healthgrades" | "diamond" | "custom";

export type ReviewDestination = {
  id: string;
  provider: ReviewProvider;
  name: string;
  reviewUrl: string;
  profileUrl?: string;
  color: string;
  enabled: boolean;
};

export const reviewPlatformCatalog: Array<{ provider: ReviewProvider; name: string; color: string }> = [
  { provider: "google", name: "Google", color: "#4285f4" },
  { provider: "facebook", name: "Facebook", color: "#1877f2" },
  { provider: "yelp", name: "Yelp", color: "#d32323" },
  { provider: "tripadvisor", name: "Tripadvisor", color: "#34e0a1" },
  { provider: "trustpilot", name: "Trustpilot", color: "#00b67a" },
  { provider: "g2", name: "G2", color: "#ff492c" },
  { provider: "capterra", name: "Capterra", color: "#ff9d28" },
  { provider: "healthgrades", name: "Healthgrades", color: "#007d78" },
  { provider: "diamond", name: "Diamond Certified", color: "#1b4f8a" },
  { provider: "custom", name: "Custom", color: "#6857d9" },
];

export const destinationStorageKey = "myroi:destinations:yorkshire-roofing";
export const funnelSettingsStorageKey = "myroi:funnel:yorkshire-roofing";
export const printSettingsStorageKey = "myroi:print:yorkshire-roofing";
export const privateFeedbackStorageKey = "myroi:feedback:yorkshire-roofing";

export type FunnelSettings = {
  ratingHeadline: string;
  ratingSubtext: string;
  positiveThreshold: number;
  positiveHeadline: string;
  positiveSubtext: string;
  maybeLaterText: string;
  completionHeadline: string;
  completionSubtext: string;
  recoveryHeadline: string;
  recoverySubtext: string;
  nameLabel: string;
  contactLabel: string;
  messageLabel: string;
  submitText: string;
  publicLinkText: string;
};

export const defaultFunnelSettings: FunnelSettings = {
  ratingHeadline: "How was your experience?",
  ratingSubtext: "Your feedback helps us serve you better. It only takes a few seconds.",
  positiveThreshold: 4,
  positiveHeadline: "Thank you so much!",
  positiveSubtext: "We're thrilled you had a great experience. Would you mind sharing it? It only takes a moment.",
  maybeLaterText: "Maybe later",
  completionHeadline: "Thanks for your feedback!",
  completionSubtext: "We truly appreciate you taking the time. You can close this window.",
  recoveryHeadline: "We're sorry we missed the mark",
  recoverySubtext: "Tell us what went wrong and we'll make it right. Your feedback goes straight to the owner.",
  nameLabel: "Your name",
  contactLabel: "Email or phone",
  messageLabel: "What went wrong?",
  submitText: "Send feedback privately",
  publicLinkText: "I prefer to post a public review",
};

export type PrintSettings = {
  title: string;
  subtitle: string;
  phone: string;
  website: string;
  scanLabel: string;
  titleSize: number;
  subtitleSize: number;
  platformBadges: string[];
};

export const defaultPrintSettings: PrintSettings = {
  title: "How was your experience?",
  subtitle: "Scan to share your feedback. Your review helps local homeowners choose with confidence.",
  phone: "(800) 794-7444",
  website: "yorkshireroofing.com",
  scanLabel: "Scan to review",
  titleSize: 37,
  subtitleSize: 17,
  platformBadges: ["google-yelp"],
};

export type PublishedReview = {
  id: string;
  reviewer: string;
  rating: number;
  excerpt: string;
  source: string;
  sourceUrl: string;
  reviewUrl?: string;
};

export const demoBusiness = {
  name: "Yorkshire Roofing",
  slug: "yorkshire-roofing",
  initials: "YR",
  website: "https://yorkshireroofing.com",
  address: "7610 National Dr, Livermore, CA 94550",
  phone: "(800) 794-7444",
  logoUrl: "/brands/yorkshire-roofing.png",
  accent: "#155aa8",
  accentSecondary: "#e63946",
  reviewUrl: "/r/yorkshire-roofing",
};

export const demoDestinations: ReviewDestination[] = [
  {
    id: "google",
    provider: "google",
    name: "Google",
    reviewUrl: "https://search.google.com/local/writereview?placeid=ChIJO_c-yLjgj4ARDnH58VKbhIg",
    profileUrl: "https://maps.app.goo.gl/nxMPvZYEQbnqxyqF6",
    color: "#4285f4",
    enabled: true,
  },
  {
    id: "yelp",
    provider: "yelp",
    name: "Yelp",
    reviewUrl:
      "https://www.yelp.com/writeareview/biz/XiuDvYUoONhqJLmLPNrkeg?return_url=%2Fbiz%2FXiuDvYUoONhqJLmLPNrkeg&review_origin=biz-details-war-button",
    profileUrl: "https://www.yelp.com/biz/yorkshire-roofing-livermore-2",
    color: "#d32323",
    enabled: true,
  },
  {
    id: "diamond",
    provider: "diamond",
    name: "Diamond Certified",
    reviewUrl:
      "https://www.diamondcertified.org/report/yorkshire-roofing-of-northern-california-inc-dba-roofmax/",
    profileUrl:
      "https://www.diamondcertified.org/report/yorkshire-roofing-of-northern-california-inc-dba-roofmax/",
    color: "#1b4f8a",
    enabled: false,
  },
];

export const demoReviews: PublishedReview[] = [
  {
    id: "review-1",
    reviewer: "Dane Gibson",
    rating: 5,
    excerpt:
      "The job is always completed with meticulous attention to detail and cleaned up professionally.",
    source: "Google",
    sourceUrl: demoDestinations[0].profileUrl!,
    reviewUrl: demoDestinations[0].reviewUrl,
  },
  {
    id: "review-2",
    reviewer: "Tim K.",
    rating: 5,
    excerpt:
      "Five-star customer service and repair. I was impressed by the team's professionalism and work ethic.",
    source: "Yelp",
    sourceUrl: demoDestinations[1].profileUrl!,
    reviewUrl: demoDestinations[1].reviewUrl,
  },
  {
    id: "review-3",
    reviewer: "Bonnie F.",
    rating: 5,
    excerpt:
      "They were prompt, came when they said they would, and did a good job.",
    source: "Diamond Certified",
    sourceUrl: demoDestinations[2].profileUrl!,
  },
];
