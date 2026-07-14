# Printaway 3D Asset Guide

## Purpose

Printaway's product media should make real objects easier to understand. This guide defines how models and hero renders are authored outside the web application, prepared for delivery, and validated before publication.

The website may render an approved asset. It must not invent production geometry in React Three Fiber.

## Asset roles

Use the smallest asset that communicates the decision:

- **Product still:** default media for every product and the primary fallback.
- **Poster image:** the still shown while a model loads or when WebGL is unavailable.
- **Interactive model:** optional, only when rotation or depth materially improves understanding.
- **Detail still:** close-up or underside view when a surface, join, or limitation matters.
- **Scale still:** object beside a known reference when dimensions are difficult to judge.

Every interactive model needs a poster. A product must remain understandable and purchasable with the model removed.

## Source authoring

Models may be authored in Blender, CAD, or another external 3D tool. Before export:

- model at real-world scale;
- use millimetres as the documented working unit;
- place the object origin at the intended rotation centre;
- align a consistent upright axis across the catalog;
- apply transforms;
- remove hidden construction geometry and unused collections;
- recalculate normals and remove accidental non-manifold surfaces where visible;
- keep mesh names stable and descriptive;
- name materials by product-facing role, such as `body`, `accent`, or `hardware`;
- avoid embedded cameras, lights, animation, or HDRIs unless the consuming viewer explicitly needs them;
- retain the source file and record its version in the asset manifest.

The website's lighting direction should be consistent across products. Do not bake a decorative environment into a model that will be lit by the viewer.

## Delivery format

Preferred delivery format: binary GLB.

Use:

- physically based materials;
- a predictable metallic/roughness workflow;
- only the textures needed to explain the object;
- Meshopt or Draco compression after testing visual fidelity;
- KTX2/Basis texture compression where the runtime and browser support it;
- a deterministic filename based on the product identifier and revision.

Example:

```text
public/models/terrace-vessel/terrace-vessel-r03.glb
public/images/terrace-vessel/terrace-vessel-poster-1600.avif
public/images/terrace-vessel/terrace-vessel-side-1200.webp
```

Do not commit source CAD files, personal work files, temporary exports, or duplicate uncompressed revisions to `public/models`.

## Initial budgets

Budgets are starting release gates:

| Asset | Target | Hard ceiling or review trigger |
| --- | ---: | ---: |
| Standard product GLB | 3 MB compressed | 5 MB requires documented review |
| Visible triangles | 150,000 or fewer | Above 250,000 requires documented review |
| Default texture dimension | 2048 px or smaller | Above 4096 px requires documented review |
| Product poster | 250 KB WebP/AVIF target | Above 500 KB requires review |
| Product still | 500 KB WebP/AVIF target | Above 1 MB requires review |
| Initial hero route media | Lazy-load model after useful poster | No blocking model download before first useful render |

The budgets include all mesh, material, animation, and texture data in the delivered asset. Exceptions record why the detail improves a customer decision and what fallback was tested.

## Camera and lighting

For catalog consistency:

- use a documented neutral camera and framing range;
- keep the object visible with comfortable negative space;
- avoid perspective distortion that changes perceived proportions;
- use the visual direction in `DESIGN.md`: dark void, controlled key light, subtle rim, and no decorative environment;
- reserve Cure Violet glow and the specular sweep for the deliberate hero or user-triggered product-detail moment;
- do not add gradients to cards, buttons, backgrounds, or badges;
- test Bone and Aluminum surfaces against Void Black and Graphite without clipping highlights.
- treat material colours in media as product content, not interface tokens; any overlaid text, controls, or status indicators must use the approved contrast pairings from `DESIGN.md`.

The viewer owns responsive camera adjustment. Do not export a separate model for every viewport unless the object genuinely requires a different composition.

## Naming and metadata

Each published asset has a manifest entry containing:

- product ID and slug;
- asset revision;
- source application and version;
- author or vendor;
- export date;
- scale and axis convention;
- mesh and texture counts;
- compressed file size;
- poster path;
- usage rights and license source;
- review status;
- known limitations;
- checksum when the delivery pipeline supports it.

The manifest must not include customer contact data or private upload locations.

## Web integration requirements

The application must:

- render the poster in the initial HTML or immediate loading state;
- lazy-load models below the fold;
- provide a meaningful `aria-label` and nearby product facts outside the canvas;
- keep product selection, quantity, configuration, and cart controls outside the canvas;
- handle model loading, parse, WebGL, and network failures with the same poster fallback;
- pause offscreen work and avoid continuous rendering for a static scene;
- respect `prefers-reduced-motion`;
- maintain the required interaction without rotation or depth effects;
- avoid layout shift by reserving the media aspect ratio before loading.

Use 3D only when its interaction answers a customer question. A model that simply decorates an already-clear product should remain a still image.

## QA checklist

Before an asset is accepted:

- dimensions and scale are verified against the product record;
- origin, upright axis, and rotation behaviour are correct;
- normals and visible surfaces are correct;
- materials match the approved product content;
- mesh and texture counts are within budget;
- compressed GLB is tested in supported browsers;
- poster and stills crop correctly at required widths;
- the asset loads over a throttled mobile connection;
- the poster remains useful if the model fails;
- reduced-motion mode removes non-essential motion;
- no console errors or missing textures occur;
- accessibility text names the actual product;
- license and provenance are recorded;
- the visual result agrees with `DESIGN.md`.

## Handoff structure

For each product, deliver:

```text
product-slug/
  source/
    product-slug.blend
  export/
    product-slug-r03.glb
  images/
    product-slug-poster-1600.avif
    product-slug-front-1200.webp
    product-slug-side-1200.webp
  manifest.json
  review-notes.md
```

The repository may receive only approved production files and the manifest fields needed by the application. Source files remain in the team's controlled asset workspace unless the project explicitly requires them in Git.

## Related references

- [Agent instructions](../AGENTS.md)
- [Design system](../DESIGN.md)
- [Product specification](PRODUCT_SPEC.md)
- [Architecture](ARCHITECTURE.md)
- [Content guide](CONTENT_GUIDE.md)
- [Quality gates](QUALITY.md)
