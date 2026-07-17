# Printaway Decisions

This record holds confirmed implementation decisions. It does not create a business policy, select an unconfirmed provider, or approve production content.

## 2026-07-13 - Launch currency

**Decision:** Printaway launches in Canadian dollars (`CAD`).

**Implementation:** Money is represented as non-negative integer minor units with a `CAD` currency code at the application boundary. Formatting uses the `en-CA` locale. No other currency is accepted by the current schema.

**Not decided:** tax treatment and price display conventions beyond CAD remain separate decisions.

## 2026-07-15 - Studio interactive foundation boundary

**Decision:** Stage 4A provides an in-memory six-step Studio draft without uploading files, calculating estimates, persisting contact data, or submitting quote requests. PLA, ABS, Default, and Glossy are preference labels only; they do not establish suitability, compatibility, price, production time, or manufacturability.

**Implementation:** Reference selection validates the approved file names and 10 MB limit locally and stores only typed metadata in the Studio reducer. Dimensions accept positive numeric millimetre values, quantity accepts a positive whole number without an invented maximum, and Review uses the approved contact and privacy-consent schemas. The readout shows selected values, em dashes for unknown estimates, and `Manual review required`. Submission remains visibly disabled.

**Not decided:** machine-volume limits, material/finish compatibility, an estimate formula or service, production upload handling, and the quote repository/submission contract remain separate implementation decisions.

## 2026-07-15 - Studio production boundary

**Decision:** Studio uses a server-owned capability profile, a manual-review estimate service, private Supabase signed uploads, idempotent quote preparation/finalization, and four-day retention. Uploads remain quarantined and non-public.

**Implementation:** Submission activates only when a privacy-policy version, approved capability JSON, Supabase secret key, and rate-limit secret are configured. The client retains files only in component memory until consent and server validation pass. A daily Vercel Cron route removes private objects before expired quote records.

**Not decided:** exact printer dimensions, compatibility values, approved material claims, policy approval/version, and remote Supabase/Vercel configuration. Until supplied, the application keeps submission disabled.

## Confirmed implementation decisions

- Studio quote requests require a name and email. Phone and company are optional. Quote requests require explicit privacy consent. Printaway typically provides a quote or reaches out within 48 hours, although complex projects may take longer.
- A privacy-policy configuration draft is available at `/privacy-policy`. Information and files associated with an order are retained for three days after order completion or cancellation. Quote requests that do not become orders are retained for four days.
- Initial catalog fixtures are Monitor Riser (PLA, 100 g, 350 x 250 x 120 mm, provisional CAD $5.00), Desk Tray (PLA, 50 g, 120 x 180 x 100 mm, provisional CAD $2.50), Coat Hanger (ABS, 15 g, 400 x 2 x 150 mm, provisional CAD $1.05), and Keycap Fidget (PLA, 10 g, 100 x 30 x 30 mm, provisional CAD $1.00). All are currently sold out. Each supports Default or Glossy finish; Glossy has a provisional base surcharge of 2 cents per gram and may require a quote. The approved Bambu Lab colour basis is white, black, gray, dark green, tan, latte brown, and red. Media, product summaries, and limitations remain clearly marked placeholders pending approval.
- Purchasable quantity is 1-10. Shop purchasing will use account-backed cart persistence through Google OAuth and Square online checkout. The approved Google OAuth callback URLs are `https://printaway.vercel.app/api/auth/callback/google` and `https://localhost:3000/api/auth/callback/google`. Credentials remain deployment configuration and are not committed.
- Square is the approved payment provider. Square remains compatible with in-person payment, but the intended web checkout path is online. Square is the authoritative source for sellable inventory: each Shop product must map to a Square item-variation ID and display the current Square quantity rather than a copied catalog quantity. The current sold-out fixtures remain in place until those mappings and server credentials are configured.
- Each currently configured Square variation ID represents shared sellable inventory for its matching Shop product's listed finish and colour selections. The browser cart is session-scoped until Google-backed persistence and Square checkout are implemented.
- Permitted reference uploads are `.stl`, `.png`, `.3mf`, `.sldprt`, `.step`, and `.sldasm`, up to 10 MB. Supabase Storage is approved for private uploads using server-issued, short-lived signed URLs. The deletion/review workflow remains pending.
- Supabase is the approved production database. Vercel is the hosting and analytics provider. Supabase services may be used for storage only after the upload access model is approved.

## Pending business and configuration inputs

- Square checkout implementation details, exact product variation mappings, tax treatment, and refund/delivery terms.
- Google OAuth client credentials and the authentication secret.
- Approved production media, product summaries, and product limitations.

## Delivery note

The Stage 2 Supabase migration is committed locally at `supabase/migrations/20260714052437_stage_two_catalog_and_uploads.sql`. It has not been applied to the remote Supabase project; applying it requires authenticated project access and a review of the retention/deletion job before production data is collected.
