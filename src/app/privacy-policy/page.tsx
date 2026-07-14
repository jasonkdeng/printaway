import Link from "next/link";

export const metadata = { title: "Privacy policy" };

const sections = [
  {
    heading: "Information we collect",
    content: "Printaway may collect your name, email address, phone number, company, uploaded CAD files or images, project details, shipping address where provided, and technical website data.",
  },
  {
    heading: "Why we use it",
    content: "We use this information to review requests, prepare and communicate quotes, manufacture and ship orders, provide support, prevent fraud, and meet legal obligations.",
  },
  {
    heading: "Service providers",
    content: "Printaway uses Vercel for hosting and analytics and Supabase for its production database. The storage workflow must be limited to approved Supabase services before customer uploads are enabled. Payment and shipping providers will be identified before they process personal information.",
  },
  {
    heading: "Files and retention",
    content: "Uploaded designs and project files are treated as confidential. Information and files associated with an order are retained for three days after order completion or cancellation. Quote requests that do not become orders are retained for four days.",
  },
  {
    heading: "Your choices",
    content: "You may request access to, correction of, or deletion of your personal information, or withdraw consent, by contacting printaway@gmail.com. Withdrawal may limit Printaway’s ability to continue reviewing, quoting, or fulfilling a request.",
  },
  {
    heading: "Cookies and analytics",
    content: "Printaway will identify any cookies, analytics, or advertising tools in use before they are enabled. Advertising tools are not configured in the current application scaffold.",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <article className="mx-auto max-w-3xl px-3 py-12 sm:px-6 lg:px-12">
      <p className="font-mono text-sm tracking-[0.16em] text-aluminum">PRIVACY POLICY / CONFIGURATION DRAFT</p>
      <h1 className="mt-3 font-display text-5xl leading-[0.95] tracking-[-0.05em] text-bone sm:text-6xl">Privacy and personal information</h1>
      <p className="mt-5 text-lg leading-8 text-aluminum">This policy draft records the information and consent boundaries confirmed for Printaway. It is not a published policy until all active service-provider disclosures are approved.</p>
      <div className="mt-10 flex flex-col gap-8">
        {sections.map((section) => (
          <section key={section.heading}>
            <h2 className="font-display text-2xl tracking-[-0.04em] text-bone">{section.heading}</h2>
            <p className="mt-2 leading-7 text-aluminum">{section.content}</p>
          </section>
        ))}
      </div>
      <p className="mt-10 border-t border-graphite pt-5 font-mono text-sm leading-6 text-aluminum">Canadian privacy obligations may include the PIPEDA fair information principles. This draft requires legal and business review before publication.</p>
      <Link className="mt-6 inline-block font-mono text-sm text-bone underline decoration-cure-violet underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cure-violet" href="/">Return home</Link>
    </article>
  );
}
