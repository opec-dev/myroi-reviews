# myROI Reviews

An owner-operated review marketing MVP for local businesses. The product gives each business a branded review destination, QR collateral, and reusable website displays for its best reviews.

## MVP scope

- User accounts and business workspaces
- Business profile, logo, colors, and website
- Google, Yelp, Diamond Certified, and custom review destinations
- Branded public review page
- QR code with centered logo
- Print-ready review card export
- Curated review library with source attribution
- Rotating review popup embed
- Review wall/grid embed

The MVP links customers directly to third-party review platforms. It does not publish, suppress, or reply to third-party reviews.

The current Yorkshire Roofing pilot includes its supplied branding, Google/Yelp/Diamond Certified destinations, a 15-second rotating popup, review wall, branded QR, and print-card preview.

See [docs/mvp-spec.md](docs/mvp-spec.md) for the product specification and [docs/architecture.md](docs/architecture.md) for the technical design.

## Planned stack

- Next.js, React, and TypeScript
- Convex for application data and server functions
- WorkOS AuthKit for authentication
- Azure Static Web Apps or Railway for the first deployment

The app keeps authentication provider-neutral so Microsoft Entra External ID can replace WorkOS later if Azure consolidation becomes worthwhile.
