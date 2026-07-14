import { z } from "zod";

export const privacyPolicyPath = "/privacy-policy";

const requiredTextSchema = z.string().trim().min(1).max(200);
const requiredEmailSchema = z.string().trim().email();
const optionalTextSchema = z.string().trim().max(200).transform((value) => value || undefined).optional();
export const privacyConsentCopy = "I consent to Printaway collecting, using, and storing the personal information and files I submit, including my name, contact information, project details, uploaded designs, and shipping information, where provided, solely to review my request, prepare and communicate a quote, provide customer support, and fulfill an order if placed. My information may be processed by service providers used for website hosting, form submissions, email, file storage, payment, and shipping. I understand that I can withdraw my consent or request access to or correction/deletion of my information by contacting printaway@gmail.com. I have read and agree to the Privacy Policy.";

export const quoteContactSchema = z.object({
  name: requiredTextSchema,
  email: requiredEmailSchema,
  phone: optionalTextSchema,
  company: optionalTextSchema,
});

export const quoteConsentSchema = z.object({
  privacyConsent: z.literal(true),
});

export type QuoteContact = z.infer<typeof quoteContactSchema>;
export type QuoteConsent = z.infer<typeof quoteConsentSchema>;
