import { initialCatalogProducts, type InitialCatalogProduct } from "./initial-catalog";

export function listInitialCatalogProducts(material?: string, availability?: "available"): readonly InitialCatalogProduct[] {
  const products: readonly InitialCatalogProduct[] = initialCatalogProducts;
  return products.filter((product) => (!material || product.material === material) && (!availability || product.availability.kind === "in_stock"));
}

export function getInitialCatalogProduct(slug: string): InitialCatalogProduct | null {
  return initialCatalogProducts.find((product) => product.slug === slug) ?? null;
}

export function listInitialCatalogMaterials(): readonly InitialCatalogProduct["material"][] {
  return [...new Set(initialCatalogProducts.map((product) => product.material))];
}
