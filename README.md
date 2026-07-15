# Printaway

## Current status

Printaway is a product-first 3D-printing storefront for small-batch objects and custom commissions. **Shop** presents ready-to-buy pieces as a restrained gallery. **Studio** guides a customer through Reference, Material, Size, Finish, Quantity, then Review and submit in a focused machine-console interface.

The repository currently includes:

- a strict Next.js App Router application and shared design-token system;
- CAD money handling and approved contact, consent, and reference-file validation;
- a Square-backed Shop inventory boundary, product-detail purchasing, and a session-scoped cart;
- the Stage 4A Studio interactive foundation with in-memory draft state, step validation, a manual-review readout, and a disabled submission state;
- server-only Supabase and Square configuration boundaries;
- Vitest, Testing Library, and Playwright coverage for the implemented journeys.

Production product media and copy, Google-backed cart persistence, Square checkout, Studio file uploads, compatibility rules, estimates, and quote submission remain staged. Studio currently selects and validates reference metadata locally; it does not upload files, calculate estimates, persist contact data, or send quote requests.

See [the implementation plan](docs/IMPLEMENTATION_PLAN.md) for the staged path to release readiness.

## Direction

The application uses:

- Next.js App Router;
- TypeScript in strict mode;
- Tailwind CSS backed by CSS custom properties;
- React Three Fiber and Drei for justified 3D scenes;
- Zod at untrusted boundaries;
- Vitest and Testing Library;
- Playwright.

Supabase is the approved production database and private-upload storage boundary. Square is the approved payment and Shop-inventory provider. Vercel is the hosting and analytics provider, and Google OAuth is approved for future account-backed cart persistence. Repository-owned interfaces keep provider types outside components and domain logic.

## Project references

Read these before implementation:

- [Agent instructions](AGENTS.md)
- [Brand and design system](DESIGN.md)
- [Illustrative brand showcase](brand-showcase.html)
- [Product specification](docs/PRODUCT_SPEC.md)
- [Application architecture](docs/ARCHITECTURE.md)
- [Content guide](docs/CONTENT_GUIDE.md)
- [3D asset guide](docs/ASSET_GUIDE.md)
- [Quality gates](docs/QUALITY.md)

`DESIGN.md` is the visual authority. The showcase is a non-canonical illustrative companion, not production application code or a token source.

## Implemented experiences

### Shop

A restrained catalog and product-detail flow with URL-backed material and availability filters, authoritative Square inventory presentation, accessible finish/colour/quantity controls, add-to-cart feedback, and a session-scoped cart. Media, product summaries, and limitations remain approval-pending placeholders.

### Studio

A six-step in-memory configurator with local reference validation, PLA/ABS material preferences, positive millimetre dimensions, Default/Glossy finish preferences, whole-number quantity, approved contact/consent validation, and a persistent manual-review readout. Unknown estimates display an em dash. Files are not uploaded and quote submission is visibly unavailable.

## Development workflow

Install dependencies, then use the repository quality interfaces:

```bash
npm install
npm run dev
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run build
```

Do not describe provider-backed workflows as complete unless their current success and recovery paths have been verified.
