# Printaway Application Architecture

## Status

This document defines the architecture for the current application and its remaining staged boundaries. The scaffold, Square-backed Shop inventory, session cart, and Stage 4A Studio client workflow exist; production media, account persistence, checkout, uploads, estimates, and quote submission remain staged.

### Current Studio foundation

- `/studio` remains a Server Component route that renders static page framing around one narrow `StudioConfigurator` client island.
- A feature-local `StudioDraft` reducer owns uncommitted step, reference-metadata, preference, dimension, quantity, contact, consent, issue, and announcement state.
- `validateStudioStep` is a pure domain boundary. It reuses the approved reference metadata and quote contact/consent schemas without importing provider types.
- Selected `File` objects are never copied into the reducer. The browser input remains local and only file name/byte-length metadata is validated and represented in the draft.
- The readout presents selected values and em dashes for unavailable estimates. Step-transition announcements are separate from the visual readout so typing does not create excessive live-region output.
- No Stage 4A action calls Supabase, an estimate service, or a quote repository. Submission is disabled and the route does not persist contact details.

## Architectural principles

1. **Server first.** Render routes and data-dependent UI with Server Components unless an interaction, browser API, or WebGL boundary requires a Client Component.
2. **Domain before provider.** Printaway-owned models and interfaces describe products, configurations, estimates, carts, and quotes. External services adapt to them.
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
type CurrencyCode = "CAD"; // Confirmed launch currency; parsed at the server boundary.

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

type QuoteReceipt = {
  reference: string;
  submittedAt: string;
};
```

Launch currency is CAD. A quote request requires a name, email, and explicit privacy consent; phone and company remain optional. Those choices are represented through server-side Zod schemas. Quote submission remains staged until it can tie consent to a published policy version and use its repository boundary.

Rules:

- IDs are opaque strings.
- Slugs are presentation identifiers, not database keys.
- Money uses integer minor units and an explicit, boundary-validated currency.
- Physical dimensions use millimetres internally. UI may convert values at the boundary.
- Availability is a discriminated union, not a collection of partially related booleans.
- A provisional estimate never becomes the cart or checkout price without authoritative validation.
- Customer contact and upload metadata are not stored in analytics events.

The first release supports CAD only. Multi-currency presentation remains outside the first release.

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

interface InventoryRepository {
  getCurrentLevel(input: { variationId: string }): Promise<{
    quantity: number;
    observedAt: string;
  } | null>;
}
```

`QuoteRepository` remains a required repository-owned boundary. Its implementation is staged until it can persist the approved contact and consent contract without exposing provider details.

Provider adapters may add private helpers but must return these application types or explicit application errors. Components never import a provider SDK.

## Use cases

Server-side use cases coordinate interfaces:

- `listShopProducts`: parse filters, request catalog data, return presentable products.
- `getProductDetail`: resolve the product and generate a missing-product result.
- `validateCart`: re-read variants, compare price and availability, and return changed-line decisions.
- `calculateStudioEstimate`: validate compatibility, calculate or request an estimate, and return assumptions.
- `createQuoteRequest`: validate the approved contact and consent schemas, verify reference IDs, submit the request through `QuoteRepository`, and return a receipt.
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
- Studio page framing and approved static copy.

### Client islands

Client Components are appropriate for:

- URL-backed filter controls;
- variant and quantity selection;
- add-to-cart interaction;
- cart quantity changes;
- Studio step state, validation, local file selection, and settled readout announcements;
- upload progress once the upload adapter is implemented;
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
3. The catalog and inventory adapters parse provider responses with Zod. Square item-variation inventory is the authoritative sellable quantity.
4. The route renders product cards with image-first media.
5. Client filters update the URL; navigation requests the next server-rendered result.

### Add to cart

1. The customer selects a valid variant and quantity.
2. A client island submits stable IDs and quantity.
3. The server revalidates the variant and unit price.
4. The cart store persists normalized `CartLine` values.
5. The UI announces success or a typed availability/price error.

### Studio interactive foundation

Studio follows Reference → Material → Size → Finish → Quantity → Review and submit.

1. The client maintains a `StudioDraft` in a feature-local reducer across the six steps.
2. Continue validates the active step and preserves valid data when another field fails.
3. Completed steps become revisitable; future steps remain unavailable until reached.
4. Reference files are checked locally against approved metadata rules but are not uploaded or persisted.
5. The readout displays selected preferences and em dashes for estimate values, with `Manual review required` visible throughout.
6. Review validates approved contact and privacy-consent fields, then reports that submission is unavailable while retaining the draft.

### Studio estimate boundary

The normalized `StudioConfiguration` and `EstimateService` are server boundaries. The current service can authoritatively return `manual_review` without fabricating numerical material, time, or cost values. Approved capability configuration supplies material/finish compatibility and build-volume validation. The client requests estimates only after a settled configuration reaches Review, cancels superseded work, and ignores stale responses. Every future numerical value remains provisional until quote review.

### Quote submission and private references

The quote repository and private-reference repository are implemented behind server-only Supabase adapters, but activation remains gated by an approved privacy-policy version, capabilities, privileged secret, and rate-limit secret.

1. The client validates fields for immediate feedback.
2. The server parses the complete request again.
3. A valid request receives short-lived signed private upload URLs; files remain local until this point.
4. Consent is tied to the approved published policy and version.
5. The quote repository stores or forwards the request.
6. Finalization verifies expected private objects and byte lengths, then returns a stable public reference.
7. The client renders success without exposing internal provider IDs, storage paths, or signed URLs.

### Checkout handoff

1. The cart is revalidated on the server.
2. Changed price or availability returns a review-required result.
3. The Square commerce adapter creates the handoff only after confirmation.
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
- A feature-local reducer owns the current uncommitted Studio draft. It is intentionally not synchronized to local storage, session storage, a global store, or a server.
- The selected cart strategy owns cart persistence behind `CartStore`.
- The server owns authoritative product, availability, estimate, quote, and policy data. Square is the inventory authority for Shop variants; its server-only adapter supplies the current quantity.
- Do not introduce a global client-state library during scaffolding. Add one only when real cross-tree state cannot be handled cleanly by URL, server state, context, or a feature-local reducer.
- Do not store Studio contact data, selected-file contents, or reference metadata in browser persistence. Selected `File` objects stay only in the mounted configurator ref until submit or removal.

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

- **Domain unit tests:** schemas, Studio draft/reducer validation, dimensions, quantity, totals, badges, compatibility, and estimate state when those rules exist.
- **Adapter contract tests:** provider fixtures parse into the same application models and failures.
- **Component tests:** material and availability filters, variant selection, cart updates, Studio steps, validation-summary focus, local-reference messaging, retained drafts, status announcements, and fallback states.
- **Playwright tests:** implemented Shop/cart journeys and the current Studio foundation run now; configure → estimate → submit, price change, failed estimate, full keyboard-only submission, and WebGL-disabled fallback remain required as their production boundaries are added.
- **Visual review:** required widths and states from [quality gates](QUALITY.md).

Tests must target observable behavior and contracts. Avoid tests that merely restate implementation structure.

Money tests use the confirmed CAD launch currency. Studio foundation tests use only the approved reference, contact, and consent schemas. Quote-provider integration tests remain pending the repository implementation.

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
