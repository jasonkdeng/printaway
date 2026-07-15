# Printaway Implementation Plan

## Status

This plan stages work from the current first application scaffold. It implements no commerce, product, policy, provider, currency, or customer-contact decision that has not been approved.

## Stage 1 — Foundation

**Status: complete.**

- Establish the strict Next.js App Router, Tailwind token layer, route composition, feature boundaries, and test runners.
- Preserve the canonical Void, Bone, Graphite, Aluminum, Cure Violet, and Hot Amber tokens and their approved contrast pairings.
- Establish the six Studio steps as a single domain constant: Reference, Material, Size, Finish, Quantity, Review and submit.
- Keep routes server-rendered by default and retain reduced-motion behavior in the shared styles.

Exit evidence: lint, strict type-check, unit tests, Chromium desktop and mobile smoke tests, and the production build passed on 2026-07-13.

## Stage 2 — Approved data and business configuration

**Status: complete (configuration boundary).**

- Confirm launch currency and its server-side validation. **Completed: CAD.**
- Confirm Studio contact fields, consent wording, and response expectations. **Completed: required name and email; optional phone and company; explicit privacy consent; typical response within 48 hours, subject to complexity.**
- Supply approved catalog, material, availability, media, and policy content.
- Introduce repository-owned interfaces and server-only configuration schemas without selecting a provider prematurely.

Exit evidence: reviewed initial catalog fixtures, upload and retention configuration, Zod boundary tests, a Supabase migration with RLS/private storage boundaries, and an explicit business decision record. Initial catalog fixtures are not publishable product records until dimensions, finishes, availability, and approved media are supplied. The migration remains unapplied to the remote project.

## Stage 3 — Shop

**Status: complete (Shop and session-cart foundation).**

- Implement the restrained product gallery, product detail route, inventory presentation, and cart entry points.
- Support only material and availability filtering in the initial Shop experience, with URL state and recovery states.
- Deliver accessible image-first product information; introduce 3D only where responsive stills cannot communicate the object.
- Keep Square configuration and authoritative inventory behind the repository-owned boundary. Configured product variation mappings supply current quantities; the catalog does not duplicate sellable inventory.
- Keep product summaries and limitations visibly marked as approval-pending placeholders until reviewed content is supplied.

Exit evidence: domain coverage for cart quantity and totals, component coverage for purchase controls, responsive browser coverage for filters and product configuration, and a server-only Square inventory boundary. Account-backed cart persistence and checkout remain Stage 5 work.

## Stage 4 — Studio

**Status: in progress — interactive foundation.**

- Implement the focused configurator in the canonical six-step order.
- Add upload, compatibility, estimate, validation, and recovery states behind repository-owned boundaries.
- Keep all client estimates explicitly provisional until a server response confirms them.
- The interactive foundation keeps draft data in memory, validates locally selected reference metadata, and exposes manual-review readouts without uploading, estimating, or submitting data.

Foundation evidence: pure domain validation and reducer coverage; component coverage for all steps, validation-summary focus, local-reference messaging, readout updates, and retained input; responsive Chromium coverage at 320, 375, 768, 1024, and 1440 px; reduced-motion stability; lint, strict type-check, unit/component tests, Playwright, and production build passed on 2026-07-15.

Stage 4 remains incomplete until reference uploads, approved compatibility and machine limits, authoritative estimate behavior, quote persistence/submission, and their failure/recovery states are implemented and verified.

## Stage 5 — Cart, checkout, and quote submission

**Status: pending Stages 2–4.**

- Promote the existing session-scoped `CartStore` to approved Google-backed account persistence.
- Add Square checkout and Google OAuth account-cart adapters after the required server credentials and exact Square catalog mappings are configured.
- Keep provider types and payment details outside components and domain logic.

Exit evidence: server-boundary tests, price-conflict and unavailable-line journeys, and safe failure states.

## Stage 6 — Production media and release readiness

**Status: pending product assets and earlier stages.**

- Add externally authored, optimized assets that meet `docs/ASSET_GUIDE.md`; keep poster and textual fallbacks complete.
- Complete the route-specific visual review against `DESIGN.md`, including contrast and the required responsive widths.
- Run the complete quality contract and inspect browser consoles before release.

Exit evidence: documented asset provenance and budgets, all required checks, accessibility and reduced-motion review, and no new console errors.
