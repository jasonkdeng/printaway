# Printaway Decisions

This record holds confirmed implementation decisions. It does not create a business policy, select an unconfirmed provider, or approve production content.

## 2026-07-13 — Launch currency

**Decision:** Printaway launches in Canadian dollars (`CAD`).

**Implementation:** Money is represented as non-negative integer minor units with a `CAD` currency code at the application boundary. Formatting uses the `en-CA` locale. No other currency is accepted by the current schema.

**Not decided:** tax treatment, price display conventions beyond CAD, and a payment provider remain separate decisions.

## Pending business decisions

- Studio quote requests require a name and email. Phone and company are optional. Quote requests require explicit privacy consent. The approved response expectation is that Printaway typically provides a quote or reaches out within 48 hours, although complex projects may take longer.
- A privacy policy configuration draft is available at `/privacy-policy`. Information and files associated with an order are retained for three days after order completion or cancellation. The retention approach for quote requests that do not become orders still requires approval before quote submission is enabled.
- approved catalog, material, finish, inventory, price, media, and policy content;
- permitted upload types, byte limits, retention, deletion, and review workflow;
- Supabase is the approved production database. Vercel is the hosting and analytics provider. Supabase services may be used for storage only after the upload access model is approved;
- whether Stripe is the payment and checkout provider, including the payment flow and tax treatment.
