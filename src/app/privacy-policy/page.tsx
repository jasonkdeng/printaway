import Link from "next/link";

export const metadata = { title: "Privacy policy" };

const sections = [
  {
    heading: "Information we collect",
    content: "Printaway may collect your name, email address, phone number, company, uploaded CAD files or images, project details, shipping address where provided, and technical website data such as browser, device, approximate location, and interaction information.",
  },
  {
    heading: "Why we use it",
    content: "We use this information to review requests, prepare and communicate quotes, manufacture and ship orders, provide support, prevent fraud, and meet legal obligations.",
  },
  {
    heading: "Service providers",
    content: "Printaway uses Vercel for website hosting and analytics, Supabase for the production database and private file storage, and Square for payment processing. A shipping carrier may process the shipping information needed for an order; the selected carrier will be identified before shipping information is shared. Service providers may process information only to provide the service they support for Printaway.",
  },
  {
    heading: "Files and retention",
    content: "Uploaded CAD files, images, and project details are treated as confidential and are not published. Information and files associated with an order are retained until the order is completed or cancelled, then deleted after three days. Quote requests that do not become orders are retained for four days. We may retain a limited record when required by law or needed to resolve an active dispute.",
  },
  {
    heading: "Your choices",
    content: "You may request access to, correction of, or deletion of your personal information, or withdraw consent, by contacting printaway@gmail.com. We may verify your identity before fulfilling a request. Withdrawal may limit Printaway's ability to continue reviewing, quoting, or fulfilling a request; it does not affect processing already completed with consent.",
  },
  {
    heading: "Cookies and analytics",
    content: "Printaway uses necessary session cookies for authentication and account-backed cart behavior when those features are enabled. Vercel Analytics provides technical website analytics. Supabase does not receive browser analytics data through this site. No advertising or retargeting tools are configured.",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <article className="mx-auto max-w-3xl px-3 py-12 sm:px-6 lg:px-12">
      <p className="font-mono text-sm tracking-[0.16em] text-aluminum">PRIVACY POLICY / EFFECTIVE JULY 20, 2026</p>
      <h1 className="mt-3 font-display text-5xl leading-[0.95] tracking-[-0.05em] text-bone sm:text-6xl">Privacy and personal information</h1>
      <p className="mt-5 text-lg leading-8 text-aluminum">This policy explains how Printaway collects, uses, stores, and discloses personal information in connection with commercial website, quoting, manufacturing, and order activities.</p>
      <div className="mt-10 flex flex-col gap-8">
        {sections.map((section) => (
          <section key={section.heading}>
            <h2 className="font-display text-2xl tracking-[-0.04em] text-bone">{section.heading}</h2>
            <p className="mt-2 leading-7 text-aluminum">{section.content}</p>
          </section>
        ))}
      </div>
      <p className="mt-10 border-t border-graphite pt-5 font-mono text-sm leading-6 text-aluminum">Printaway operates in Canada and follows applicable privacy obligations, including the federal <a className="text-bone underline decoration-cure-violet underline-offset-4" href="https://www.priv.gc.ca/en/privacy-topics/privacy-laws-in-canada/the-personal-information-protection-and-electronic-documents-act-pipeda/pipeda_brief/">Personal Information Protection and Electronic Documents Act (PIPEDA)</a> principles of meaningful consent, limited collection, appropriate safeguards, openness, access, correction, and accountability.</p>
      <Link className="mt-6 inline-block font-mono text-sm text-bone underline decoration-cure-violet underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cure-violet" href="/">Return home</Link>
    </article>
  );
}
