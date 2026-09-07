# MVP architecture

## Recommended deployment

```text
Customer browser
      |
      v
Next.js application (Azure Static Web Apps or Railway)
      |
      +---- WorkOS AuthKit initially
      |
      +---- Convex
             |-- business and destination data
             |-- review library
             |-- embed configuration
             |-- click events
             |-- scheduled provider refreshes (later)
             `-- public HTTP endpoints
```

The popup loader should be a very small, cacheable JavaScript asset. It obtains public configuration and published review data using a non-secret embed key. Dashboard operations use authenticated Convex functions with organization authorization checks.

## Security boundaries

- Public embed keys identify a business but grant no write access.
- All dashboard mutations verify membership on the server.
- URLs are validated against `https:` and rendered with `noopener noreferrer`.
- Review excerpts are rendered as text, never injected as HTML.
- Uploads validate file type, size, and decoded image content.
- Secrets stay in deployment environment variables.
- Authentication credentials and provider OAuth tokens never enter application logs.

## Initial entities

- `users`
- `organizations`
- `memberships`
- `businesses`
- `reviewDestinations`
- `reviews`
- `embedConfigurations`
- `reviewLinkEvents`
- `assets`

## Provider strategy

The UI and database use a provider adapter contract rather than coupling the product to Google or Yelp.

```ts
type ReviewProviderAdapter = {
  connect(businessId: string): Promise<void>;
  refresh(businessId: string): Promise<ProviderReview[]>;
  disconnect(businessId: string): Promise<void>;
};
```

For the first release, `manual` and `csv` adapters are implemented. Google Business Profile OAuth can be added once API access is approved. Yelp's standard review endpoint provides only a limited set of excerpts and may require a paid plan, so it is not treated as a complete synchronization source.

## Hosting decision

Convex is the initial data and server-function layer because it minimizes infrastructure and is sufficient for the expected ten-client MVP. The public widget payload will be cached so ordinary customer-site page views do not each require a database query.

The Next.js application can deploy to Azure Static Web Apps or Railway. Azure is preferred when keeping billing and operations in the existing Microsoft account matters; Railway is the simpler fallback if Azure's hybrid Next.js preview creates deployment friction. Vercel remains technically compatible but is not required.

WorkOS AuthKit is the quickest initial invitation/login implementation. Microsoft Entra External ID is an alternative when consolidating identity in Azure becomes more valuable than minimizing setup time. The application auth boundary is kept provider-neutral so this choice can be changed without redesigning tenant data.

An all-Azure option (Static Web Apps/App Service, Functions, Cosmos DB, Blob Storage, and Entra External ID) is intentionally deferred. It can be inexpensive at this scale, but it creates more services, permissions, local emulation, and deployment configuration than Convex for the MVP.
