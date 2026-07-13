# printaway — brand & design system

**Prepared for:** a 3D printing studio operating between Toronto and Waterloo, Ontario — ready-made printed objects and custom/commissioned prints.
**Prepared by:** freelance UX/brand design
**Scope:** brand strategy, naming, logo direction, color, type, layout, photography, motion, voice, and physical/storefront applications. No payments, checkout logic, or database architecture — design only.

---

## 0. How to use this document

This is a working system, not a mood board. Every rule below is written so a developer, photographer, sign shop, or the next designer you hire can pick it up and produce something on-brand without asking you what you meant. Where a decision is still open (the legal company name, for instance), it's flagged explicitly — everything else is a committed direction.

---

## 1. Brand strategy

### 1.1 Positioning

Most 3D printing companies sell the process — "additive manufacturing," "rapid prototyping," filament specs. This brand sells the object and treats the process as the reason to trust it, not the headline. The printer is the workshop; the storefront is the gallery. Every design decision below exists to make a printed object look like it deserves a plinth and a spotlight, whether it's a $22 desk object or a one-off commission.

### 1.2 Two cities, one identity

Toronto and Waterloo aren't just two addresses — they're two different jobs, and the brand should let each city do the job it's good at, rather than forcing one generic identity onto both:

- **Toronto — the storefront.** Retail, walk-in browsing, impulse and gift buying, the moody lighting and negative-space window presence the brief asks for. This is where the brand performs.
- **Waterloo — the studio.** Fabrication, custom commissions, the engineering-school neighborhood. This is where the brand proves it can actually build the thing.

Keep both under one identity system (this document), but let copy and imagery lean into whichever job is relevant — storefront pages get more "gallery," studio/custom pages get more "workshop."

### 1.3 The two services, positioned differently

| | **Shop** (pre-made) | **Studio** (custom) |
|---|---|---|
| What it is | Ready-to-ship printed objects | Commissioned / configured prints |
| Feels like | A small, curated gallery | Operating the machine yourself |
| UI mood | Quiet grid, generous space | Live readouts, a console |
| Primary verb | Browse | Configure |

Section 10 details the UI split. The point to hold onto everywhere else: Shop is *curated*, Studio is *instrumented*. Don't let the two collapse into one generic "product page."

### 1.4 Personality

**Is:** precise, quiet, confident, a little industrial, dry-witted rather than cheerful.
**Is not:** playful-cute, maximalist, corporate-friendly, loud, apologetic.

If a design choice could plausibly belong to a children's toy brand or a SaaS dashboard, it's off-brand. If it could plausibly belong to a machine-tool catalog or a small gallery, it's on-brand.

### 1.5 Tagline direction

**Built in layers.** — literal (every object here is printed one layer at a time) and regional (built by two cities, Toronto and Waterloo). Use sparingly — once per page, typically near the logo, never as a repeated slogan stapled to every asset.

---

## 2. Naming

Confirmed: **Printaway** (set as `printaway`, always lowercase, in the wordmark; sentence case in running text — "Printaway").

The name is more playful and more literal than the working name this system was first drafted around — it says exactly what the shop does, no decoding required, and it reads equally well on a storefront sign in Toronto and a shipping label out of Waterloo. The job of the rest of this system is to keep that friendliness from tipping into "novelty gift shop": the color, type, and motion stay precise and a little industrial specifically so **printaway** doesn't read as cutesy. Playful name, serious craft — that tension is the brand.

One practical note: because "away" reads adjacent to takeout/delivery apps (as in "get it delivered"), keep supporting copy anchored to *making* and *printing* early and often on first touch (homepage hero, storefront sign, packaging) so the name lands as "print, away from a factory floor" rather than "printing delivered to you." It's a one-line copy discipline, not a design constraint.

---

## 3. Logo & mark

### 3.1 Wordmark

`printaway`, set in **Neue Machina ExtraBold**, all lowercase, tracked slightly tight (-1.5%). A single hairline rule runs through the wordmark at cap-height, left edge to right edge, merging seamlessly with the crossbar of the "t" as it passes through — one continuous layer line cutting straight across the whole name, rather than sitting under it as a decorative underline. It should read as a deliberate typographic detail, not a gimmick that needs explaining.

### 3.2 Symbol (mark)

A standalone mark for favicons, social avatars, embossed packaging, and the storefront sign: four horizontal bars of equal height, equal thickness, each offset slightly further right than the one below it — a minimal cross-section through a printed, terraced object. Renders at 16px without losing legibility. Never add a gradient, bevel, or drop shadow to it — it stays flat in every application.

### 3.3 Lockup rules

- Minimum clear space around the mark: the height of one bar, on all sides.
- On dark surfaces (the default): mark and wordmark in Bone (`#F5F2ED`).
- On light surfaces (rare — packaging interiors, printed invoices): mark and wordmark in Void Black (`#0A0A0B`).
- Never recolor the mark in Cure Violet or Hot Amber. Those are signal colors — the identity mark stays neutral so it never competes with an actual call to action.
- Never place the wordmark over a photograph directly; give it a solid Void Black or Bone bar to sit on.

---

## 4. Color system

Six named colors. No off-palette hex values anywhere — packaging, signage, and the site all draw from this table only.

| Name | Hex | Role |
|---|---|---|
| **Void Black** | `#0A0A0B` | Primary background. Matte, not pure digital black — think anodized aluminum, not OLED. |
| **Bone** | `#F5F2ED` | Primary text on dark, and the rare light surface (packaging interior, print invoices). Warm off-white, not clinical white. |
| **Graphite** | `#3A3A3D` | Secondary dark surface — cards, dividers, the "shelf" behind a product on light-mode assets. |
| **Aluminum** | `#B8B8B4` | Secondary/muted text, raw-material reference (this is what unpainted PLA and machined aluminum actually look like under gallery light). |
| **Cure violet** | `#7C5CFF` | Primary signal color. This is not a decorative accent — it's the actual wavelength of the light that cures photopolymer resin. Use it for the one thing per screen that wants attention: a CTA, a live status, a price. |
| **Hot amber** | `#FF7A33` | Secondary signal color, used sparingly — the color of a heated nozzle. Reserved for scarcity/urgency only: "1 left," "limited batch," an overheating build-plate warning in the studio configurator. Never used decoratively. |

**Distribution guideline:** roughly 60% Void Black/Graphite, 30% Bone, 10% signal colors combined — and within that 10%, Hot Amber should be a sliver (under 2% of any given screen). If a page feels like it has "a lot of purple" or "a lot of orange," that's a bug, not a style.

**Accessibility:** Bone-on-Void-Black body text passes AA comfortably. Cure violet on Void Black is AA for large text (24px+) and UI elements/icons, but is not reliable for small body copy — never set a paragraph of small text in violet; reserve it for headlines, buttons, and short labels.

---

## 5. Typography

Three typefaces, three jobs. None of them is the default "grab Inter and move on" choice — each is doing something specific for this brand.

| Role | Typeface | Why |
|---|---|---|
| **Display** | Neue Machina (ExtraBold / Bold) | An industrial, slightly mechanical grotesk built for exactly this kind of technical-but-designed brand. Used for headlines only, in restraint — one per screen, never body text. |
| **Body** | General Sans (Regular / Medium) | Humanist, warm, highly legible at small sizes — the counterweight to Neue Machina's hardness. Carries all real reading: descriptions, care instructions, about copy. |
| **Utility / mono** | JetBrains Mono (Regular / Medium) | Every number on this site is a spec — dimensions, print time, material, price, batch count. Setting those in a monospace face isn't a style flourish, it's literally what a slicer or G-code readout looks like, and it gives numbers a fixed, scannable rhythm a proportional font can't. |

### 5.1 Type scale (desktop / mobile, px)

| Token | Size | Face | Use |
|---|---|---|---|
| Display 3XL | 120 / 64 | Neue Machina ExtraBold | Homepage hero only — one per site |
| Display 2XL | 72 / 44 | Neue Machina ExtraBold | Section/category headlines |
| Display L | 48 / 32 | Neue Machina Bold | Product name on detail page |
| Display M | 32 / 26 | Neue Machina Bold | Card titles, subsection headers |
| Body L | 20 / 18 | General Sans Regular | Intro paragraphs, product descriptions |
| Body M | 16 / 16 | General Sans Regular | Default paragraph |
| Body S | 14 / 14 | General Sans Medium | Captions, footnotes |
| Mono label | 12 / 11 | JetBrains Mono Medium, uppercase, +0.08em tracking | Eyebrows, nav labels, spec sheets, prices, timestamps |

**Rule:** a page gets exactly one Display 3XL or 2XL moment. If everything is shouting, the hero isn't a thesis anymore, it's noise.

---

## 6. Grid, spacing, and negative space

### 6.1 Base unit

8px base unit. Spacing scale: **8 · 16 · 24 · 32 · 48 · 64 · 96 · 128 · 192.** Nothing sits outside this scale — no 20px or 30px paddings.

### 6.2 Grid

| Breakpoint | Columns | Outer margin | Gutter |
|---|---|---|---|
| Desktop (≥1200px) | 12 | 96px | 24px |
| Tablet (≥768px) | 8 | 48px | 16px |
| Mobile | 4 | 24px | 16px |

### 6.3 The product frame ratio — a signature detail

Every product photograph on the site, in packaging, and on social templates is cropped to a **6:5 ratio (1.2:1)** — not square, not a standard 4:5 or 4:3. This is drawn directly from the X/Y build-plate proportions of a common desktop FDM printer bed (250mm × 210mm). It's a small thing, but it means every image on this brand shares a proportion that's actually inherited from the machines making the objects, rather than a stock "Instagram square." Use it everywhere images appear — it's one of the two or three details that should make this brand instantly recognizable in a feed.

### 6.4 Negative space rules (not suggestions)

- **Hero sections:** the product/subject occupies at most 45% of viewport width on desktop. The rest stays Void Black or Bone — no filler texture, no decorative shapes to "balance" it.
- **Product grids:** minimum 64px gutter between cards at desktop; cards never touch the viewport edge (96px outer margin minimum, per the grid above).
- **Off-center placement:** never dead-center a hero product shot. Bias it to a lower third or one side, the way a single object sits in a dark gallery window — the empty space should feel like it's doing the framing, not like it's leftover.
- **One CTA per screen.** If there are two buttons, one is secondary (outline, Bone text) and one is primary (Cure violet fill). Never two filled buttons on one screen.

---

## 7. Photography & lighting direction

This is the section that carries the "moody, modern lighting that intrigues the customer" brief most directly — treat it as equally important as the color palette.

- **Single dominant key light**, 30–45° above and to one side of the object. Let it cast a real, slightly hard-edged shadow — this is workshop/gallery light, not beauty-dish e-commerce light. Shadows are part of the composition, not something to eliminate.
- **Background is always Void Black or deep Graphite seamless.** No white sweep, no lifestyle backdrops, no in-home "on a shelf" staging for hero shots.
- **A thin rim/edge light in Cure violet or cool white** separates the object's silhouette from the black background. This is the one place the violet accent shows up in photography rather than UI — a literal nod to the glow of a resin cure chamber. This same rim light is what animates on-screen (Section 8.2) — the site isn't just showing a photo of the light, it's letting the light move.
- **Macro layer-line inserts:** extreme close-up shots of the actual print texture (the ridged surface you get from FDM layers, or the faint striations on a resin part), lit hard from the side to raise the ridges. Use these small, as texture accents in otherwise-empty negative space — a 200px inset in a large black field, never full-bleed decoration.
- **No overexplained lifestyle shots.** A hand holding the product is fine as a small secondary/detail image on a product page; it is never the hero. The hero is the object, alone, lit like it's the only thing in the room.
- **Custom/Studio photography is allowed to be rawer:** shots of the object mid-print, still on the bed, nozzle in frame, ambient light low except for the printer's own LED glow. This is intentional — Shop photography is "finished gallery piece," Studio photography is "you're watching it get made."

---

## 8. Motion & interaction

Motion should feel like one considered move per moment, not a pile of small effects. Respect `prefers-reduced-motion` everywhere — every animation below needs a static/fade fallback.

### 8.1 Signature moment: the layer reveal

The one motion idea this brand should be remembered for. When a hero product image loads or scrolls into view, it doesn't fade in — it's revealed by a series of thin horizontal bands that sweep away from bottom to top in sequence, as if the object is completing its print in front of you.

- 6–10 bands, each revealing before the one above it.
- Per-band duration: 480ms. Stagger between bands: 40ms.
- Easing: `cubic-bezier(0.16, 1, 0.3, 1)` (a soft expo-out — decisive start, gentle settle).
- Use this exactly once per page load (the hero), and once per product-card entry into viewport on scroll. Do not apply it to every image on the page — repetition kills the effect.

### 8.2 Signature moment: the light sweep

The layer reveal is the *build*. This is the *light turning on* — the second half of the same moment, and the direct answer to "I want to see more lighting play, like an Apple reveal." Apple does this in video; here it's simulated with real-time CSS/canvas so it costs nothing to load and still works on a phone. Three things happen in sequence, immediately after the layer reveal finishes:

1. **Rim-light ignition** — the Cure-violet edge light around the object (the rim light from Section 7's photography direction) flares slightly brighter for ~200ms, then settles back to its steady, quiet level. It should read as "the light just switched on," not as a flash.
2. **Specular sweep** — a soft, angled highlight travels once across the surface of the object, left to right, over 900–1100ms, `ease-in-out`. This is the Apple-keynote move: a single continuous pass of light across a physical surface, not a looping shimmer. **Build this as a heavily blurred ellipse (not a gradient rectangle).** A linear-gradient band, even one that fades to transparent at its own edges, still reads as a moving box the moment you look for it — the fix is an elliptical radial falloff *combined with* a large blur (roughly 20px at this scale) applied to the whole element, so there's no straight edge anywhere for the eye to catch, in any direction.
3. **Ambient glow** — a large, very soft, blurred glow in Cure violet (roughly 15–30% opacity, well outside the object's silhouette) breathes gently behind the whole scene — a slow 4s ease-in-out pulse, barely noticeable, giving the sense there's a real light source alive in the room rather than a static graphic.

Rules that keep this from sliding into "generic glowy AI website":
- This sequence runs **once**, right after the layer reveal, not on a loop. If someone stares at the hero for ten seconds, it should go still — a lit room, not a disco.
- It happens on the hero product only. Product-grid thumbnails get the layer reveal (8.1) but not the full light sequence — the sweep is reserved for the one moment per page that deserves it.
- The glow and sweep are the **one deliberate exception** to "no gradients" (Section 14) — everywhere else (buttons, cards, backgrounds, badges) stays flat. Gradients exist here because they're standing in for an actual light source, not decorating a surface.

### 8.3 Hover (product cards)

- Card lifts 4px, a soft shadow appears (this is one of the only places a shadow is allowed — everywhere else stays flat).
- A thin mono-type spec strip slides up from the bottom edge of the card: material, print time, price — e.g. `PLA · 3H 40M · $38`. This is the "operating the machine" detail showing up even in the curated Shop.
- Duration: 180ms ease-out. No bounce, no overshoot — this brand doesn't do playful spring physics.
- On product-detail pages (not thumbnail grids), hovering the object itself replays a short, contained version of the specular sweep (8.2, step 2) — this is the one place the light sweep is allowed to repeat on demand, since it's user-triggered rather than ambient.

### 8.4 Scroll

- Hero product renders get a subtle parallax (0.2–0.3 factor) against the background — enough to feel dimensional, not enough to feel like a gimmick.
- Section headers behave like a sticky "print queue" label in mono uppercase as you scroll past — a small structural device that reinforces the machine-readout personality without adding decoration.

### 8.5 Cursor (Studio/configurator pages only)

A small crosshair/reticle replaces the default cursor on the custom-print configurator — a nod to CAD and slicer software. Keep the default system cursor everywhere else; this is a Studio-only detail, not a site-wide affectation.

### 8.6 Page transitions

600ms crossfade between routes. No slides, no wipes — the brand's "big" motion budget is already spent on the layer reveal and the light sweep; page transitions should stay calm.

---

## 9. Iconography & graphic devices

- **Line icons only** — 1.5px stroke, no fill, 24px grid, rounded end caps to match the mark's flat-but-not-harsh feel.
- Icon vocabulary drawn from the actual tools of the trade: nozzle, build plate, calipers, layer stack, spool. Avoid generic e-commerce icon sets (shopping bags, generic gears, stock "3D cube" clipart) — those read as templated immediately.
- **Layer-line dividers:** instead of a plain horizontal rule between sections, use 2–3 thin stacked lines of slightly different lengths (echoing the logo mark) as a section break. Use this device, not a numbered "01/02/03" system — the content on this site isn't a sequence, so don't imply one.
- Icons are functional wayfinding only. If an icon isn't helping someone navigate or understand a spec, cut it.

---

## 10. Web UX patterns: Shop vs. Studio

### 10.1 Shop (pre-made objects)

- A grid, but a generous one — see Section 6's negative-space rules. This is a small gallery, not a warehouse catalog; resist the urge to cram more products above the fold.
- Cards use the layer-reveal on scroll-into-view and the mono spec-strip hover from Section 8.
- Badges (mono label style): `in stock`, `ships in 48h`, `last one` (Hot Amber, sparingly).

### 10.2 Studio (custom/commissioned prints)

- A step-based configurator, not a form. Each step (material → size → finish → quantity) fills one focused screen.
- A persistent live readout panel, styled like a machine control panel: mono type, Void Black background, updating in real time as the person adjusts parameters — `EST. PRINT TIME: 4H 10M`, `MATERIAL: PETG`, `EST. COST: $64`. This is the literal "operating the machine yourself" feeling the brand strategy calls for.
- The crosshair cursor (8.4) lives here.
- No product grid aesthetic here at all — Studio should never look like it was assembled from the same template as Shop. That contrast is the point.

---

## 11. Voice & tone

Precise, calm, a little dry. This brand talks like the person who actually runs the printer, not a marketing department describing them.

- Plain declarative sentences. No "revolutionary," "game-changing," "elevate your space."
- Label things the way an engineer would: `0.2mm layer height`, not "ultra-fine detail." `PETG, UV-stable`, not "premium weatherproof material."
- Buttons and CTAs: verb first, sentence case, no punctuation — `Configure your print`, `Add to cart`, `View spec sheet`.
- Errors and empty states are plain and direct, never apologetic or falsely cheerful: `That size isn't available in this material.` not `Oops! Something went wrong!`
- The one place warmth shows up explicitly is the tagline and the about/story copy — everywhere transactional stays dry.

---

## 12. Physical & storefront applications

- **Signage:** edge-lit acrylic in Void Black, with Bone or Cure-violet backlit lettering — no printed vinyl banners, no illuminated plastic lightbox signs.
- **Window display:** one hero object per week, on a dark plinth, lit by a single spotlight from a fixed angle — literally the photography direction in Section 7, staged physically. Rotate weekly to create a reason to walk by again; never display more than one "hero" object in the window at a time.
- **In-store shelving:** deliberately under-stocked. Three to five objects visible per shelf section maximum, each with real space around it — the negative-space rule applies physically, not just on-screen.
- **Business cards / print collateral:** Void Black stock, Bone ink, mark only (no wordmark) embossed rather than printed where budget allows — texture over color.

---

## 13. Applications gallery — quick reference

| Application | Background | Type | Notes |
|---|---|---|---|
| Homepage hero | Void Black | Display 3XL, Neue Machina | Layer-reveal on load, then rim-ignition + light sweep (8.2), product at 45% width max, off-center |
| Product card | Graphite | Display M + mono spec strip | Hover reveals spec strip, 4px lift |
| Studio configurator | Void Black | Mono throughout live panel | Crosshair cursor, real-time readouts |
| Packaging exterior | Void Black | Mark only | No wordmark, embossed if possible |
| Packaging interior | Bone | Wordmark, Body M care copy | The one place the palette flips light |
| Social template | 6:5 product frame | Mono caption strip | Product frame ratio from Section 6.3, always |
| Storefront sign | Edge-lit Void Black acrylic | Wordmark or mark | Bone or Cure-violet backlight only |

---

## 14. Guardrails — do / don't

**Do:**
- Let negative space carry weight — an empty two-thirds of a hero section is a choice, not a gap to fill.
- Keep every number on the site in mono type.
- Let Studio and Shop look meaningfully different from each other.
- Reserve Cure violet and Hot amber for the one thing per screen that needs attention.

**Don't:**
- Add a gradient to a structural surface — buttons, cards, backgrounds, badges, nav bars are flat fields, on-screen and in print, no exceptions. The **only** gradient/glow allowed anywhere in the system is the hero light sweep and ambient glow in Section 8.2, because those are standing in for an actual light source, not decorating a surface. If you're not sure whether a gradient qualifies, it doesn't.
- Use stock e-commerce iconography (cart badges, generic 3D cube clip art, gear icons).
- Center-crop hero product photography.
- Let Hot amber become a decorative color — it means scarcity/urgency and nothing else.
- Add a numbered step system (01 / 02 / 03) to content that isn't a genuine sequence.
- Use more than one Display 3XL/2XL headline per page.

---

## 15. Asset & file naming

Keep exports predictable for whoever builds this next:

```
printaway-logo-mark.svg
printaway-logo-wordmark.svg
printaway-logo-lockup-horizontal.svg
printaway-color-tokens.json        (the six hex values, named per Section 4)
printaway-type-scale.json          (Section 5.1, as design tokens)
printaway-product-frame-6x5.png    (crop guide template, Section 6.3)
```

---

*Next steps once this system is approved: font licensing (Neue Machina, JetBrains Mono is open-source and free, General Sans is free via Fontshare), a short photography test shoot to validate the lighting direction against real inventory, and a component-level UI kit built from Sections 6, 8, and 10.*
