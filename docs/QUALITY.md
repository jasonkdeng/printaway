# PrintAway Quality Gates

## Purpose

This document defines the evidence required before a PrintAway change is considered ready. It applies to application code, content, styling, motion, and product media.

The repository is currently documentation-first. The commands below become executable when the Next.js scaffold exposes the documented scripts.

## Required checks

The future `package.json` must expose:

```bash
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run build
```

Run the narrowest affected check during iteration. Before claiming an implementation is complete, run the relevant full checks and inspect their output:

- ESLint reports zero errors;
- TypeScript reports zero errors in strict mode;
- unit and component tests report zero failures;
- critical Playwright journeys report zero failures;
- production build exits successfully;
- affected routes produce no new browser-console errors.

If a command cannot run because the scaffold or dependency is missing, report it as unverified. Do not substitute a successful unrelated command.

## Test layers

### Domain and unit tests

Cover pure logic for:

- dimension normalization and range limits;
- material and finish compatibility;
- quantity constraints;
- money and cart totals;
- availability badge selection;
- estimate status and assumptions;
- schema parsing and stable error codes;
- stale estimate response handling.

Tests use representative valid, boundary, and invalid values. Currency is explicit and money uses integer minor units.

### Component tests

Cover observable behavior for:

- Shop filters and URL state;
- product variant and quantity selection;
- add-to-cart feedback;
- cart quantity changes, removal, price conflict, and unavailable lines;
- Studio step progression;
- invalid field messages and error summary focus;
- estimate updates and unavailable estimate recovery;
- upload progress and failed upload recovery;
- status announcements;
- poster fallback when the model fails;
- reduced-motion controls.

### End-to-end tests

Critical journeys:

1. Home → Shop → product detail → select variant → cart.
2. Shop product with unavailable variant → choose another valid variant.
3. Cart price change → review required → cart remains intact.
4. Studio → material → dimensions → finish → quantity → estimate.
5. Studio invalid dimensions → correction → valid continuation.
6. Studio estimate unavailable → submit for confirmed quote.
7. Studio submission failure → entered data remains available.
8. Keyboard-only Shop purchase.
9. Keyboard-only Studio submission.
10. Reduced-motion mode removes non-essential movement.
11. WebGL-disabled product detail remains understandable and actionable.
12. Catalog empty and catalog error states provide recovery.

Tests should assert headings, accessible names, visible state, URL state, and user outcomes rather than CSS implementation details.

## Accessibility gates

Every route must provide:

- semantic landmarks and a logical heading hierarchy;
- visible focus that meets contrast requirements;
- keyboard access to every action and form control;
- accessible names for icon-only controls;
- labels, instructions, and errors associated with their fields;
- an error summary that can receive focus when a submission fails;
- status announcements that do not steal focus;
- at least WCAG 2.2 AA contrast for text, controls, and focus indicators;
- no state conveyed by colour alone;
- touch targets large enough for reliable use, with 44 CSS pixels as the default target;
- a useful page when JavaScript or WebGL is unavailable;
- a `prefers-reduced-motion` alternative for every non-essential animation.

For the 3D viewer, the product name, dimensions, material, and key action must appear outside the canvas. Rotation must never be the only way to inspect or understand the product.

## Responsive review

Review at these viewport widths:

- 320 px;
- 375 px;
- 768 px;
- 1024 px;
- 1440 px.

At each width, verify:

- no horizontal page scrolling;
- navigation remains understandable;
- product media preserves its reserved ratio;
- product specs do not rely on hover;
- Studio step content and readout remain ordered and readable;
- errors and long product names do not overlap controls;
- tables or specification groups remain usable;
- cart controls remain reachable.

Review portrait and landscape where a device class makes the layout meaningfully different.

## Browser coverage

Critical Playwright journeys run against current stable:

- Chromium;
- Firefox;
- WebKit.

The WebGL-disabled case is explicit. At least one run must disable or fail WebGL deliberately so the static fallback is exercised.

## Motion review

Default motion must follow `DESIGN.md`:

- hero layer reveal: deliberate, bottom-to-top, staggered, then one light sweep;
- product-card hover: 4 px lift and restrained spec-strip reveal;
- route change: calm crossfade only;
- Studio cursor: crosshair only within the configurator;
- no bounce, overshoot, decorative parallax, or repeated ambient spectacle.

Reduced motion must:

- remove the layer-build transition;
- remove the light sweep;
- remove ambient glow animation;
- remove parallax;
- remove route crossfade;
- preserve content order, focus, state, and controls.

Verify reduced motion with both automated media emulation and manual keyboard review.

## Performance budgets

Initial targets are p75 user-experience budgets:

| Metric | Target |
| --- | ---: |
| Largest Contentful Paint | ≤ 2.5 s |
| Interaction to Next Paint | ≤ 200 ms |
| Cumulative Layout Shift | ≤ 0.1 |
| Standard compressed product GLB | ≤ 3 MB target |
| Product GLB review trigger | > 5 MB |
| Product poster | ≤ 250 KB target; > 500 KB review |
| Product still | ≤ 500 KB target; > 1 MB review |

Implementation rules:

- render useful poster and text content before a hero model download;
- lazy-load below-the-fold images and models;
- reserve dimensions before media loads;
- subset fonts and load only required weights;
- avoid importing 3D runtime code into routes that do not use it;
- use demand-driven rendering for static scenes;
- pause offscreen or hidden scenes;
- measure production builds, not only development mode;
- document any budget exception and its customer benefit.

See [the asset guide](ASSET_GUIDE.md) for detailed model and texture budgets.

## Visual review

Compare affected routes against `DESIGN.md` and `brand-showcase.html`.

Review:

- Void Black, Bone, Graphite, Aluminum, Cure Violet, and Hot Amber tokens;
- Space Grotesk or the approved display-face implementation, General Sans or its approved body implementation, and JetBrains Mono utility text;
- 8 px spacing rhythm;
- flat surfaces and limited shadow use;
- line icon vocabulary;
- layer-line section dividers;
- product-first framing and negative space;
- Shop gallery versus Studio machine-panel distinction;
- CTA wording and mono labels;
- hero-only gradient/light treatment;
- allowed motion timing and reduced-motion behavior.

The showcase is a visual reference. Do not copy its illustrative SVG product geometry into production.

## Content and data review

Before publishing a product or material:

- every factual claim has an approved source;
- price, currency, dimensions, availability, material, finish, limitations, and media are present;
- estimates are labelled as estimates;
- scarcity language is backed by inventory;
- policies are approved and versioned;
- upload and contact handling has a defined privacy and retention behavior;
- alternative text describes the product information conveyed;
- no internal provider error, secret, file path, or contact data appears in the UI or logs.

See [the content guide](CONTENT_GUIDE.md).

## Route-state matrix

Each applicable route is reviewed in these states:

| Area | Required states |
| --- | --- |
| Home | Default, reduced motion, WebGL fallback |
| Shop | Loading, populated, empty catalog, no filter results, request error |
| Product detail | Loading media, available, made to order, unavailable, missing product, model failure |
| Cart | Empty, populated, quantity update, removal, price conflict, unavailable line, handoff failure |
| Studio | Each step, invalid input, incompatible choice, estimating, estimate unavailable, manual review, submission success, submission failure |
| Policies | Published, missing content |
| Global | Keyboard-only, narrow viewport, browser zoom, slow network, disabled WebGL, reduced motion |

A state is not complete until the user knows what happened and has a useful next action.

## Change review checklist

Before merge or release:

- [ ] The change maps to `PRODUCT_SPEC.md` and does not expand MVP scope silently.
- [ ] Relevant source hierarchy and architecture rules were followed.
- [ ] Domain logic has direct automated coverage.
- [ ] UI behavior has component or end-to-end coverage where interaction changed.
- [ ] Accessibility and keyboard behavior were checked.
- [ ] Reduced motion and fallback behavior were checked.
- [ ] Responsive widths were reviewed.
- [ ] Performance budgets remain within limits or an exception is documented.
- [ ] Product content, claims, and asset provenance are valid.
- [ ] Documentation and relative links are current.
- [ ] Final verification output was inspected before claiming completion.

## Related references

- [Agent instructions](../AGENTS.md)
- [Design system](../DESIGN.md)
- [Product specification](PRODUCT_SPEC.md)
- [Architecture](ARCHITECTURE.md)
- [Content guide](CONTENT_GUIDE.md)
- [Asset guide](ASSET_GUIDE.md)
- [Interactive showcase](../brand-showcase.html)
