# Printaway Implementation Plan

## Status

This plan stages work from the current first application scaffold. It implements no commerce, product, policy, provider, currency, or customer-contact decision that has not been approved.

## Stage 1 — Foundation

**Status: complete.**

- Establish the strict Next.js App Router, Tailwind token layer, route composition, feature boundaries, and test runners.
- Preserve the canonical Void, Bone, Graphite, Aluminum, Cure Violet, and Hot Amber tokens and their approved contrast pairings.
- Establish the six Studio steps as a single domain constant: Reference, Material, Size, Finish, Quantity, Review and submit.
- Keep routes server-rendered by default and retain reduced-motion behavior in the shared styles.

Exit evidence: lint, strict type-check, unit tests, Chromium desktop and mobile smoke tests, and the production build passed on 2026-07-13. The Stage 1 routes remain intentionally data-free until Stage 2 business and content inputs are approved.

## Stage 2 — Approved data and business configuration

**Status: complete (configuration boundary).**

- Confirm launch currency and its server-side validation. **Completed: CAD.**
- Confirm Studio contact fields, consent wording, and response expectations. **Completed: required name and email; optional phone and company; explicit privacy consent; typical response within 48 hours, subject to complexity.**
- Supply approved catalog, material, availability, media, and policy content.
- Introduce repository-owned interfaces and server-only configuration schemas without selecting a provider prematurely.

Exit evidence: reviewed initial catalog fixtures, upload and retention configuration, Zod boundary tests, a Supabase migration with RLS/private storage boundaries, and an explicit business decision record. Initial catalog fixtures are not publishable product records until dimensions, finishes, availability, and approved media are supplied. The migration remains unapplied to the remote project.

## Stage 3 — Shop

**Status: in progress.**

- Implement the restrained product gallery, product detail route, inventory presentation, and cart entry points.
- Support only material and availability filtering in the initial Shop experience, with URL state and recovery states.
- Deliver accessible image-first product information; introduce 3D only where responsive stills cannot communicate the object.
- Add Square configuration and an inventory repository boundary. Live quantities remain disabled until Square credentials and one item-variation ID per product are configured; the catalog must not duplicate sellable inventory.
- Keep product summaries and limitations visibly marked as approval-pending placeholders until reviewed content is supplied.

Exit evidence: domain, component, and Playwright coverage for filter state, unavailable products, quantity selection, and cart feedback at the required review widths.

## Stage 4 — Studio

**Status: pending Stage 2.**

- Implement the focused configurator in the canonical six-step order.
- Add upload, compatibility, estimate, validation, and recovery states behind repository-owned boundaries.
- Keep all client estimates explicitly provisional until a server response confirms them.

Exit evidence: keyboard, validation-summary, reduced-motion, upload-failure, stale-estimate, and WebGL-unavailable coverage.

## Stage 5 — Cart, checkout, and quote submission

**Status: pending Stages 2–4.**

- Build cart state and persistence behind `CartStore`.
- Add Square checkout and Google OAuth account-cart adapters after the required server credentials and exact Square catalog mappings are configured.
- Keep provider types and payment details outside components and domain logic.

Exit evidence: server-boundary tests, price-conflict and unavailable-line journeys, and safe failure states.

## Stage 6 — Production media and release readiness

**Status: pending product assets and earlier stages.**

- Add externally authored, optimized assets that meet `docs/ASSET_GUIDE.md`; keep poster and textual fallbacks complete.
- Complete the route-specific visual review against `DESIGN.md`, including contrast and the required responsive widths.
- Run the complete quality contract and inspect browser consoles before release.

Exit evidence: documented asset provenance and budgets, all required checks, accessibility and reduced-motion review, and no new console errors.
