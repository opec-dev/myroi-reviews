# myROI Reviews MVP specification

## Product promise

Give a local business one simple place to configure where customers can leave reviews and reuse selected high-quality reviews on its own website.

## Primary users

1. **Platform administrator** — myROI staff using `support-team@myroiagency.com`; creates and supports client accounts and manages myROI branding.
2. **Client owner** — receives an invitation and initially manages one business and one website.
3. **Review visitor** — scans a QR code or follows a link to choose an external review site.
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
- Destination name, direct review URL, public profile URL, icon, display order, and enabled state
- URL validation and safe external-link handling

### Public review page

- Branded URL at `/r/{businessSlug}`
- Logo and business colors
- Neutral prompt asking where the visitor would like to share their experience
- Equal access to all enabled review destinations
- Optional private-feedback link shown to every visitor
- Click attribution without intercepting the third-party review submission

### QR and print collateral

- QR code points to the branded public review page
- Centered logo with a protected white quiet area and high error correction
- PNG and SVG download
- Print-ready 3.5 × 2 inch business-card PDF with bleed and safe margins
- Front design contains configurable business logo/name, review-request wording, QR code, and fallback URL
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
- Links each review to its source

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

- The public page never conditions access to review destinations on a rating.
- The application does not ask for a predetermined positive rating.
- Private feedback is available on the same basis to every visitor.
- Review displays retain platform attribution and link to the original source.
- Imported reviews require an attestation that the business has the right to display them.
- Provider content retention and refresh rules are enforced per provider.

## Acceptance criteria

1. A new owner can create an account and business workspace.
2. The owner can add Google, Yelp, Diamond Certified, or custom destinations.
3. The public review page reflects logo, colors, and enabled destinations.
4. A visitor can reach an external review form in two taps or fewer.
5. The owner can download a scannable logo-centered QR code.
6. The print PDF passes a 300-DPI visual and QR scan check.
7. The owner can add and publish a curated review.
8. The popup and wall display published reviews on an unrelated test page.
9. Disabling a review or destination removes it from public output without changing embed code.
10. Tenant authorization tests prove one business cannot access another business's data.
