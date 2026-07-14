import Link from "next/link";

import { formatMoney } from "@/lib/currency/money";
import { listInitialCatalogMaterials } from "@/features/shop/domain/catalog";
import { listCatalogWithAuthoritativeInventory } from "@/features/shop/server/catalog-with-inventory";

import styles from "./shop.module.css";

export const metadata = { title: "Shop" };

type SearchParams = Record<string, string | string[] | undefined>;

function readMaterial(searchParams: SearchParams): string | undefined {
  const material = searchParams.material;
  return typeof material === "string" ? material : undefined;
}

function readAvailability(searchParams: SearchParams): "available" | undefined {
  return searchParams.availability === "available" ? "available" : undefined;
}

export default async function ShopPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const material = readMaterial(await searchParams);
  const availability = readAvailability(await searchParams);
  const materials = listInitialCatalogMaterials();
  const products = (await listCatalogWithAuthoritativeInventory()).filter((product) =>
    (!material || product.material === material) && (!availability || product.availability.kind === "in_stock"),
  );

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <p className={styles.label}>{"// Shop"}</p>
        <h1>Objects made in small runs.</h1>
        <p>Initial product fixtures use provisional CAD pricing. Product media, dimensions, finishes, and inventory are still being documented.</p>
      </header>
      <form className={styles.filters} action="/shop">
        <label htmlFor="material">Material</label>
        <select defaultValue={material ?? ""} id="material" name="material">
          <option value="">All materials</option>
          {materials.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <label htmlFor="availability">Availability</label>
        <select defaultValue={availability ?? ""} id="availability" name="availability">
          <option value="">All availability</option>
          <option value="available">Available now</option>
        </select>
        <button type="submit">Apply filter</button>
        {material ? <Link href="/shop">Clear filter</Link> : null}
      </form>
      {products.length ? (
        <ul className={styles.grid} aria-label="Initial product catalog">
          {products.map((product) => (
            <li className={styles.card} key={product.id}>
              <div aria-label="Temporary media placeholder pending approved product image" className={styles.media}>MEDIA PENDING</div>
              <div className={styles.cardBody}>
                <h2><Link href={`/shop/${product.slug}`}>{product.name}</Link></h2>
                <p>{product.material} · {product.weightGrams} g · {product.dimensionsMm.length} × {product.dimensionsMm.width} × {product.dimensionsMm.height} mm</p>
                <p className={styles.price}>Provisional price: {formatMoney(product.provisionalPrice)}</p>
                <p className={product.availability.kind === "unavailable" || (product.availability.kind === "in_stock" && product.availability.quantity <= 5) ? styles.unavailable : styles.inventoryNote}>{product.availability.label}</p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <section className={styles.empty} aria-live="polite">
          <h2>No objects match these filters.</h2>
          <p>All current products are sold out or do not match these filters.</p>
          <Link href="/shop">Clear filter</Link>
        </section>
      )}
    </section>
  );
}
