# Stage 4 Closeout and Stage 5 Commerce Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the production Studio boundary, then add Google-authenticated cart persistence and a Square-hosted checkout handoff with authoritative server validation.

**Architecture:** Keep authentication, persistence, and checkout behind Printaway-owned server interfaces. Auth.js supplies a Google account subject through a server session; Supabase stores normalized cart lines keyed by that subject; Square remains authoritative for item variation inventory and becomes authoritative for checkout price before a hosted payment link is created. The existing browser cart remains the anonymous fallback and merges into the account cart after sign-in.

**Tech Stack:** Next.js App Router, strict TypeScript, React, Zod, Auth.js/NextAuth, Supabase Postgres, Square Catalog/Inventory/Checkout APIs, Vitest, Testing Library, Playwright.

## Global Constraints

- Use `Printaway` in prose and Neue Machina through the existing typography tokens.
- Keep provider response types inside `src/server/adapters` and parse them with Zod.
- Money remains integer minor units in CAD.
- Revalidate price and availability on the server immediately before checkout.
- Use Square `CreatePaymentLink` for hosted online checkout; Printaway must not collect card data.
- Keep the current material and availability Shop filters; do not add a use filter.
- Preserve the six Studio steps and all entered data through validation or provider failures.
- Do not enable production checkout until Square catalog prices, taxes, fulfillment choices, and customer-facing terms are approved.

---

## Responsibility Split

### Jason - provider-console and business configuration

- [ ] Set `STUDIO_SUBMISSION_ENABLED=true` locally and in Vercel, keeping the already configured policy version, capabilities JSON, Supabase secret, rate-limit secret, and Cron secret.
- [ ] Redeploy and confirm `/studio` presents `Submit quote request` rather than the disabled configuration message.
- [ ] In Google Cloud, keep the approved callbacks `https://printaway.vercel.app/api/auth/callback/google` and `https://localhost:3000/api/auth/callback/google`; complete the OAuth consent screen and authorized origins.
- [ ] Keep `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `AUTH_SECRET` in Vercel Production/Preview and local `.env.local` only.
- [ ] In Square, confirm each configured variation is the correct sellable object, inventory tracking is on, and its CAD price is approved for checkout.
- [ ] Configure approved Square taxes and decide the launch fulfillment choices: shipping, pickup, or both.
- [ ] Provide final customer-facing delivery, cancellation, and refund terms before checkout is enabled.
- [ ] After each provider configuration change, trigger a Vercel production redeploy.

### Codex - repository implementation and verification

- [ ] Complete Tasks 1–5 below using test-first changes.
- [ ] Keep all credentials server-only and avoid logging contact, cart, upload, or payment data.
- [ ] Run the full quality contract and report any live provider path that cannot be verified.

---

### Task 1: Close Stage 4 production activation

**Files:**
- Modify: `src/app/studio/page.tsx`
- Modify: `src/features/studio/ui/studio-configurator.test.tsx`
- Modify: `tests/e2e/smoke.spec.ts`
- Modify: `docs/IMPLEMENTATION_PLAN.md`
- Modify: `docs/DECISIONS.md`

**Interfaces:**
- Consumes: `getStudioServerConfiguration(): StudioServerConfiguration`
- Produces: verified production Studio success and recovery evidence; no new provider interface.

- [ ] **Step 1: Add a failing component assertion for enabled production copy**

  Render `StudioConfigurator` with `submissionEnabled` and assert that the submit action is enabled after a valid six-step request, while the disabled configuration notice is absent.

- [ ] **Step 2: Run the focused test and verify RED**

  Run: `npm run test -- src/features/studio/ui/studio-configurator.test.tsx`

  Expected: FAIL until enabled-state copy and action state agree.

- [ ] **Step 3: Make Studio route copy reflect actual activation**

  In `src/app/studio/page.tsx`, derive the introductory sentence from `studio.submissionEnabled`: enabled copy says the request can be submitted for manual review; disabled copy says configuration is available but submission is unavailable.

- [ ] **Step 4: Add an opt-in production browser journey**

  Add a Playwright test guarded by `RUN_PROVIDER_E2E=true` that completes a description-only request and asserts either the opaque `PA-` receipt or an actionable provider-recovery message without losing the entered description.

- [ ] **Step 5: Verify the live route after Jason deploys**

  Run the production-gated browser journey once with a non-sensitive test request. Confirm Supabase receives one `submitted` quote row, no public storage URL is exposed, and a failure leaves the form populated.

- [ ] **Step 6: Mark Stage 4 complete in documentation**

  Record the applied migrations, approved policy version, private bucket, Cron 200 response, live success/recovery evidence, and the exact verification date.

---

### Task 2: Add Google account identity behind Auth.js

**Files:**
- Create: `src/auth.ts`
- Create: `src/app/api/auth/[...nextauth]/route.ts`
- Create: `src/types/next-auth.d.ts`
- Create: `src/components/layout/account-control.tsx`
- Create: `src/server/auth/account-session.ts`
- Create: `src/server/auth/account-session.test.ts`
- Modify: `src/components/layout/site-header.tsx`
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `.env.example`

**Interfaces:**
- Produces: `getAccountSession(): Promise<{ accountId: string; email: string | null } | null>`
- Produces: Auth.js handlers at `/api/auth/*` using JWT sessions and Google as the only provider.

- [ ] **Step 1: Resolve and pin the current stable Auth.js package**

  Run `npm view next-auth dist-tags --json`, then `npm install next-auth@latest --save-exact`. Inspect the lockfile and verify the installed release supports the repository's Next.js version.

- [ ] **Step 2: Write the failing account-session boundary tests**

  Cover an authenticated session with a stable Google subject, an anonymous request returning `null`, and a session missing a subject returning `null` rather than using email as an identifier.

- [ ] **Step 3: Implement Auth.js configuration**

  Configure Google from `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`, use `AUTH_SECRET`, use JWT sessions, copy the provider account `sub` into the token, and expose it as `session.user.id`. Do not persist Google access or refresh tokens.

- [ ] **Step 4: Implement the repository-owned account-session boundary**

  `getAccountSession` calls `auth()`, returns only the stable account ID and optional email, and throws no provider types across the boundary.

- [ ] **Step 5: Add accessible sign-in/account controls**

  Add `Sign in with Google` and `Sign out` controls to the existing header without changing the navigation hierarchy. Preserve 44 px targets, focus visibility, and narrow-width behavior.

- [ ] **Step 6: Verify authentication**

  Run focused tests, then Playwright against local Google OAuth after Jason completes configuration. Verify the callback, signed-in header, sign-out, and direct `/cart` navigation.

---

### Task 3: Persist account carts in Supabase and merge anonymous carts

**Files:**
- Create: `supabase/migrations/20260720093000_account_cart_lines.sql`
- Create: `src/features/cart/server/cart-repository.ts`
- Create: `src/server/adapters/supabase-cart.ts`
- Create: `src/server/adapters/supabase-cart.test.ts`
- Create: `src/app/api/cart/route.ts`
- Create: `src/features/cart/ui/account-cart-sync.tsx`
- Modify: `src/features/cart/ui/browser-cart-store.ts`
- Modify: `src/features/cart/ui/cart-panel.tsx`
- Modify: `src/app/layout.tsx`
- Modify: `tests/e2e/smoke.spec.ts`

**Interfaces:**
- Produces: `CartRepository.read(accountId): Promise<CartSnapshot>`
- Produces: `CartRepository.replace(accountId, lines): Promise<CartSnapshot>`
- Consumes: `getAccountSession()` from Task 2.

- [ ] **Step 1: Generate the migration file**

  Create `supabase/migrations/20260720093000_account_cart_lines.sql` and define `public.account_cart_lines` with `account_id text`, `line_id text`, product/finish/colour fields, integer quantity, integer CAD unit price, timestamps, and primary key `(account_id, line_id)`. Enable RLS and create no client policy because only the server secret accesses it. Before applying it, verify the filename remains later than every existing migration.

- [ ] **Step 2: Write failing repository contract tests**

  Cover empty read, replace, quantity clamping to 1-10 and current inventory, duplicate-line normalization, account isolation, and deletion of removed lines.

- [ ] **Step 3: Implement the provider-neutral repository and Supabase adapter**

  Validate database responses with Zod and return only `CartSnapshot`. Never trust stored unit price at checkout.

- [ ] **Step 4: Implement authenticated `/api/cart` GET and PUT**

  Return 401 for anonymous requests. Parse PUT payloads with Zod, revalidate supported product IDs, and replace the account cart atomically.

- [ ] **Step 5: Merge anonymous session cart after sign-in**

  Merge by `productId + finish + colour`, clamp quantities, persist once, then clear the anonymous storage key only after the server confirms success. Preserve the local cart and announce a retry action on failure.

- [ ] **Step 6: Verify account persistence**

  Sign in, add products, reload, open a second browser context with the same account, and confirm the same cart. Sign out and confirm account lines are not exposed to the anonymous session.

---

### Task 4: Add authoritative Square validation and hosted checkout

**Files:**
- Create: `src/features/cart/server/checkout-service.ts`
- Create: `src/features/cart/server/validate-cart.ts`
- Create: `src/features/cart/server/validate-cart.test.ts`
- Create: `src/server/adapters/square-checkout.ts`
- Create: `src/server/adapters/square-checkout.test.ts`
- Create: `src/app/api/checkout/route.ts`
- Create: `src/app/checkout/return/page.tsx`
- Modify: `src/server/config/square.ts`
- Modify: `src/features/cart/ui/cart-panel.tsx`
- Modify: `.env.example`

**Interfaces:**
- Produces: `CheckoutService.createHandoff(input): Promise<{ url: string; providerReference: string }>`
- Produces: `validateCart(lines): Promise<{ kind: "ready"; lines: ValidatedCartLine[] } | { kind: "review_required"; changes: CartChange[] }>`
- Consumes: Square item-variation mappings, account cart, current inventory, and Square catalog prices.

- [ ] **Step 1: Write failing validation tests**

  Cover unchanged price/availability, changed price requiring acknowledgement, insufficient inventory, removed variation, quantity above 10, and CAD mismatch.

- [ ] **Step 2: Implement Square catalog price lookup**

  Read each configured `ITEM_VARIATION`, parse `price_money`, require `CAD`, and combine it with the existing current-location inventory count. Treat missing prices or counts as unavailable, not zero-price checkout.

- [ ] **Step 3: Write failing Square checkout adapter tests**

  Assert `POST /v2/online-checkout/payment-links`, a unique idempotency key, configured location, catalog variation IDs, quantities, approved return URL, safe failure mapping, and Zod parsing of `payment_link.url`.

- [ ] **Step 4: Implement Square-hosted payment links**

  Use an order payload containing catalog variation IDs and quantities so Square applies its configured catalog prices and taxes. Encode finish and colour as non-price-changing line notes only. Do not send locally calculated totals as authoritative payment amounts.

- [ ] **Step 5: Implement authenticated checkout route**

  Read the account cart, validate it immediately, return `409 review_required` for changes, and return the Square URL only for a ready cart. Preserve the cart on all failures.

- [ ] **Step 6: Implement cart checkout states**

  Add `Review changes`, `Checkout unavailable`, `Try again`, and `Continue to Square` states with status announcements and keyboard focus management. Navigate only to an HTTPS `square.link` or `checkout.square.site` URL returned by the adapter.

- [ ] **Step 7: Add the return page**

  Explain that Square processes payment and that returning does not itself prove payment completion. Keep the cart until a later verified order-completion integration; do not show an unsupported success claim.

---

### Task 5: Stage 5 quality, security, and release gate

**Files:**
- Modify: `tests/e2e/smoke.spec.ts`
- Modify: `docs/QUALITY.md`
- Modify: `docs/ARCHITECTURE.md`
- Modify: `docs/IMPLEMENTATION_PLAN.md`
- Modify: `docs/DECISIONS.md`
- Modify: `README.md`

- [ ] **Step 1: Add critical browser journeys**

  Cover anonymous cart to Google sign-in merge, account persistence, price conflict, unavailable line, failed Square handoff with intact cart, keyboard-only checkout, and 320/375/768/1024/1440 px layouts.

- [ ] **Step 2: Run Supabase advisors**

  Confirm the account cart table has RLS, no client policies, and no publicly executable privileged functions. Document intentional informational notices.

- [ ] **Step 3: Run the complete quality contract**

  Run `npm run lint`, `npm run typecheck`, `npm run test`, `npm run test:e2e`, and `npm run build`. Inspect browser consoles for `/studio`, `/shop`, product detail, `/cart`, and the checkout return page.

- [ ] **Step 4: Perform production provider verification**

  Use a Square Sandbox checkout first. Verify idempotent link creation, current price/inventory, failed-link recovery, Google sign-in persistence, and no provider secrets or raw payloads in browser output or logs.

- [ ] **Step 5: Update project status**

  Mark Stage 4 complete only after its live submission evidence exists. Mark Stage 5 complete only after Google persistence and Square Sandbox handoff/recovery pass. Record unresolved production terms or assets as Stage 6 blockers rather than silently enabling them.

## Current Gate Summary

- Capability JSON: valid locally.
- Studio production secrets: present locally.
- Supabase Stage 2/4 migrations and private bucket: deployed.
- Retention route: authenticated request returned 200; Vercel schedule is `0 3 * * *`.
- Privacy policy: approved and published in code.
- Remaining Stage 4 gate: set `STUDIO_SUBMISSION_ENABLED=true`, deploy, and verify live success plus recovery.
- Remaining Stage 5 business gate: approve Square catalog prices, taxes, fulfillment choices, and delivery/refund terms before enabling checkout.
