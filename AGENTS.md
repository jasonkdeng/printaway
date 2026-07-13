# AGENTS.md

This file applies to the entire PrintAway repository. It is the operating contract for human and agentic contributors.

## Project state

PrintAway is currently documentation-first. The application scaffold, package manifest, source directories, and validation scripts do not exist yet. Do not report the site as runnable until those files are added and the documented checks pass.

## Read before changing anything

Read the smallest relevant set, in this order:

1. `AGENTS.md` — workflow, engineering constraints, and definition of done.
2. `DESIGN.md` — canonical visual identity, interaction, motion, typography, color, photography, and voice.
3. `docs/PRODUCT_SPEC.md` — product scope, routes, user journeys, and exclusions.
4. `docs/ARCHITECTURE.md` — technical boundaries and planned project structure.
5. The relevant specialist guide:
   - `docs/CONTENT_GUIDE.md`
   - `docs/ASSET_GUIDE.md`
   - `docs/QUALITY.md`
6. `brand-showcase.html` — an illustrative design companion, not production application code.

If instructions conflict, the earlier source in this list wins. `DESIGN.md` always wins over the showcase for design details.

## Product intent

PrintAway has two deliberately different experiences:

- **Shop** is a restrained gallery for small-batch, ready-to-buy printed objects.
- **Studio** is a focused custom-print configurator with a live machine-style readout.

Do not collapse Studio into a product-grid template. Do not turn Shop into a dense marketplace catalog. The product object is the visual subject; manufacturing detail provides trust.

## Approved implementation direction

The first application scaffold must use:

- Next.js App Router;
- TypeScript with strict mode;
- Tailwind CSS backed by CSS custom properties for brand tokens;
- React Three Fiber and Drei for justified interactive 3D scenes;
- Zod at untrusted data and provider boundaries;
- Vitest and Testing Library for unit and component tests;
- Playwright for critical browser journeys.

Select exact stable versions during scaffolding and record them in the lockfile. Do not add a second framework or overlapping library without a concrete need documented in the change.

Commerce, payments, storage, authentication, quoting, and CMS providers must sit behind repository-owned interfaces. Do not allow provider response types to leak into components or domain logic.

## Planned repository shape

These paths are a contract for the future scaffold, not a claim about current files:

```text
src/
  app/                  Route composition, layouts, metadata, route handlers
  components/           Shared presentational and accessibility primitives
  features/
    cart/               Cart domain, state, UI, and persistence boundary
    shop/               Catalog, product detail, inventory presentation
    studio/             Configuration flow, estimates, quote submission
  lib/                  Framework-neutral helpers, schemas, utilities
  server/               Provider adapters and server-only orchestration
  styles/               Tokens, global styles, shared motion primitives
public/
  images/               Responsive product stills and poster fallbacks
  models/               Optimized production GLB assets
tests/
  e2e/                  Playwright journeys
```

Keep files focused. Colocate feature-specific UI, schemas, tests, and domain logic. Move code to `src/components` or `src/lib` only when multiple features genuinely share it.

## Working method

Before editing:

1. Inspect the relevant files and current repository state.
2. Restate the behavior or documentation contract being changed.
3. Identify affected routes, states, adapters, tests, and docs.
4. Keep the change limited to that scope.

While editing:

- Preserve unrelated user changes.
- Prefer small, reviewable units with explicit interfaces.
- Reuse established tokens and primitives instead of creating near-duplicates.
- Update tests with behavior changes.
- Update documentation when routes, architecture, copy rules, asset budgets, or quality gates change.
- Use real domain names. Avoid generic buckets such as `utils2`, `misc`, or `common-new`.
- Delete dead branches and abandoned experiments before completion.

Never copy production code directly from `brand-showcase.html`. Recreate its demonstrated behavior using the application architecture, accessible semantics, shared tokens, and tested components.

## Engineering rules

### Rendering and boundaries

- Use Server Components by default.
- Add `"use client"` only where state, effects, browser APIs, event handlers, or WebGL require it.
- Keep client boundaries as low and narrow as possible.
- Lazy-load 3D experiences and provide useful poster content before WebGL is ready.
- Keep pricing, estimates, validation, and cart calculations out of React render functions.
- Parse untrusted input once at the boundary, then use typed domain values internally.
- Represent money in integer minor units with an explicit currency.
- Treat client-side estimates as provisional until an authoritative server response confirms them.

### Components

- Prefer semantic HTML over div-based replicas.
- Use composition over large option-heavy components.
- A component should own one visual or interaction responsibility.
- Do not create a shared abstraction until at least two real consumers need the same behavior.
- Preserve accessible names, focus order, and status announcements through loading and error states.

### Styling

Use the canonical values from `DESIGN.md` through named tokens:

- Void Black: `#0A0A0B`
- Bone: `#F5F2ED`
- Graphite: `#3A3A3D`
- Aluminum: `#B8B8B4`
- Cure Violet: `#7C5CFF`
- Hot Amber: `#FF7A33`

Rules:

- Use the 8 px spacing system and the documented type hierarchy.
- Keep surfaces flat. Gradients are reserved for the hero light-source effect described in `DESIGN.md`.
- Use Hot Amber only for scarcity, warnings, or destructive attention.
- Use line icons only when they improve wayfinding or explain a specification.
- Keep animation restrained: no springy bounce, ornamental scroll effects, or repeated ambient hero spectacle.
- Implement every animated behavior with a complete `prefers-reduced-motion` alternative.
- Test at small widths; do not treat desktop layouts as the source from which mobile is merely shrunk.

### Three-dimensional media

- Production models and hero renders must originate in Blender, CAD, or another external 3D authoring tool.
- Do not generate substitute product geometry procedurally in React Three Fiber.
- Follow `docs/ASSET_GUIDE.md` for scale, axes, naming, optimization, textures, compression, posters, and provenance.
- A product must remain understandable and purchasable when WebGL is unavailable.
- Avoid continuous rendering when the scene is still. Prefer demand-driven rendering and pause work offscreen.
- Do not introduce a 3D scene when responsive still images communicate the product equally well.

### Copy and data

- Follow `docs/CONTENT_GUIDE.md`.
- Use plain, specific language and real units.
- Never invent prices, stock, production times, shipping claims, material properties, policies, testimonials, or sustainability claims.
- Keep example fixtures clearly separated from production content.
- Errors must explain the problem and the next useful action without blame or false cheer.

## Quality contract

Once the application scaffold exists, `package.json` must expose:

```bash
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run build
```

These commands are required future interfaces; they are not available in the documentation-only repository.

For implementation work:

- Run the narrowest relevant test while iterating.
- Before completion, run lint, typecheck, the relevant unit/component tests, applicable Playwright journeys, and a production build.
- Inspect the browser console for affected routes.
- Compare visual work against `DESIGN.md` and the showcase at required review widths.
- Verify keyboard-only, reduced-motion, loading, empty, error, and WebGL-unavailable states where relevant.

Do not claim a check passed unless its current output was inspected. If a required check cannot run, state exactly why and what remains unverified.

## Definition of done

A change is complete only when:

- behavior matches the product and design contracts;
- affected success and failure states are implemented;
- relevant automated checks pass;
- semantic structure, keyboard access, focus, and announcements are verified;
- reduced-motion and non-WebGL behavior are verified where relevant;
- responsive layouts are reviewed at the widths in `docs/QUALITY.md`;
- no new browser-console errors are present;
- assets meet the budgets and provenance requirements;
- related documentation is updated;
- the final summary identifies what changed, what was verified, and any remaining limitation.

## Scope discipline

Do not use an unrelated task to:

- select a backend or commerce provider;
- redesign the brand;
- add accounts, reviews, loyalty, AR, or marketplace behavior;
- create business policies;
- refactor unaffected areas;
- add dependencies for speculative future use.

When a product decision is genuinely missing and different answers would materially change the implementation, stop and ask rather than encoding an assumption.
