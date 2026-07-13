import { RoutePlaceholder } from "@/components/ui/route-placeholder";

export const metadata = { title: "Policy" };

export default async function PolicyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return <RoutePlaceholder eyebrow="POLICY" title="Policy content" description={`The “${slug}” policy has not been supplied for publication.`} />;
}
