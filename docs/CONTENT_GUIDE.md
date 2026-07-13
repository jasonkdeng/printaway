# Printaway Content Guide

## Purpose

This guide turns the voice in `DESIGN.md` into repeatable interface and product-content rules. It applies to navigation, product data, Studio guidance, system states, accessibility text, and search metadata.

If this guide conflicts with `DESIGN.md`, follow `DESIGN.md`.

## Voice

Printaway sounds like the person who operates the printer:

- precise;
- calm;
- technically fluent;
- concise;
- slightly dry;
- warm only where story and craft benefit from it.

Use plain declarative sentences. Name the real material, unit, limitation, and action. Let evidence carry the sales message.

### Write this

- `PETG · 0.2 mm layer height · 5 h 10 min print time`
- `UV-stable material for covered outdoor use.`
- `That finish isn't available with this material.`
- `Estimate unavailable — submit the configuration for a confirmed quote.`

### Avoid this

- “Revolutionary quality that elevates your space.”
- “Our premium, game-changing materials.”
- “Oops! Something went wrong!”
- “Buy now before it’s too late!”
- “Eco-friendly” without a defined, sourced basis.

## Editorial rules

- Use Canadian English: `colour`, `fibre`, `centre`.
- Use sentence case for navigation, headings, labels, and buttons.
- Use active voice.
- Put the action or result first.
- Use contractions only when they sound natural and remain clear.
- Avoid exclamation marks in transactional content.
- Avoid rhetorical questions.
- Avoid internal production jargon unless the customer needs it to decide.
- Define unfamiliar technical terms on first use.
- Never replace a real measurement with an adjective such as “tiny,” “huge,” or “ultra-fine.”
- Do not imply certification, food safety, weather resistance, structural capacity, or sustainability without approved evidence.

## Naming

### Brand

Use `Printaway` in prose and document titles. The visual wordmark uses lowercase `printaway` as specified in `DESIGN.md`.

### Experiences

Use:

- `Shop` for pre-made products;
- `Studio` for the custom-print configurator;
- `cart` for selected Shop items;
- `quote request` for a submitted Studio configuration;
- `estimate` for provisional cost, material, or time output;
- `confirmed quote` only for an authoritative reviewed offer.

Do not call Studio a builder, marketplace, design AI, instant quote, or checkout unless its actual behaviour supports that term.

### Materials and finishes

Use the recognized material name first, followed by a useful explanation:

- `PLA — crisp detail for indoor objects`
- `PETG — tougher material with improved moisture resistance`

These are structural examples, not approved product claims. Published descriptions require verified properties.

Use finish names consistently across product data, Studio, and cart. Do not use two labels for the same production finish.

## Interface patterns

### Navigation

Preferred labels:

- `Shop`
- `Studio`
- `Materials`
- `About`
- `Cart`

Keep primary navigation short. Do not add `Home` when the wordmark already links home.

### Headings

Headings should state the object or decision:

- `Objects made in small runs`
- `Choose a material`
- `Check the dimensions`
- `Review your configuration`
- `Material limits`

Avoid headings that could belong to any storefront:

- “Discover excellence”
- “Endless possibilities”
- “Our amazing collection”
- “Let’s get started!”

### Buttons and links

Use a specific verb first:

- `Shop objects`
- `Configure a print`
- `View specifications`
- `Add to cart`
- `Update quantity`
- `Remove item`
- `Continue to finish`
- `Review configuration`
- `Submit quote request`
- `Try estimate again`
- `Return to Shop`

Use `View` for navigation and `Show` for disclosure on the current page. Avoid `Learn more` when a concrete label fits.

Buttons do not end with punctuation. Destructive actions use a direct noun, such as `Remove item`, rather than a vague `Confirm`.

### Back and continue controls

Name the destination when space allows:

- `Back to material`
- `Continue to size`

A generic `Back` is acceptable only when the previous step is visible and unambiguous.

## Product content model

A publishable product needs the following approved content.

| Field | Requirement | Guidance |
| --- | --- | --- |
| Name | Required | Concrete and ownable; avoid material or shape keyword stuffing |
| Slug | Required | Stable, lowercase, hyphenated |
| Summary | Required | One or two plain sentences describing purpose and defining feature |
| Description | Optional | Construction, use, and design context that helps the decision |
| Price | Required unless quote-only | Currency and integer minor-unit source data |
| Availability | Required | Authoritative state; never editorial urgency |
| Dimensions | Required | Labelled length × width × height with unit |
| Material | Required | Approved canonical material name |
| Finish | Required per variant | Approved canonical finish name |
| Colour | Required when selectable | Observable name; swatch alone is insufficient |
| Layer height | Optional | Show only when verified and meaningful |
| Production or dispatch estimate | Optional | Publish only from an approved operational source |
| Limitations | Required when applicable | Heat, water, UV, load, food contact, care, or indoor-use constraints |
| Media | Required | At least one responsive still with alternative text |
| Search title and description | Required | Specific and accurate, without keyword stuffing |

### Product names

Prefer short object names:

- `Terrace vessel`
- `Column tray`
- `Arc cable guide`

Avoid names that make unsupported performance or exclusivity claims:

- “The Ultimate Indestructible Planter”
- “Premium Luxury Organizer”
- “World’s Best Cable Clip”

### Product summaries

Use this order:

1. what the object is;
2. the feature that differentiates it;
3. an important use constraint when relevant.

Example structure:

> A low-profile tray printed as one continuous shell. Sized for keys, clips, and small desk parts. Indoor use only.

Do not copy a specifications table into prose.

### Specification strip

Use concise uppercase utility text for the visual strip:

`{MATERIAL} · {LAYER HEIGHT} · {PRINT TIME} · {FORMATTED PRICE}`

Rules:

- Use middle dots as separators.
- Keep the order consistent within a grid.
- Do not show an unverified time.
- `{FORMATTED PRICE}` includes the approved amount format and explicit business-approved currency.
- Do not hide required product information only in this strip.
- Provide the same information in normal page content for assistive technology and touch users.

### Availability labels

Approved labels:

- `In stock`
- `Made to order`
- `Unavailable`
- `Last one` only when authoritative inventory equals one

Do not use:

- “Selling fast”
- “Almost gone”
- “Hot”
- “Only a few left” without a defined inventory rule

## Studio copy

Studio copy should make each decision feel controlled rather than conversational.

### Step structure

Studio uses exactly six steps in this order: Reference, Material, Size, Finish, Quantity, then Review and submit.

Each step uses:

1. an eyebrow or progress label, such as `STEP 2 OF 6 · MATERIAL`;
2. a direct heading, such as `Choose a material`;
3. one short explanation of why the choice matters;
4. field labels and constraints;
5. a destination-specific continue action.

Do not use a chatty question for every heading.

### Estimate language

Always label provisional values:

- `Estimated print time`
- `Estimated cost`
- `Estimated material`

In the machine readout, the approved abbreviations are:

- `EST. PRINT TIME`
- `EST. COST`
- `EST. MATERIAL`

Supporting text:

- `Estimate based on the current dimensions, material, finish, and quantity.`
- `A confirmed quote may change after the model is reviewed.`
- `Manual review required`
- `Estimate unavailable`

Never say `final price`, `guaranteed`, or `instant quote` for provisional output.

### Dimensions

Field labels name the axis and unit:

- `Length (mm)`
- `Width (mm)`
- `Height (mm)`

Helpful text names the real rule:

- `Maximum supported height for this material: 240 mm.`

Error text names the correction:

- `Enter a height from 1 to 240 mm.`

Avoid:

- `Invalid input`
- `Bad dimensions`
- `Something is wrong`

### Uploads

Name what the customer can do without promising unsupported formats:

- `Add a model or reference`
- `Choose file`
- `Remove reference`
- `Upload interrupted — choose the file again.`

Accepted formats, limits, retention, and privacy language must come from the implemented upload policy.

### Submission

Use:

- `Submit quote request`
- `Submitting request`
- `Quote request received`
- `Reference: PA-…` only when the server returns that format
- `We couldn't submit the request. Your configuration is still here.`

Do not promise a response deadline unless it is an approved operational commitment.

## System states

### Loading

Describe the task when a wait is noticeable:

- `Loading products`
- `Updating estimate`
- `Checking availability`
- `Submitting request`

Do not rotate through promotional messages during loading.

### Empty

Separate a true empty source from a filtered result:

- Empty catalog: `No objects are listed right now.`
- No filter result: `No objects match these filters.`
- Empty cart: `Your cart is empty.`
- No uploaded references: `No references added.`

Pair the message with one useful action.

### Errors

An error message has:

1. what failed;
2. what the customer can do;
3. whether their input was retained.

Examples:

- `Products couldn't be loaded. Try again.`
- `That variant is no longer available. Choose another material or finish.`
- `The price changed from {previous formatted price} to {current formatted price}. Review the cart before checkout.`
- `Estimate unavailable. You can still submit this configuration for a confirmed quote.`
- `The request wasn't submitted. Your configuration is still here.`

Never expose raw schema language, exception messages, storage keys, provider names, or stack traces.

### Success

Success copy confirms the completed action:

- `Added Terrace vessel to cart.`
- `Quantity updated.`
- `Reference removed.`
- `Quote request received.`

Avoid praise, confetti language, and unnecessary exclamation marks.

## Accessibility copy

### Alternative text

Describe the product information conveyed by the image, not the photographic setup.

Useful:

- `Bone-coloured Terrace vessel with a narrow neck and stepped lower body.`
- `Top view of the Column tray showing three shallow compartments.`

Avoid:

- `Image of product`
- `Beautiful 3D printed vase`
- file names or search keywords

For multiple views, identify what changes: `Side view`, `Underside`, or `Scale beside a 15 cm ruler`.

Decorative lighting, texture, or divider graphics use empty alternative text.

A 3D canvas requires a nearby textual product name, controls with accessible names, and the same essential dimensions and material information outside the canvas.

### Control labels

Icon-only controls need a name that describes the action:

- `Rotate product left`
- `Reset product view`
- `Close image viewer`
- `Remove Terrace vessel from cart`

Do not use the icon name, such as `Rotate icon`.

### Status announcements

Keep live-region messages short and event-based:

- `Estimate updated: {formatted price}, approximately {formatted duration}.`
- `Material changed to PETG. Finish selection cleared.`
- `Quote request submitted. Reference PA-1042.`

Do not announce every range-input movement. Announce after a settled change or explicit step transition.

## Search and sharing

Page titles use:

`{Specific page or product} — Printaway`

Descriptions state the object, material or purpose, and relevant action. Avoid lists of keywords.

Social images must use approved product media, retain safe crop space, and never substitute the brand showcase's illustrative SVG objects for real products.

## Claims and provenance

Before publishing a factual claim, record its source in product or material content:

- manufacturer technical data;
- Printaway test method and date;
- production system data;
- approved business policy;
- authoritative inventory or price source.

If the source does not support the exact claim, narrow or remove it. Phrases such as `eco-friendly`, `non-toxic`, `food-safe`, `weatherproof`, and `load-bearing` require especially careful approval.

## Content review checklist

- Does every sentence help someone understand, decide, recover, or act?
- Are units and limitations explicit?
- Are estimates labelled?
- Is availability authoritative?
- Does the CTA name the action or destination?
- Are errors direct and recoverable?
- Is warmth reserved for story content rather than system states?
- Are alt text and accessible labels specific?
- Are claims sourced?
- Are Shop and Studio terms used consistently?
- Does the page avoid hype, fake urgency, and invented policy?

## Related references

- [Agent instructions](../AGENTS.md)
- [Design system](../DESIGN.md)
- [Product specification](PRODUCT_SPEC.md)
- [Architecture](ARCHITECTURE.md)
- [Asset guide](ASSET_GUIDE.md)
- [Quality gates](QUALITY.md)
