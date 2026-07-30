import Link from "next/link";
import { notFound } from "next/navigation";

import { listCatalogWithAuthoritativeInventory } from "@/features/shop/server/catalog-with-inventory";
import { PurchasePanel } from "@/features/shop/ui/purchase-panel";
import { formatMoney } from "@/lib/currency/money";

import styles from "../shop.module.css";

export const metadata = { title: "Object" };

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = (await listCatalogWithAuthoritativeInventory()).find((item) => item.slug === slug);

  if (!product) {
    notFound();
  }

  return (
    <article className={styles.detail}>
      <Link className={styles.back} href="/shop">Back to Shop</Link>
      <div aria-label="Temporary media placeholder pending approved product image" className={styles.detailMedia}>MEDIA PENDING</div>
      <div className={styles.detailContent}>
        <p className={styles.label}>{"// Shop / Object"}</p>
        <h1>{product.name}</h1>
        <p className={styles.detailNote}>{product.summary}</p>
        <dl className={styles.specifications}>
          <div><dt>Material</dt><dd><Link aria-label={`Read ${product.material} material limits`} href={`/materials#${product.material.toLowerCase()}`}>{product.material}</Link></dd></div>
          <div><dt>Weight</dt><dd>{product.weightGrams} g</dd></div>
          <div><dt>Dimensions</dt><dd>{product.dimensionsMm.length} × {product.dimensionsMm.width} × {product.dimensionsMm.height} mm</dd></div>
          <div><dt>Base price</dt><dd>{formatMoney(product.basePrice)}</dd></div>
          <div><dt>Print Finish</dt><dd>{product.finishOptions.map((option) => option.surcharge.amountMinor ? `${option.name} +${formatMoney(option.surcharge)}` : `${option.name} included`).join(" · ")}</dd></div>
          <div><dt>Availability</dt><dd>{product.availability.label}</dd></div>
        </dl>
        {product.availability.kind === "in_stock" ? (
          <PurchasePanel
            colours={product.colours}
            finishOptions={product.finishOptions}
            maximumQuantity={product.availability.quantity}
            name={product.name}
            productId={product.id}
            basePrice={product.basePrice}
          />
        ) : <p className={styles.detailNote}>This product is unavailable. Choose another object or return to Shop.</p>}
        <section aria-labelledby="limitations-heading" className={styles.limitations}>
          <h2 id="limitations-heading">Limitations</h2>
          <ul>
            {product.limitations.map((limitation) => <li key={limitation}>{limitation}</li>)}
          </ul>
        </section>
      </div>
    </article>
  );
}
