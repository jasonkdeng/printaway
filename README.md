# Printaway

## Current status

The repository contains the strict Next.js App Router scaffold, shared design tokens, staged routes, CAD money handling, the approved Studio contact/consent configuration, initial Shop fixtures, and server-only Supabase and Square configuration boundaries. Production media, live Square mappings, authentication, cart persistence, checkout, and quote submission remain staged.

See [the implementation plan](docs/IMPLEMENTATION_PLAN.md) for the staged path from the scaffold to a release-ready application.

Printaway is a product-first 3D-printing storefront for small-batch objects and custom commissions. **Shop** presents ready-to-buy pieces as a restrained gallery. **Studio** guides a customer through a six-step reference, material, size, finish, quantity, and review flow while a machine-style panel shows provisional production and price estimates.

The repository is currently in its documentation-first setup phase. The application has not been scaffolded yet.

## Direction

The approved application stack is:

- Next.js App Router
- TypeScript in strict mode
- Tailwind CSS
- React Three Fiber and Drei
- Zod
- Vitest and Testing Library
- Playwright

Supabase is the approved production database and private upload storage boundary; Square is the approved payment and Shop-inventory provider; Vercel is the hosting and analytics provider. Google OAuth is approved for account-backed cart persistence. Repository-owned adapters keep those choices out of components and domain logic.

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

`DESIGN.md` is the design authority. The showcase is a non-canonical illustrative companion, not production application code or a token source.

## Planned experience

### Shop

A spacious catalog of pre-made prints with strong product imagery, useful technical specifications, honest availability, and direct purchase actions.

### Studio

A focused configurator for custom work. Each step asks for one meaningful decision and updates a persistent readout. Estimates remain clearly provisional until validated by the server or converted into a quote.

## Planned development workflow

After the Next.js scaffold and `package.json` exist, contributors will use:

```bash
npm install
npm run dev
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run build
```

These commands define the required script interface for the future scaffold; they are not available in the current documentation-only repository.

## Status

The design system, product boundaries, architecture, content rules, asset pipeline, and quality expectations are documented. The next development phase is the application scaffold and foundational design tokens.
