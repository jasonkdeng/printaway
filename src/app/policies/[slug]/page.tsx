import Link from "next/link";
import { notFound } from "next/navigation";

const policies = {
  shipping: {
    title: "Shipping and pickup",
    sections: [
      "Shipping is available to postal codes beginning with N2L, L3R, or M4Y. Shipping costs CAD $5.00 when the merchandise subtotal is below CAD $30.00 and is free when the merchandise subtotal is CAD $30.00 or more. Finish surcharges count toward the merchandise subtotal.",
      "Pickup is available at Engineering 7 First Floor C&D, 200 University Avenue West in Waterloo; outside TD Bank at Pacific Mall, 4300 Steeles Avenue East in Markham; and Wellesley Station Neo Coffee Bar, 12 Gloucester Street in Toronto. These are pickup points, not Square business locations.",
      "Delivery is expected within seven calendar days after successful payment. Printaway will communicate pickup coordination separately. Original shipping charges are not refundable.",
    ],
  },
  returns: {
    title: "Refunds",
    sections: [
      "A refund may be requested within seven calendar days after delivery or pickup. An item may have been used, but it must be returned undamaged.",
      "Custom prints are not refundable. Original shipping charges are not refundable.",
      "Contact printaway@gmail.com with the order reference and a description of the request.",
    ],
  },
  cancellation: {
    title: "Cancellations",
    sections: [
      "A Shop order may be cancelled within 24 hours after successful payment.",
      "A custom-print request may be cancelled within 24 hours after the quote request is submitted. A custom-print cancellation must occur before billing.",
      "Contact printaway@gmail.com with the order or quote reference to request cancellation.",
    ],
  },
} as const;

export const metadata = { title: "Policy" };

export default async function PolicyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const policy = policies[slug as keyof typeof policies];
  if (!policy) notFound();

  return (
    <article className="mx-auto max-w-3xl px-3 py-12 sm:px-6 lg:px-12">
      <p className="font-mono text-sm tracking-[0.16em] text-aluminum">{"// Policy"}</p>
      <h1 className="pa-page-title mt-3">{policy.title}</h1>
      <div className="mt-8 space-y-5">
        {policy.sections.map((section) => <p className="leading-7 text-aluminum" key={section}>{section}</p>)}
      </div>
      <Link className="mt-8 inline-block font-mono text-sm text-bone underline decoration-cure-violet underline-offset-4" href="/cart">Return to cart</Link>
    </article>
  );
}
