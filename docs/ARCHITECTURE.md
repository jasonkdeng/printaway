# PrintAway Application Architecture

## Status

This document defines the architecture for the first application scaffold. The repository does not yet contain the paths, packages, or scripts described here.

## Architectural principles

1. **Server first.** Render routes and data-dependent UI with Server Components unless an interaction, browser API, or WebGL boundary requires a Client Component.
2. **Domain before provider.** PrintAway-owned models and interfaces describe products, configurations, estimates, carts, and quotes. External services adapt to them.
3. **Thin routes.** Route files compose feature modules, metadata, and loading/error boundaries; they do not contain substantial domain logic.
4. **Pure calculations.** Validation, compatibility, totals, and estimate calculations live in framework-neutral functions.
5. **Small client islands.** Hydrate only the configurator, cart controls, filters, and 3D viewer surfaces that need it.
6. **Progressive enhancement.** A static image and complete textual information exist before or without JavaScript and WebGL.
7. **Typed failures.** Expected domain and provider failures are modeled and mapped to safe user-facing states.
8. **Observable boundaries.** Server-side provider calls carry request context and structured errors without logging personal uploads or unnecessary contact data.

## Planned directory map

```text
src/
  app/
    (marketing)/
      about/
      materials/
      page.tsx
    shop/
      [slug]/
      page.tsx
    studio/
      page.tsx
    cart/
      page.tsx
    policies/
      [slug]/
    api/
      quote/
    layout.tsx
    error.tsx
    not-found.tsx
  components/
    a11y/
    layout/
    media/
    ui/
  features/
    cart/
      domain/
      server/
      ui/
    shop/
      domain/
      server/
      ui/
    studio/
      domain/
      server/
      ui/
  lib/
    currency/
    errors/
    validation/
  server/
    adapters/
    config/
    observability/
  styles/
    globals.css
    tokens.css
    motion.css
public/
  images/
  models/
tests/
  e2e/
```

Responsibilities:

- `src/app`: routing, layouts, metadata, route handlers, and route-level state boundaries.
- `src/features/*/domain`: schemas, types, compatibility rules, and pure calculations.
- `src/features/*/server`: use cases that coordinate repositories and services.
- `src/features/*/ui`: feature-specific rendering and interaction.
- `src/components`: genuinely shared primitives with no feature policy.
- `src/lib`: small framework-neutral helpers used by multiple features.
- `src/server/adapters`: external provider implementations.
- `src/server/config`: validated server-only environment configuration.
- `src/server/observability`: structured logging and error-reporting boundaries.
- `public/images`: responsive stills and model posters.
- `public/models`: production-optimized GLB assets only.
- `tests/e2e`: critical user journeys and cross-route failure handling.

Do not create barrel files that obscure server/client boundaries. Server-only modules must use the framework's server-only guard where appropriate.

## Domain model

The following shapes establish stable application language. Exact implementation may use Zod-inferred types, but field meaning must remain provider-neutral.

```ts
type CurrencyCode = "CAD";

type Money = {
  amountMinor: number;
  currency: CurrencyCode;
};

type Dimensions = {
  lengthMm: number;
  widthMm: number;
  heightMm: number;
};

type Availability =
  | { kind: "in_stock"; quantity: number }
  | { kind: "made_to_order" }
  | { kind: "unavailable"; reason?: string };

type ProductMedia = {
  id: string;
  kind: "image" | "model";
  src: string;
  alt: string;
  posterSrc?: string;
};

type ProductVariant = {
  id: string;
  materialId: string;
  finishId: string;
  price: Money;
  availability: Availability;
};

type Product = {
  id: string;
  slug: string;
  name: string;
  summary: string;
  dimensions: Dimensions;
  media: ProductMedia[];
  variants: ProductVariant[];
  limitations: string[];
};

type Material = {
  id: string;
  name: string;
  summary: string;
  supportedFinishIds: string[];
  maxDimensionsMm: Dimensions;
  limitations: string[];
};

type StudioConfiguration = {
  materialId: string | null;
  dimensions: Dimensions | null;
  finishId: string | null;
  quantity: number;
  referenceIds: string[];
  description: string;
};

type Estimate = {
  status: "estimated" | "manual_review" | "unavailable";
  cost?: Money;
  printMinutes?: number;
  materialGrams?: number;
  assumptions: string[];
};

type CartLine = {
  id: string;
  productId: string;
  variantId: string;
  quantity: number;
  unitPrice: Money;
};

type QuoteContact = {
  name: string;
  email: string;
  phone?: string;
};

type QuoteRequest = {
  configuration: StudioConfiguration;
  contact: QuoteContact;
  consentVersion: string;
};

type QuoteReceipt = {
  reference: string;
  submittedAt: string;
};
```

Rules:

- IDs are opaque strings.
- Slugs are presentation identifiers, not database keys.
- Money uses integer minor units and an explicit currency.
- Physical dimensions use millimetres internally. UI may convert values at the boundary.
- Availability is a discriminated union, not a collection of partially related booleans.
- A provisional estimate never becomes the cart or checkout price without authoritative validation.
- Customer contact and upload metadata are not stored in analytics events.

CAD is the initial domain currency because PrintAway is initially scoped in Canada. Multi-currency presentation remains outside the first release.

## Schemas and validation

Use Zod for:

- environment configuration;
- route and query parameters;
- provider responses;
- catalog content;
- cart persistence payloads;
- quote submissions;
- upload metadata;
- server action and route-handler input.

Validation happens at the first trusted boundary. Internal functions consume parsed domain types rather than repeatedly accepting `unknown`.

Validation messages in domain code use stable error codes. The UI maps those codes to copy from [the content guide](CONTENT_GUIDE.md). This prevents provider language or raw schema messages from reaching customers.

## Application interfaces

Interfaces describe capabilities rather than vendors.

```ts
interface CatalogRepository {
  listProducts(input: {
    materialIds?: string[];
    availability?: "available";
  }): Promise<Product[]>;

  getProductBySlug(slug: string): Promise<Product | null>;

  listMaterials(): Promise<Material[]>;
}

interface AssetRepository {
  createReferenceUpload(input: {
    fileName: string;
    mediaType: string;
    byteLength: number;
  }): Promise<{
    referenceId: string;
    uploadUrl: string;
    expiresAt: string;
  }>;
}

interface EstimateService {
  estimate(
    configuration: StudioConfiguration,
  ): Promise<Estimate>;
}

interface QuoteRepository {
  create(
    request: QuoteRequest,
  ): Promise<QuoteReceipt>;
}

interface CartStore {
  read(): Promise<CartLine[]>;
  replace(lines: CartLine[]): Promise<void>;
}

interface ContentRepository {
  getPolicyBySlug(slug: string): Promise<{
    title: string;
    body: string;
    version: string;
  } | null>;
}
```

Provider adapters may add private helpers but must return these application types or explicit application errors. Components never import a provider SDK.

## Use cases

Server-side use cases coordinate interfaces:

- `listShopProducts`: parse filters, request catalog data, return presentable products.
- `getProductDetail`: resolve the product and generate a missing-product result.
- `validateCart`: re-read variants, compare price and availability, and return changed-line decisions.
- `calculateStudioEstimate`: validate compatibility, calculate or request an estimate, and return assumptions.
- `createQuoteRequest`: validate consent and contact data, verify reference IDs, submit the request, and return a receipt.
- `getPolicyPage`: read approved versioned content or return a missing-policy result.

Pure domain functions must cover:

- material and finish compatibility;
- machine-volume limits;
- dimension normalization;
- quantity validation;
- line and cart totals;
- estimate labeling decisions;
- availability badge selection.

## Rendering boundaries

### Server-rendered by default

Use Server Components for:

- layouts, navigation, and footer;
- homepage editorial content;
- Shop catalog data and initial filter results;
- product copy and specifications;
- materials and policy pages;
- initial cart data when the persistence strategy supports it;
- Studio material and finish options.

### Client islands

Client Components are appropriate for:

- URL-backed filter controls;
- variant and quantity selection;
- add-to-cart interaction;
- cart quantity changes;
- Studio step state and readout announcements;
- file selection and upload progress;
- interactive model controls;
- user-triggered motion replay.

A route must not become wholly client-rendered because one subtree needs interaction.

### Three-dimensional viewer

The 3D viewer must:

- load dynamically inside a Client Component;
- render a poster before the model is ready;
- expose the product name or view purpose outside the canvas;
- keep purchase and configuration controls outside the canvas;
- use demand-driven rendering when the scene is static;
- pause or reduce work when offscreen or the page is hidden;
- fall back to the poster after loading or WebGL failure;
- remove non-essential motion when reduced motion is requested.

See [the asset guide](ASSET_GUIDE.md) for production constraints.

## Data flows

### Shop read

1. The route parses search parameters.
2. A server use case requests provider-neutral catalog data.
3. The adapter parses the provider response with Zod.
4. The route renders product cards with image-first media.
5. Client filters update the URL; navigation requests the next server-rendered result.

### Add to cart

1. The customer selects a valid variant and quantity.
2. A client island submits stable IDs and quantity.
3. The server revalidates the variant and unit price.
4. The cart store persists normalized `CartLine` values.
5. The UI announces success or a typed availability/price error.

### Studio estimate

1. The client maintains a `StudioConfiguration` draft.
2. Pure client-safe rules give immediate compatibility feedback.
3. Debounced or step-boundary requests send validated inputs to the server.
4. The server runs the authoritative estimate service.
5. The readout displays the result as estimated, manual review, or unavailable.
6. Stale responses are ignored using a request identity or cancellation signal.

### Quote submission

1. The client validates fields for immediate feedback.
2. The server parses the complete request again.
3. Reference IDs are checked without trusting client file paths.
4. Consent is tied to a published policy version.
5. The quote repository stores or forwards the request.
6. A stable receipt reference is returned.
7. The client renders success without exposing internal provider IDs.

### Checkout handoff

1. The cart is revalidated on the server.
2. Changed price or availability returns a review-required result.
3. A selected commerce adapter creates the handoff only after confirmation.
4. The client navigates to the provider or internal checkout.
5. Handoff failure leaves the cart intact and offers a retry.

## Error model

Expected errors use a discriminated application type:

```ts
type AppError =
  | { kind: "validation"; code: string; field?: string }
  | { kind: "not_found"; resource: "product" | "policy" }
  | { kind: "conflict"; code: "price_changed" | "unavailable" }
  | { kind: "rate_limited"; retryAfterSeconds?: number }
  | { kind: "provider_unavailable"; operation: string }
  | { kind: "unauthorized_upload_reference" };
```

Rules:

- Map errors to safe, actionable copy at the presentation boundary.
- Log the application operation, error kind, request correlation ID, and non-sensitive entity ID.
- Do not log file contents, signed URLs, full contact details, payment data, or raw provider payloads.
- Unexpected errors reach route error boundaries and server monitoring after redaction.
- Retry only idempotent operations automatically.
- Quote submission requires an idempotency strategy before production.

## State and persistence

- URL search parameters own shareable Shop filters.
- Local component state owns uncommitted Studio steps.
- The selected cart strategy owns cart persistence behind `CartStore`.
- The server owns authoritative product, availability, estimate, quote, and policy data.
- Do not introduce a global client-state library during scaffolding. Add one only when real cross-tree state cannot be handled cleanly by URL, server state, context, or a feature-local reducer.
- Do not store customer contact data or uploaded model contents in browser persistence by default.

## Security and privacy boundaries

Before production:

- validate file names, type claims, and byte limits on the server;
- use short-lived signed upload operations;
- scan or quarantine uploads according to the selected storage workflow;
- prevent public enumeration of reference IDs;
- validate redirect destinations;
- keep provider secrets server-only;
- apply rate limits to quote, upload, and checkout-creation endpoints;
- establish retention and deletion behavior before accepting uploads;
- publish approved privacy and acceptable-use policies before collecting personal information.

No documentation in this repository substitutes for legal or security review.

## Testing architecture

- **Domain unit tests:** schemas, compatibility, dimensions, quantity, totals, badges, and estimate state.
- **Adapter contract tests:** provider fixtures parse into the same application models and failures.
- **Component tests:** filters, variant selection, cart updates, Studio steps, status announcements, and fallback states.
- **Playwright tests:** browse → product → cart; configure → estimate → submit; price change; unavailable product; failed estimate; keyboard-only flow; reduced motion; WebGL-disabled fallback.
- **Visual review:** required widths and states from [quality gates](QUALITY.md).

Tests must target observable behavior and contracts. Avoid tests that merely restate implementation structure.

## Architecture decision rule

A change needs a documented architecture decision when it:

- selects an external provider;
- changes a domain model used by more than one feature;
- changes the source of truth for price, availability, estimates, cart, or policy data;
- adds persistent customer data;
- adds a global state library;
- removes a fallback or accessibility guarantee;
- exceeds an asset or performance budget;
- introduces a second rendering or styling system.

Record the decision in the relevant document or a focused decision record before implementation diverges.

## Related references

- [Agent instructions](../AGENTS.md)
- [Product specification](PRODUCT_SPEC.md)
- [Design system](../DESIGN.md)
- [Content guide](CONTENT_GUIDE.md)
- [Asset guide](ASSET_GUIDE.md)
- [Quality gates](QUALITY.md)
