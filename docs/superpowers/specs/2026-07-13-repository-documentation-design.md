# Printaway Repository Documentation Design

**Date:** 2026-07-13  
**Status:** Superseded historical record
**Repository:** `jasonkdeng/printaway`

> This file records the original documentation-design decision. It is not a current source of implementation requirements. `AGENTS.md` and its current reading order govern all current work; the hierarchy below is historical, with `DESIGN.md` canonical for visual decisions and `brand-showcase.html` illustrative only.

## Goal

Prepare the empty Printaway repository for reliable agent-assisted development by adding an authoritative documentation system grounded in the supplied brand specification and an illustrative brand showcase.

## Historical source-of-truth hierarchy

At the time this record was approved, conflicts were resolved in this order:

1. `AGENTS.md` for repository workflow, engineering constraints, and completion criteria.
2. `DESIGN.md` for visual identity, interaction design, motion, typography, color, and brand voice.
3. `docs/PRODUCT_SPEC.md` for product scope, routes, user journeys, and exclusions.
4. `docs/ARCHITECTURE.md` for technical boundaries and implementation patterns.
5. `docs/CONTENT_GUIDE.md`, `docs/ASSET_GUIDE.md`, and `docs/QUALITY.md` for domain-specific execution rules.
6. `brand-showcase.html` as an illustrative companion to `DESIGN.md`; where the two differ, `DESIGN.md` wins.

## Documentation set

### `AGENTS.md`

The root operating manual for all agentic contributors. It will define:

- required reading order;
- approved technology choices;
- repository map and expected boundaries;
- change workflow and scope discipline;
- design-system enforcement;
- testing, accessibility, performance, and responsive requirements;
- rules for generated code and externally produced 3D assets;
- validation commands as a required script contract, without claiming the scripts already exist;
- a concrete definition of done.

### `README.md`

A concise human entry point covering:

- Printaway's product proposition;
- the distinction between Shop and Studio;
- the approved stack;
- current repository status;
- documentation map;
- intended local-development workflow once the application scaffold exists.

### `DESIGN.md`

The supplied brand and visual design system will be preserved as the canonical design reference.

### `brand-showcase.html`

The supplied HTML companion will be kept at the repository root. It illustrates the palette, type hierarchy, signature layer reveal, light sweep, product-card behavior, and Studio readout treatment. It is neither a source of truth nor production application code.

### `docs/PRODUCT_SPEC.md`

Defines the first releasable product:

- core audience and jobs to be done;
- Shop and Studio user journeys;
- initial route map;
- product, cart, configurator, quote, and informational page behavior;
- functional requirements and acceptance criteria;
- explicit MVP exclusions to control scope.

### `docs/ARCHITECTURE.md`

Defines an opinionated implementation architecture:

- Next.js App Router with TypeScript;
- Tailwind CSS with CSS custom properties for brand tokens;
- React Three Fiber and Drei for intentional 3D product experiences;
- server components by default and client components only for interaction;
- schema-validated domain models;
- provider-neutral commerce, storage, and quote boundaries behind adapters;
- feature-oriented file organization;
- progressive enhancement and non-WebGL fallbacks.

The documentation will not select a commerce vendor before product requirements demand one.

### `docs/CONTENT_GUIDE.md`

Turns the brand voice into repeatable copy rules for:

- navigation, headings, labels, CTAs, and status text;
- product names and technical specifications;
- validation, empty, loading, and error states;
- Shop versus Studio tone;
- accessibility labels and alternative text;
- prohibited marketing language.

### `docs/ASSET_GUIDE.md`

Defines the external 3D asset pipeline:

- source and delivery formats;
- GLB scene conventions, scale, origin, naming, and material expectations;
- mesh, texture, and file-size budgets;
- Draco or Meshopt compression policy;
- poster-image and static fallback requirements;
- lighting and camera consistency;
- licensing and provenance records;
- validation before an asset enters production.

Models and hero renders must be authored in external 3D tools, not synthesized from procedural website geometry.

### `docs/QUALITY.md`

Defines release gates for:

- TypeScript, linting, formatting, and automated tests;
- responsive behavior;
- keyboard navigation and WCAG 2.2 AA expectations;
- reduced motion and WebGL fallbacks;
- image and 3D performance;
- Core Web Vitals targets;
- browser coverage;
- visual and content review.

## Technical direction

The project will use:

- Next.js App Router;
- TypeScript in strict mode;
- Tailwind CSS;
- React Three Fiber and Drei;
- Vitest and Testing Library for unit and component tests;
- Playwright for critical browser journeys;
- Zod at external and domain boundaries.

Exact package versions will be selected when the application is scaffolded. Documentation will avoid pretending that dependencies, scripts, or configuration files already exist.

## Experience boundaries

### Shop

Shop is a restrained gallery for pre-made products. It prioritizes product imagery, technical specifications, availability, and clear purchase actions. Product grids remain spacious and use restrained, purposeful motion.

### Studio

Studio is a focused six-step custom-print configurator: Reference, Material, Size, Finish, Quantity, then Review and submit. It uses a live machine-style readout and must not look like a repurposed Shop grid. Estimates are clearly labeled until server-side validation or a quote makes them authoritative.

## Quality strategy

Documentation must make these requirements non-optional:

- semantic HTML and keyboard access;
- WCAG 2.2 AA contrast and interaction behavior;
- complete `prefers-reduced-motion` handling;
- meaningful non-WebGL fallbacks;
- responsive layouts from small screens upward;
- performance budgets for images, fonts, JavaScript, and 3D assets;
- automated coverage of pricing, configuration, cart, and quote logic;
- visual comparison against canonical `DESIGN.md`, with `brand-showcase.html` used only as an illustrative companion.

## Scope boundaries

This documentation task will not:

- scaffold the Next.js application;
- choose or configure a commerce, payment, authentication, storage, or CMS provider;
- implement storefront or configurator features;
- create production 3D models or photography;
- convert the brand showcase into production components;
- invent business policies such as shipping rates, return rules, or quote turnaround times.

## Completion criteria

The task is complete when all nine approved files are present on GitHub, cross-linked, internally consistent, free of unresolved placeholders, faithful to the supplied design references, and specific enough for a future agent to plan and implement the first application scaffold without guessing at foundational decisions.
