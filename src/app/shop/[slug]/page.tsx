import { RoutePlaceholder } from "@/components/ui/route-placeholder";

export const metadata = { title: "Object" };

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return <RoutePlaceholder eyebrow="SHOP / OBJECT" title="Object detail" description={`Product data for “${slug}” has not been configured.`} />;
}
