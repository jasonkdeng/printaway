import "server-only";

import { type InitialCatalogProduct, initialCatalogProducts } from "@/features/shop/domain/initial-catalog";
import { SquareInventoryRepository } from "@/server/adapters/square-inventory";
import { getOptionalSquareServerConfigFromEnvironment } from "@/server/config/square";

import { getOptionalSquareVariationIdsFromEnvironment } from "./square-variation-config";

function availabilityForQuantity(quantity: number): InitialCatalogProduct["availability"] {
  if (quantity < 1) return { kind: "unavailable", label: "Sold out" };
  if (quantity <= 5) return { kind: "in_stock", quantity, label: `Only ${quantity} Left` as const };
  return { kind: "in_stock", quantity, label: "In stock" };
}

export async function listCatalogWithAuthoritativeInventory(): Promise<readonly InitialCatalogProduct[]> {
  const config = getOptionalSquareServerConfigFromEnvironment();
  const variations = getOptionalSquareVariationIdsFromEnvironment();
  if (!config || !variations) return initialCatalogProducts;

  const repository = new SquareInventoryRepository(config);
  return Promise.all(initialCatalogProducts.map(async (product) => {
    const level = await repository.getCurrentLevel({ variationId: variations[product.slug] });
    return { ...product, availability: availabilityForQuantity(level?.quantity ?? 0) };
  }));
}
