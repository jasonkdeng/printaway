import "server-only";

import { type InitialCatalogProduct, initialCatalogProducts } from "@/features/shop/domain/initial-catalog";
import { SquareInventoryConfigurationError, SquareInventoryRepository } from "@/server/adapters/square-inventory";
import { getOptionalSquareServerConfigFromEnvironment } from "@/server/config/square";

import { getOptionalSquareVariationIdsFromEnvironment } from "./square-variation-config";

function availabilityForQuantity(quantity: number): InitialCatalogProduct["availability"] {
  if (quantity < 1) return { kind: "unavailable", label: "Sold out" };
  if (quantity <= 5) return { kind: "in_stock", quantity, label: `Only ${quantity} Left` as const };
  return { kind: "in_stock", quantity, label: "In stock" };
}

function unavailableAvailability(): InitialCatalogProduct["availability"] {
  return { kind: "unavailable", label: "Sold out" };
}

function reportInventoryConfigurationFailure(product: InitialCatalogProduct, error: SquareInventoryConfigurationError): void {
  console.error("Square inventory configuration failed", {
    productSlug: product.slug,
    code: error.code,
    message: "Verify that the Square access token, location ID, and variation ID belong to the same Square environment and merchant.",
  });
}

export async function listCatalogWithAuthoritativeInventory(): Promise<readonly InitialCatalogProduct[]> {
  const config = getOptionalSquareServerConfigFromEnvironment();
  const variations = getOptionalSquareVariationIdsFromEnvironment();
  if (!config || !variations) return initialCatalogProducts;

  const repository = new SquareInventoryRepository(config);
  return Promise.all(initialCatalogProducts.map(async (product) => {
    try {
      const level = await repository.getCurrentLevel({ variationId: variations[product.slug] });
      return { ...product, availability: availabilityForQuantity(level?.quantity ?? 0) };
    } catch (error) {
      if (error instanceof SquareInventoryConfigurationError) {
        reportInventoryConfigurationFailure(product, error);
        return { ...product, availability: unavailableAvailability() };
      }
      throw error;
    }
  }));
}
