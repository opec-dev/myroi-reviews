# myROI Reviews MVP specification

## Product promise

Give a local business one simple place to configure where customers can leave reviews and reuse selected high-quality reviews on its own website.

## Primary users

1. **Platform administrator** — myROI staff using `support-team@myroiagency.com`; creates and supports client accounts and manages myROI branding.
2. **Client owner** — receives an invitation and initially manages one business and one website.
3. **Review visitor** — scans a QR code or follows a link, rates the experience, and continues to either public review choices or private service recovery.
4. **Website visitor** — sees review proof in the popup or review wall.

## Included in v1

### Account and business setup

- Sign up, sign in, password reset, and sign out
- Admin-created client invitations; public self-signup is disabled initially
- One business and one website per client login in v1
- Business name, slug, website, phone, address, logo, and brand colors
- Separate myROI platform branding and client business branding
- One owner per workspace initially; the schema will allow multiple users, businesses, and locations later

### Review destinations

- Google
- Yelp
- Diamond Certified
- Custom destination
- Destination name, direct write-review URL, separate review source/profile URL, icon, display order, and enabled state
- Only destinations with a verified review-entry URL are enabled in the public funnel
- URL validation and safe external-link handling

### Public review page

- Branded URL at `/r/{businessSlug}`
- Logo and business colors
- Mobile-first five-star experience prompt with a configurable positive threshold (default: 4)
- Ratings at or above the threshold show enabled direct review destinations using “Review us on …” actions
- Ratings below the threshold show an editable private service-recovery form
- Public review access remains visible from the private-feedback screen
- Editable copy for the rating, positive, recovery, and completion stages
- “Maybe later” completion path
- Click attribution without intercepting the third-party review submission

### QR and print collateral

- QR code points to the branded public review page
- Centered logo with a protected white quiet area and high error correction
- PNG and SVG download
- Print-ready 3.5 × 2 inch business-card PDF with bleed and safe margins
- Front design contains configurable business logo/name, title, subtitle, phone, website, QR caption, QR code, and type sizes
- Separate built-in Google and Yelp review logos, each independently selectable, plus room for additional client or industry badges
- Optional back design contains instructions or contact information
- Admin-selectable templates with client-specific preview before export

### Review library

- Curated review records with reviewer display name, rating, excerpt, date, source, source URL, and publication state
- Manual entry and CSV import in the first release
- Provider adapter interface for later Google synchronization
- Only published reviews appear in website embeds
- Source attribution and outbound source link are always retained

### Website embeds

#### Rotating popup

- Single script installation
- Configurable lower-left or lower-right position
- Configurable rotation interval with a 15-second default
- First appearance delay, rotation interval, theme, and minimum rating settings
- Pause while opened and hide near the site footer
- Mobile responsive, keyboard accessible, and dismissible
- Uses “Review us on …” calls to action when a direct review-entry link is configured

#### Review wall

- Script or iframe installation
- Responsive card grid
- Business logo, aggregate summary, source filters, and pagination/load-more
- Configurable minimum rating, maximum count, theme, and accent color
- Structured data is deliberately excluded until legal/SEO eligibility is verified

### Basic dashboard

- Business setup completeness
- Review-page link and QR preview
- Destination status
- Published review count
- Popup and review-wall installation snippets
- Recent outbound review-link clicks

## Explicitly deferred

- Email and SMS request campaigns
- Contact/customer CRM
- Automated reminders
- Publishing or replying to Google/Yelp reviews
- AI-generated review responses
- Billing and subscriptions
- Agency/reseller hierarchy
- Custom domains
- Multiple team roles beyond owner/admin
- Multiple websites, businesses, or locations per client
- Full Google Business Profile synchronization
- Yelp review synchronization beyond what its licensed API plan permits

## Compliance behavior

- The initial prompt asks for an honest experience rating without requesting a predetermined positive score.
- Lower ratings receive a service-recovery path, while a clearly visible public-review option remains available.
- Destination links are never hidden from a visitor who chooses the public-review option.
- Review displays retain platform attribution and link to the original source.
- Imported reviews require an attestation that the business has the right to display them.
- Provider content retention and refresh rules are enforced per provider.

## Acceptance criteria

1. An administrator can invite an owner; the owner's first login provisions a tenant-isolated business workspace.
2. The owner can add Google, Yelp, Diamond Certified, or custom destinations.
3. The public funnel reflects logo, colors, editable copy, threshold, and enabled direct-review destinations.
4. A visitor who selects a positive rating can reach an external review-entry form in two taps or fewer.
5. A lower-rating visitor can submit private feedback and can still choose a public review destination.
6. The owner can download a scannable logo-centered QR code.
7. The print PDF passes a 300-DPI visual and QR scan check.
8. The owner can add and publish a curated review.
9. The popup and wall display published reviews on an unrelated test page.
10. Disabling a review or destination removes it from public output without changing embed code.
11. Tenant authorization tests prove one business cannot access another business's data.
