# PrintAway Product Specification

## Purpose

PrintAway helps someone either purchase a finished small-batch 3D-printed object or prepare a clear custom-print request. The experience should feel like a precise workshop: calm, product-led, technically credible, and easy to operate.

This specification defines the first releasable web product. It does not define business policies or select external service providers.

## Experience principles

1. **Lead with the object.** The finished product is the subject; manufacturing details explain why it can be trusted.
2. **Separate Shop and Studio.** Shop is a gallery and checkout path. Studio is a guided configuration and quote path.
3. **Show real constraints.** Materials, dimensions, finish, availability, production time, and price must be specific and sourced.
4. **Make estimates honest.** A calculated value is labeled as an estimate until an authoritative server process confirms it.
5. **Degrade without losing the task.** Motion, WebGL, and rich imagery enhance understanding but never gate browsing, purchasing, or submitting a request.

## Users and jobs

### Shop customer

A customer who wants a finished object needs to:

- understand what the object looks like and how large it is;
- compare material, finish, price, availability, and production time;
- confirm care or use limitations;
- select an available variant and add it to a cart;
- understand the next step without encountering invented urgency.

### Studio customer

A customer with a custom-print need must be able to:

- describe or attach a reference for the desired object;
- choose supported material, size, finish, and quantity;
- see how decisions affect a provisional estimate;
- understand unsupported combinations or missing information;
- review the request and submit it for a confirmed quote;
- retain entered information if submission fails.

## Initial route map

| Route | Responsibility | Required states |
| --- | --- | --- |
| `/` | Brand introduction, one hero object, Shop and Studio entry points, selected work | Default, reduced motion, static hero fallback |
| `/shop` | Small, curated product catalog | Loading, results, empty catalog, filter with no results, error |
| `/shop/[slug]` | Product imagery, specifications, variants, availability, purchase action | Available, unavailable, loading media, failed media, missing product |
| `/studio` | Step-based custom-print configuration and quote submission | Initial, each step, invalid combination, estimating, estimate unavailable, submitting, success, failure |
| `/cart` | Selected Shop variants, quantities, totals, checkout handoff | Populated, empty, updated price, unavailable line, handoff failure |
| `/about` | Workshop story, process, capabilities, and limits | Default |
| `/materials` | Supported materials, properties, finish options, and limitations | Default, no supported combination from a linked configuration |
| `/policies/[slug]` | Provider-independent policy content once approved by the business | Published policy, missing policy |

Policy pages must not ship with invented terms. A route may remain unpublished until approved content exists.

## Homepage requirements

The homepage must:

- state what PrintAway makes without generic 3D-printing hype;
- show one hero product with an authored still or optimized model;
- offer clear paths to `Shop objects` and `Configure a print`;
- explain the value of material and process choices in concrete terms;
- show selected products or commissioned work without becoming a dense catalog;
- reserve the signature layer reveal and light sweep for the primary hero;
- provide equivalent static content when motion is reduced or WebGL is unavailable.

## Shop requirements

### Catalog

The Shop is a small gallery, not a marketplace. It must:

- use generous spacing and product-first imagery;
- support only useful filters backed by real catalog data, initially material, use, and availability;
- retain filter state in the URL when filters exist;
- show product name, starting or exact price, material, key dimension, and availability;
- use the documented mono specification strip without hiding essential information exclusively behind hover;
- communicate an empty catalog separately from a filter with no matches.

### Product detail

Each product page must include:

- product name and plain-language purpose;
- responsive image gallery and, only when useful, an interactive 3D view;
- dimensions with units;
- material and finish;
- layer height when it is meaningful and verified;
- care, indoor/outdoor, heat, food-contact, or load limitations where applicable;
- production or dispatch estimate only when sourced;
- variant price and currency;
- availability state;
- quantity selection with a valid minimum;
- an add-to-cart action;
- a static poster and complete text alternative for 3D content.

Product media may replay the short user-triggered specular sweep described in `DESIGN.md`. It must not continuously animate.

### Availability

Supported presentation states are:

- `In stock`
- `Made to order`
- `Unavailable`
- `Last one` only when inventory data proves exactly one sellable unit remains

Scarcity language must come from authoritative inventory data. Do not synthesize urgency.

## Studio requirements

Studio is a step-based configurator. On small screens, the current decision appears before the readout; on wider screens the readout may remain beside the step.

### Step 1: Reference

The customer provides at least one of:

- an accepted model or drawing upload;
- reference images;
- a concise project description.

Upload types and size limits must come from the selected storage and quoting implementation. Until configured, the interface must not promise a specific maximum.

### Step 2: Material

Show supported materials with verified properties, suitable uses, limitations, and available colors. A material cannot be selected if it conflicts with known size, use, or finish constraints.

### Step 3: Size

Collect dimensions in an explicit unit system. Inputs must:

- identify length, width, and height clearly;
- reject non-numeric, zero, negative, or unsupported values;
- explain a machine-volume limit in user-facing units;
- preserve valid values when another field fails.

### Step 4: Finish

Show only finishes supported by the selected material. Describe the observable result and any verified effect on cost or production time.

### Step 5: Quantity

Accept a positive whole number within supported limits. Larger quantities that require manual review remain submittable as quote requests without showing an unverified instant price.

### Step 6: Review and submit

Review must show:

- supplied references;
- material, dimensions, unit, finish, and quantity;
- provisional cost and production-time estimates when available;
- exclusions or assumptions used in the estimate;
- customer contact fields required for follow-up;
- consent text tied to an approved privacy policy before collecting personal information;
- a single `Submit quote request` action.

A successful submission receives a stable reference identifier and a clear next step. Do not promise a response time unless the business has approved one.

### Persistent readout

The machine-style panel may show:

- `MATERIAL`
- `SIZE`
- `FINISH`
- `QUANTITY`
- `EST. MATERIAL`
- `EST. PRINT TIME`
- `EST. COST`

Unknown values display an em dash, not a fabricated default. Every estimate update must be announced accessibly without creating excessive screen-reader interruption.

## Cart requirements

The cart must:

- use stable product and variant identifiers;
- show selected variant details, unit price, quantity, and line total;
- permit quantity changes and removal;
- revalidate price and availability before checkout handoff;
- identify changed or unavailable lines without deleting them silently;
- represent money in integer minor units;
- persist through a reasonable same-device return once a storage strategy is selected;
- remain usable without WebGL.

Payment and checkout behavior will be specified with the selected commerce provider. The current product scope requires a clean adapter boundary, not a provider choice.

## Content and data requirements

A product cannot be published without:

- stable slug and identifier;
- approved name and description;
- at least one responsive still image with alternative text;
- dimensions and unit;
- material;
- price and currency or an explicit quote-only state;
- availability;
- verified limitations;
- media provenance and usage rights.

See [the content guide](CONTENT_GUIDE.md) for copy patterns and [the asset guide](ASSET_GUIDE.md) for media delivery.

## Failure and recovery

- Preserve user-entered Studio data after validation or submission errors.
- Provide an inline field message and a summary when a submission contains multiple errors.
- If estimate calculation fails, allow the customer to continue with `Estimate unavailable — request a confirmed quote`.
- If WebGL fails, replace it with the poster image without changing page structure or purchase actions.
- If the catalog fails, show a retry action and retain active filters.
- If a cart price changes, require acknowledgement before checkout.
- If a product or policy is missing, provide a useful path back rather than a blank screen.
- Never expose raw provider errors, stack traces, upload locations, or internal identifiers other than an intentional customer reference.

## Accessibility and responsive acceptance criteria

A release satisfies this specification only if:

- every route can be understood and operated with a keyboard;
- Shop purchase and Studio submission can be completed at 320 CSS pixels without horizontal page scrolling;
- focus moves predictably between Studio steps and to error summaries;
- status updates are announced without stealing focus;
- all essential hover content is also available on touch and keyboard;
- reduced-motion mode removes the layer-build sequence, light sweep, parallax, and route crossfade;
- every interactive model has a static poster and equivalent product information;
- color is never the only carrier of stock, error, or selection state;
- interrupted or failed Studio submission does not erase valid input.

See [quality gates](QUALITY.md) for test and performance requirements.

## MVP exclusions

The first release excludes:

- customer accounts and saved profiles;
- wishlists, loyalty, referrals, reviews, and ratings;
- marketplace or third-party seller features;
- augmented-reality placement;
- generative or procedural product models;
- automatic guarantees that an uploaded model is manufacturable;
- live printer scheduling or queue position;
- internationalization and multi-currency presentation;
- subscriptions;
- wholesale administration;
- a provider-specific CMS, commerce, payment, or storage implementation chosen solely for scaffolding.

## Decisions that require business input

Implementation must stop for confirmation before encoding:

- actual products, prices, taxes, currencies, and inventory rules;
- supported materials, colors, dimensions, finishes, and tolerances;
- production, dispatch, pickup, and shipping promises;
- return, privacy, upload-retention, and acceptable-use policies;
- quote contact fields and response expectations;
- accepted upload types and maximum sizes;
- payment and checkout provider;
- commerce, content, storage, email, analytics, and error-monitoring providers.

## Related references

- [Agent instructions](../AGENTS.md)
- [Design system](../DESIGN.md)
- [Interactive showcase](../brand-showcase.html)
- [Architecture](ARCHITECTURE.md)
- [Content guide](CONTENT_GUIDE.md)
- [Asset guide](ASSET_GUIDE.md)
- [Quality gates](QUALITY.md)
