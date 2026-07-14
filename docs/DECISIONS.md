# Printaway Decisions

This record holds confirmed implementation decisions. It does not create a business policy, select an unconfirmed provider, or approve production content.

## 2026-07-13 — Launch currency

**Decision:** Printaway launches in Canadian dollars (`CAD`).

**Implementation:** Money is represented as non-negative integer minor units with a `CAD` currency code at the application boundary. Formatting uses the `en-CA` locale. No other currency is accepted by the current schema.

**Not decided:** tax treatment, price display conventions beyond CAD, and a payment provider remain separate decisions.

## Pending business decisions

- Studio quote requests require a name and email. Phone and company are optional. Quote requests require explicit privacy consent. The approved response expectation is that Printaway typically provides a quote or reaches out within 48 hours, although complex projects may take longer.
- A privacy policy configuration draft is available at `/privacy-policy`. Information and files associated with an order are retained for three days after order completion or cancellation. Quote requests that do not become orders are retained for four days.
- Initial approved catalog fixtures: Monitor Riser (PLA, 100 g, provisional CAD $5.00); Desk Tray (PLA, 50 g, provisional CAD $2.50); Coat Hanger (ABS, 15 g, provisional CAD $1.05); Keycap Fidget (PLA, 10 g, provisional CAD $1.00). Each has temporary placeholder media until approved stills are supplied. Dimensions, finishes, inventory, and published media remain pending.
- Permitted reference uploads are `.stl`, `.png`, `.3mf`, `.sldprt`, `.step`, and `.sldasm`, up to 10 MB. Supabase Storage is approved for private uploads using server-issued, short-lived signed URLs. The deletion/review workflow remains pending.
- Supabase is the approved production database. Vercel is the hosting and analytics provider. Supabase services may be used for storage only after the upload access model is approved;
- whether Stripe is the payment and checkout provider, including the payment flow and tax treatment.

## Delivery note

The Stage 2 Supabase migration is committed locally at `supabase/migrations/20260714052437_stage_two_catalog_and_uploads.sql`. It has not been applied to the remote Supabase project; applying it requires authenticated project access and a review of the retention/deletion job before production data is collected.
