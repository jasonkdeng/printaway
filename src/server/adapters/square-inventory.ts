import "server-only";

import { z } from "zod";

import type { InventoryLevel, InventoryRepository } from "@/features/shop/server/inventory-repository";
import type { SquareServerConfig } from "@/server/config/square";

const squareInventoryResponseSchema = z.object({
  counts: z.array(z.object({
    quantity: z.coerce.number().finite(),
    state: z.string(),
    calculated_at: z.string().datetime(),
  })).default([]),
});

const squareCatalogVariationResponseSchema = z.object({
  object: z.object({
    id: z.string().min(1),
    type: z.literal("ITEM_VARIATION"),
  }),
});

type FetchLike = typeof fetch;

export class SquareInventoryConfigurationError extends Error {
  public constructor(public readonly code: "variation_not_found" | "access_denied") {
    super(code);
  }
}

function getSquareApiBaseUrl(environment: SquareServerConfig["SQUARE_ENVIRONMENT"]): string {
  return environment === "production"
    ? "https://connect.squareup.com"
    : "https://connect.squareupsandbox.com";
}

export class SquareInventoryRepository implements InventoryRepository {
  public constructor(
    private readonly config: SquareServerConfig,
    private readonly fetchImplementation: FetchLike = fetch,
  ) {}

  private async assertVariationExists(variationId: string): Promise<void> {
    const response = await this.fetchImplementation(
      new URL(`/v2/catalog/object/${encodeURIComponent(variationId)}`, getSquareApiBaseUrl(this.config.SQUARE_ENVIRONMENT)),
      { headers: { Authorization: `Bearer ${this.config.SQUARE_ACCESS_TOKEN}`, "Square-Version": "2026-07-15" } },
    );
    if (response.status === 404) {
      throw new SquareInventoryConfigurationError("variation_not_found");
    }
    if (response.status === 401 || response.status === 403) {
      throw new SquareInventoryConfigurationError("access_denied");
    }
    if (!response.ok) {
      throw new Error("Square catalog request failed");
    }

    const catalogObject = squareCatalogVariationResponseSchema.parse(await response.json());
    if (catalogObject.object.id !== variationId) {
      throw new SquareInventoryConfigurationError("variation_not_found");
    }
  }

  public async getCurrentLevel(input: { variationId: string }): Promise<InventoryLevel | null> {
    const url = new URL(`/v2/inventory/${encodeURIComponent(input.variationId)}`, getSquareApiBaseUrl(this.config.SQUARE_ENVIRONMENT));
    url.searchParams.set("location_ids", this.config.SQUARE_LOCATION_ID);

    const response = await this.fetchImplementation(url, {
      headers: {
        Authorization: `Bearer ${this.config.SQUARE_ACCESS_TOKEN}`,
        "Square-Version": "2026-07-15",
      },
    });

    if (response.status === 404) {
      throw new SquareInventoryConfigurationError("variation_not_found");
    }
    if (response.status === 401 || response.status === 403) {
      throw new SquareInventoryConfigurationError("access_denied");
    }
    if (!response.ok) {
      throw new Error("Square inventory request failed");
    }

    const body = squareInventoryResponseSchema.parse(await response.json());
    const inStockCounts = body.counts.filter((count) => count.state === "IN_STOCK");

    if (!inStockCounts.length) {
      await this.assertVariationExists(input.variationId);
      return null;
    }

    return {
      quantity: inStockCounts.reduce((total, count) => total + count.quantity, 0),
      observedAt: inStockCounts.reduce((latest, count) => count.calculated_at > latest ? count.calculated_at : latest, inStockCounts[0].calculated_at),
    };
  }
}
