# Printaway Decisions

This record holds confirmed implementation decisions. It does not create a business policy, select an unconfirmed provider, or approve production content.

## 2026-07-13 - Launch currency

**Decision:** Printaway launches in Canadian dollars (`CAD`).

**Implementation:** Money is represented as non-negative integer minor units with a `CAD` currency code at the application boundary. Formatting uses the `en-CA` locale. No other currency is accepted by the current schema.

**Not decided:** production tax treatment and price-display conventions beyond CAD remain separate decisions. Square Sandbox checkout intentionally has no taxes.

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
- The privacy policy is published at `/privacy-policy`. Custom-project information and files associated with an order are retained for three days after order completion or cancellation. Quote requests that do not become orders are retained for four days. Limited Shop checkout and payment references are retained for ten days after delivery or pickup.
- Initial catalog fixtures are Monitor Riser (PLA, 100 g, 350 x 250 x 120 mm, CAD $12.00), Desk Tray (PLA, 50 g, 120 x 180 x 100 mm, CAD $3.00), Coat Hanger (ABS, 15 g, 400 x 10 x 150 mm, CAD $2.00), and Keycap Fidget (PLA, 10 g, 100 x 30 x 30 mm, CAD $3.00). All are currently sold out. Every Shop item defaults to the included Standard finish; the optional shared Square `Print Finish` modifier adds CAD $1.00 for Matte or CAD $2.00 for Glossy. The approved Bambu Lab colour basis is white, black, gray, dark green, tan, latte brown, and red. Product summaries and limitations are approved; media remains placeholder-only until Jason Deng supplies owned photographs or renders. Square catalog prices and the shared modifier options must be updated and verified against these approved amounts before checkout is enabled.
- Product claim provenance: the Monitor Riser has a 20 lb working-load guidance physically observed during informal testing; its design failure target is 60 lb with a 3:1 safety factor. The Coat Hanger has 10 lb working-load guidance based on calculation and informal observation. Neither is a certified rating. Current PLA objects should remain below 60°C and ABS objects below 80°C; Shop objects are for indoor use and normal printed layer/colour variation is expected. The Desk Tray is not approved for food contact. The Keycap Fidget contains small parts and is not for children under three.
- Purchasable quantity is 1-10. Shop purchasing will use account-backed cart persistence through Google OAuth and Square online checkout. The approved Google OAuth callback URLs are `https://printaway.vercel.app/api/auth/callback/google` and `https://localhost:3000/api/auth/callback/google`. Credentials remain deployment configuration and are not committed.
- Square is the approved payment provider. Square remains compatible with in-person payment, but the intended web checkout path is online. Square is the authoritative source for sellable inventory: each Shop product must map to a Square item-variation ID and display the current Square quantity rather than a copied catalog quantity. The current sold-out fixtures remain in place until those mappings and server credentials are configured.
- Each configured Square variation ID represents shared sellable inventory for its matching Shop product's listed finish and colour selections. The shared Square `Print Finish` modifier is attached to each item. Google-backed account-cart persistence and live OAuth verification are complete.
- Square hosted checkout uses server-side catalog and inventory revalidation, a unique idempotency key, Supabase order-reference persistence, and signed `payment.updated` webhooks. Matching cart lines clear only after a verified `COMPLETED` payment. The browser return URL is informational and never proves payment. Sandbox checkout has no taxes.
- Shipping is CAD $5.00 below a CAD $30.00 merchandise subtotal and free at or above that threshold. Shipping is limited to N2L, L3R, and M4Y. Pickup uses the approved Waterloo, Markham, and Toronto pickup points. Delivery is within seven calendar days after successful payment.
- Shop refunds may be requested within seven calendar days after delivery or pickup for used or unused items that remain undamaged; original shipping is non-refundable. Custom prints are non-refundable. Shop cancellation is allowed within 24 hours after successful payment; custom work may be cancelled within 24 hours after quote-request submission and before billing.
- Permitted reference uploads are `.stl`, `.png`, `.3mf`, `.sldprt`, `.step`, and `.sldasm`, up to 10 MB. Supabase Storage is approved for private uploads using server-issued, short-lived signed URLs. The deletion/review workflow remains pending.
- Supabase is the approved production database. Vercel is the hosting and analytics provider. Supabase services may be used for storage only after the upload access model is approved.

## Pending business and configuration inputs

- Production tax configuration and live Square checkout verification.
- Application of the checkout-order migration and a successful signed sandbox webhook journey.
- Approved production media and provenance manifests.

## Delivery note

The Stage 2 and Stage 4 Supabase migrations were applied to project `kczuhxsclbephazisqoa` on 2026-07-20. The private `reference-uploads` bucket is present and non-public. The follow-up rate-limit privilege migration restricts the SECURITY DEFINER function to the server role. The account-cart migration was applied and Google OAuth was verified before the Stage 5 checkout implementation. The checkout-order migration remains ready for one-time SQL Editor application.

## 2026-07-27 - Future catalog administration

**Decision:** Full catalog administration is a future stage, not part of the current account-cart, Studio, or checkout work.

**Direction:** A future admin surface may manage product content, media metadata, prices, Square mappings, and availability. Square remains authoritative for sellable inventory and checkout price. No admin route, role model, dashboard, or provider write path is added before that dedicated stage.
