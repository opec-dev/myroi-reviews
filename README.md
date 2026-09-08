# myROI Reviews

An owner-operated review marketing MVP for local businesses. The product gives each business a branded review destination, QR collateral, and reusable website displays for its best reviews.

## MVP scope

- User accounts and business workspaces
- Business profile, logo, colors, and website
- Google, Yelp, Diamond Certified, and custom review destinations
- Branded, mobile-first rating funnel with positive review choices and private service-recovery feedback
- QR code with centered logo
- Print-ready review card export
- Curated review library with source attribution
- Rotating review popup embed
- Review wall/grid embed
- Per-client funnel, QR, form-completion, and review-link click analytics
- Timestamped SMTP delivery history with reseller failure monitoring

The MVP keeps each platform's direct write-review link separate from its public profile/import source. It links customers to third-party review platforms and does not publish or reply to reviews on their behalf.

The current Yorkshire Roofing pilot includes its supplied branding, direct Google and Yelp review destinations, Diamond Certified as a display source, a customizable rating/recovery funnel, a 15-second rotating popup, review wall, branded QR, and configurable print-card preview.

The main URL is the myROIagency reseller dashboard. The Yorkshire client workspace lives at `/client/yorkshire-roofing`. Client branding supports a full logo plus a separate square QR icon and per-client primary/secondary colors. The two-sided print card has editable copy, font sizes and headline colors, while the funnel editor includes stage-by-stage live previews.

SMTP delivery is implemented for private-feedback alerts on a server-capable production deployment. Configure the `SMTP_*` variables from `.env.example`; secrets stay in the deployment environment. New-review notification preferences are modeled and exposed in the reseller settings for use when the automated review-import adapter is enabled.

Analytics events and email results are stored in Convex in the connected deployment. The static design pilot mirrors the feature in browser storage so the workflow can be evaluated, but account-wide aggregation requires the server-capable deployment. QR codes carry a `src=qr` marker so scans are separated from ordinary review-link visits. An optional independent `ALERT_SMTP_*` connection sends administrator warnings when primary delivery fails.

See [docs/mvp-spec.md](docs/mvp-spec.md) for the product specification and [docs/architecture.md](docs/architecture.md) for the technical design.

## Planned stack

- Next.js, React, and TypeScript
- Convex for application data and server functions
- WorkOS AuthKit for authentication
- Azure Static Web Apps or Railway for the first deployment

The app keeps authentication provider-neutral so Microsoft Entra External ID can replace WorkOS later if Azure consolidation becomes worthwhile.
