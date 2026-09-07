export type ReviewDestination = {
  id: string;
  name: string;
  reviewUrl: string;
  color: string;
  enabled: boolean;
};

export type PublishedReview = {
  id: string;
  reviewer: string;
  rating: number;
  excerpt: string;
  source: string;
  sourceUrl: string;
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
    name: "Google",
    reviewUrl: "https://maps.app.goo.gl/nxMPvZYEQbnqxyqF6",
    color: "#4285f4",
    enabled: true,
  },
  {
    id: "yelp",
    name: "Yelp",
    reviewUrl:
      "https://www.yelp.com/writeareview/biz/XiuDvYUoONhqJLmLPNrkeg?return_url=%2Fbiz%2FXiuDvYUoONhqJLmLPNrkeg&review_origin=biz-details-war-button",
    color: "#d32323",
    enabled: true,
  },
  {
    id: "diamond",
    name: "Diamond Certified",
    reviewUrl:
      "https://www.diamondcertified.org/report/yorkshire-roofing-of-northern-california-inc-dba-roofmax/",
    color: "#1b4f8a",
    enabled: true,
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
    sourceUrl: demoDestinations[0].reviewUrl,
  },
  {
    id: "review-2",
    reviewer: "Tim K.",
    rating: 5,
    excerpt:
      "Five-star customer service and repair. I was impressed by the team's professionalism and work ethic.",
    source: "Yelp",
    sourceUrl: demoDestinations[1].reviewUrl,
  },
  {
    id: "review-3",
    reviewer: "Bonnie F.",
    rating: 5,
    excerpt:
      "They were prompt, came when they said they would, and did a good job.",
    source: "Diamond Certified",
    sourceUrl: demoDestinations[2].reviewUrl,
  },
];
