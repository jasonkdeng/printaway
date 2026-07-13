# Printaway Repository Documentation Implementation Plan

> **Superseded historical record — do not execute.** This plan records how the documentation baseline was originally created. Its unchecked boxes are not current work. `AGENTS.md` and the current documentation hierarchy govern all changes; byte-for-byte source-fidelity instructions below no longer apply.

**Goal:** Add the approved source references and a complete documentation system that makes the empty Printaway repository safe and predictable for agent-assisted development.

**Architecture:** Keep project-wide authority in a short root `AGENTS.md`, with detailed concerns split into focused files under `docs/`. The original import preserved supplied design references; subsequent changes align them through the current authority hierarchy. Cross-link all documents and distinguish present repository state from future implementation contracts.

**Tech Stack:** Markdown, standalone HTML reference, Next.js App Router, strict TypeScript, Tailwind CSS, React Three Fiber/Drei, Zod, Vitest/Testing Library, Playwright.

## Global Constraints

- `DESIGN.md` is authoritative for visual identity, interaction, motion, typography, color, photography, and brand voice.
- `brand-showcase.html` is illustrative; `DESIGN.md` wins if they differ.
- Production 3D models and hero renders are created in external 3D tools, not as procedural website geometry.
- The future application uses Next.js App Router, strict TypeScript, Tailwind CSS, React Three Fiber/Drei, Zod, Vitest/Testing Library, and Playwright.
- Server Components are the default; Client Components require an interaction, browser API, or WebGL boundary.
- Commerce, storage, quoting, authentication, payments, and CMS providers remain behind adapters and are not selected by this documentation task.
- Documentation must not claim that packages, scripts, source directories, or configuration files already exist.
- All experiences require semantic HTML, keyboard access, WCAG 2.2 AA behavior, reduced-motion handling, responsive layouts, and non-WebGL fallbacks.
- No unfinished markers, sample filler, invented business policy, or undocumented exception may remain.

---

### Task 1: Record the original design source import

**Files:**
- Create: `DESIGN.md`
- Create: `brand-showcase.html`

**Interfaces:**
- Consumes: the user-supplied `DESIGN.md` and `brand-showcase.html`.
- Produces: canonical `DESIGN.md` plus the non-canonical illustrative showcase referenced by later documentation tasks.

- [ ] **Step 1: Add the canonical design specification**

At initial import, create root `DESIGN.md` from the supplied content. Current edits follow `AGENTS.md` and the approved documentation hierarchy rather than a byte-for-byte preservation rule.

- [ ] **Step 2: Add the illustrative showcase**

At initial import, create root `brand-showcase.html` from the supplied companion. Current edits may correct it for alignment, but it remains illustrative and non-canonical.

- [ ] **Step 3: Validate source fidelity**

This was an initial-import check only. Hash equality with the supplied workspace copies is not a current acceptance gate.

- [ ] **Step 4: Validate the showcase structure**

Confirm the file contains a document type, one `<html lang="en">`, a viewport-ready responsive layout, a `prefers-reduced-motion` rule, and no references to missing local files. Expected: all checks pass.

- [ ] **Step 5: Commit**

Commit message: `docs: add Printaway design references`.

---

### Task 2: Establish the agent operating contract

**Files:**
- Create: `AGENTS.md`

**Interfaces:**
- Consumes: `DESIGN.md`, `brand-showcase.html`, and the approved documentation design.
- Produces: the root instruction file that governs all repository work.

- [ ] **Step 1: Define authority and reading order**

State the exact source hierarchy: `AGENTS.md`, `DESIGN.md`, `docs/PRODUCT_SPEC.md`, `docs/ARCHITECTURE.md`, the domain guides, then `brand-showcase.html`.

- [ ] **Step 2: Define repository-wide working rules**

Require agents to inspect before editing, keep changes scoped, preserve user work, use feature boundaries, avoid provider coupling, update documentation with behavior changes, and never treat the showcase as production code.

- [ ] **Step 3: Define engineering and brand invariants**

Record the approved stack, Server Component default, schema validation, accessibility, reduced motion, responsive layout, 3D fallback, asset provenance, restrained motion, and flat visual treatment.

- [ ] **Step 4: Define the future script contract**

Require `npm run lint`, `npm run typecheck`, `npm run test`, `npm run test:e2e`, and `npm run build` once the scaffold exists. Explicitly say these are required future scripts and are not yet available.

- [ ] **Step 5: Define completion criteria**

Require relevant checks, route-state coverage, design comparison, documentation updates, no console errors, and a concise change summary.

- [ ] **Step 6: Review for actionability**

Every instruction must be testable or observable. Remove vague wording such as “make it polished” unless paired with a concrete criterion.

- [ ] **Step 7: Commit**

Commit message: `docs: add agent development instructions`.

---

### Task 3: Create the human entry point and product contract

**Files:**
- Modify: `README.md`
- Create: `docs/PRODUCT_SPEC.md`

**Interfaces:**
- Consumes: the approved documentation design and design source material.
- Produces: the public project overview and bounded MVP definition used by architecture and quality guidance.

- [ ] **Step 1: Replace the placeholder README**

Explain Printaway in one paragraph; distinguish Shop and Studio; list the approved stack; state that the repository is in documentation-first setup; link every authoritative document; include the eventual install, development, validation, and build commands as a future workflow clearly labeled unavailable until scaffolding.

- [ ] **Step 2: Define users and jobs**

Document buyers of pre-made objects and customers requesting custom prints. Define their primary decisions and desired outcomes without inventing demographics.

- [ ] **Step 3: Define the initial route map**

Specify `/`, `/shop`, `/shop/[slug]`, `/studio`, `/cart`, `/about`, `/materials`, and `/policies/[slug]`. Describe each route's responsibility and required states.

- [ ] **Step 4: Define Shop behavior**

Specify gallery density, filters appropriate to a small catalog, product cards, product detail information, stock states, cart actions, and technical specification display.

- [ ] **Step 5: Define Studio behavior**

Specify the six-step Reference → Material → Size → Finish → Quantity → Review and submit flow, live estimate semantics, validation behavior, quote submission, and machine-style readout.

- [ ] **Step 6: Define state and failure behavior**

Cover loading, empty catalog, unavailable variants, invalid dimensions, unsupported materials, failed 3D/WebGL loading, quote submission failure, cart changes, and missing policy content.

- [ ] **Step 7: Define MVP exclusions**

Exclude accounts, loyalty, reviews, marketplace sellers, AR, automated manufacturability guarantees, real-time printer scheduling, internationalization, and provider selection.

- [ ] **Step 8: Add acceptance criteria**

Write verifiable criteria for keyboard completion, mobile layouts, reduced motion, static fallbacks, estimate labeling, cart persistence expectations, and form recovery.

- [ ] **Step 9: Cross-link documents**

Link `README.md` to the product spec and all guides; link the product spec to `DESIGN.md`, architecture, content, assets, and quality.

- [ ] **Step 10: Commit**

Commit message: `docs: define Printaway product scope`.

---

### Task 4: Define implementation architecture

**Files:**
- Create: `docs/ARCHITECTURE.md`

**Interfaces:**
- Consumes: `docs/PRODUCT_SPEC.md`.
- Produces: technical boundaries for the future application scaffold and feature implementations.

- [ ] **Step 1: Define architectural principles**

Document Server Components by default, thin route composition, feature ownership, pure domain logic, explicit client islands, validated boundaries, progressive enhancement, and provider neutrality.

- [ ] **Step 2: Define the planned directory map**

Specify responsibilities for `src/app`, `src/features/shop`, `src/features/studio`, `src/features/cart`, `src/components`, `src/lib`, `src/server`, `src/styles`, `public/models`, `public/images`, and `tests/e2e`. State that these paths are planned, not currently present.

- [ ] **Step 3: Define domain models**

Describe stable fields and invariants for Product, ProductVariant, Material, StudioConfiguration, Estimate, and CartLine. Reserve the launch currency and explicit QuoteContact/QuoteRequest fields for business confirmation; use provider-neutral identifiers and minor currency units.

- [ ] **Step 4: Define adapter interfaces**

Describe CatalogRepository, CartStore, EstimateService, AssetRepository, and ContentRepository responsibilities, inputs, outputs, and failure categories without selecting a vendor. Keep QuoteRepository as a required future boundary whose request signature is defined only after business approval of contact and consent fields.

- [ ] **Step 5: Define rendering boundaries**

State which routes can remain server-rendered and which subtrees require client execution. Isolate React Three Fiber behind dynamic client-only boundaries with poster fallbacks.

- [ ] **Step 6: Define data and validation flow**

Trace catalog reads, cart mutation, Studio state, estimate calculation, quote submission, and external-provider validation. Require Zod at untrusted boundaries and pure functions for calculations.

- [ ] **Step 7: Define resilience and observability**

Cover typed user-safe failures, server logging without sensitive uploads, retry boundaries, empty-state behavior, and graceful degradation.

- [ ] **Step 8: Define architectural tests**

Require unit tests for domain calculations and schemas, contract tests for adapters, component tests for interaction islands, and Playwright tests for core journeys.

- [ ] **Step 9: Commit**

Commit message: `docs: define application architecture`.

---

### Task 5: Define content and 3D asset execution

**Files:**
- Create: `docs/CONTENT_GUIDE.md`
- Create: `docs/ASSET_GUIDE.md`

**Interfaces:**
- Consumes: `DESIGN.md`, `brand-showcase.html`, and `docs/PRODUCT_SPEC.md`.
- Produces: repeatable copy and asset-production rules for designers, developers, and agents.

- [ ] **Step 1: Codify voice rules**

Define precise, calm, slightly dry language; plain declarative sentences; technical specificity; verb-first sentence-case CTAs; direct error copy; and limited warmth in story content.

- [ ] **Step 2: Provide approved patterns**

Give concrete patterns for navigation, headings, product titles, specification strips, stock badges, material descriptions, Studio steps, estimate labels, validation, errors, empty states, loading states, and accessible labels.

- [ ] **Step 3: Define prohibited patterns**

Ban hype language, exclamation-heavy copy, fake urgency, “Oops” errors, unverified sustainability claims, unexplained jargon, ambiguous CTAs, and invented operational promises.

- [ ] **Step 4: Define product-content fields**

Specify required and optional content for products and materials, including units, prices, availability, production time, dimensions, care, limitations, alt text, and search metadata.

- [ ] **Step 5: Define the 3D source workflow**

Require Blender, CAD, or another external authoring tool; real-world scale; stable origin and orientation; named meshes and materials; applied transforms; clean normals; and documented licensing.

- [ ] **Step 6: Define delivery budgets**

Set an initial target of 3 MB compressed GLB per product and a 5 MB hard ceiling unless an exception is documented. Require no more than 150,000 visible triangles for a standard product scene, texture dimensions no larger than 2048 px by default, and KTX2/Basis textures where practical.

- [ ] **Step 7: Define optimization and fallback requirements**

Require Meshopt or Draco evaluation, poster AVIF/WebP images, responsive stills, deterministic camera framing, loading state, failure state, and full product comprehension without WebGL.

- [ ] **Step 8: Define asset QA**

Require checks for scale, pivots, normals, materials, draw calls, file size, mobile rendering, reduced-motion behavior, fallback parity, license record, and visual match to the photography direction.

- [ ] **Step 9: Commit**

Commit message: `docs: add content and asset guidelines`.

---

### Task 6: Define measurable release quality

**Files:**
- Create: `docs/QUALITY.md`

**Interfaces:**
- Consumes: every prior document.
- Produces: shared validation gates and a definition of release readiness.

- [ ] **Step 1: Define static and automated checks**

Require strict TypeScript, lint, formatting, unit/component tests, critical Playwright journeys, production build, and clean browser console.

- [ ] **Step 2: Define accessibility gates**

Require semantic regions, logical headings, visible focus, full keyboard operation, WCAG 2.2 AA contrast, accessible names, status announcements, error association, 44-by-44 CSS-pixel targets where practical, reduced motion, and no content dependent on 3D interaction.

- [ ] **Step 3: Define responsive and browser coverage**

Set review widths of 320, 375, 768, 1024, and 1440 CSS pixels. Require current stable Chromium, Firefox, and WebKit coverage for critical journeys.

- [ ] **Step 4: Define performance budgets**

Set p75 targets of LCP at or below 2.5 seconds, INP at or below 200 milliseconds, and CLS at or below 0.1. Define initial-route JavaScript and 3D loading principles, lazy loading, font subset expectations, and no blocking hero model download before a useful static render.

- [ ] **Step 5: Define visual review**

Require comparison with canonical `DESIGN.md`; use `brand-showcase.html` only as an illustrative companion. Verify tokens, type hierarchy, spacing, flat surfaces, Shop/Studio distinction, motion timing, and allowed gradient exceptions.

- [ ] **Step 6: Define route-state matrix**

List happy, loading, empty, error, unavailable, reduced-motion, keyboard-only, small-screen, and WebGL-unavailable states for relevant routes.

- [ ] **Step 7: Define documentation checks**

Require valid relative links, consistent terminology, no placeholders, no claims about nonexistent implementation, and updated docs whenever architecture or behavior changes.

- [ ] **Step 8: Commit**

Commit message: `docs: define quality gates`.

---

### Task 7: Verify the documentation system as one unit

**Files:**
- Verify: `AGENTS.md`
- Verify: `README.md`
- Verify: `DESIGN.md`
- Verify: `brand-showcase.html`
- Verify: `docs/PRODUCT_SPEC.md`
- Verify: `docs/ARCHITECTURE.md`
- Verify: `docs/CONTENT_GUIDE.md`
- Verify: `docs/ASSET_GUIDE.md`
- Verify: `docs/QUALITY.md`

**Interfaces:**
- Consumes: all completed documentation.
- Produces: a coherent repository baseline ready for application planning.

- [ ] **Step 1: Verify file presence**

Expected: all nine approved files exist on `main`.

- [ ] **Step 2: Verify source fidelity**

Historical initial-import expectation only. Current files are expected to evolve under the repository authority hierarchy, so source hashes need not match the supplied files.

- [ ] **Step 3: Scan for unresolved language**

Search case-insensitively for common unfinished-work markers and sample filler. Expected: no unresolved or ambiguous drafting artifacts.

- [ ] **Step 4: Check internal links**

Extract relative Markdown links and confirm every local target exists. Expected: no broken local links.

- [ ] **Step 5: Check terminology and authority**

Expected: all files use Printaway consistently; Shop and Studio remain distinct; technical choices match the approved spec; `DESIGN.md` is the visual authority; the showcase is never described as production code.

- [ ] **Step 6: Check repository-state honesty**

Expected: the docs identify source paths and npm scripts as planned contracts until scaffolding exists and do not claim that the application currently runs.

- [ ] **Step 7: Review the GitHub diff**

Expected: only the approved documentation and supplied source references changed.

- [ ] **Step 8: Commit any verification corrections**

Commit message, only if corrections are necessary: `docs: align repository guidance`.
