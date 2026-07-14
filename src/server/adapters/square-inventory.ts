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

type FetchLike = typeof fetch;

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

  public async getCurrentLevel(input: { variationId: string }): Promise<InventoryLevel | null> {
    const url = new URL(`/v2/inventory/${encodeURIComponent(input.variationId)}`, getSquareApiBaseUrl(this.config.SQUARE_ENVIRONMENT));
    url.searchParams.set("location_ids", this.config.SQUARE_LOCATION_ID);

    const response = await this.fetchImplementation(url, {
      headers: {
        Authorization: `Bearer ${this.config.SQUARE_ACCESS_TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error("Square inventory request failed");
    }

    const body = squareInventoryResponseSchema.parse(await response.json());
    const inStockCounts = body.counts.filter((count) => count.state === "IN_STOCK");

    if (!inStockCounts.length) {
      return null;
    }

    return {
      quantity: inStockCounts.reduce((total, count) => total + count.quantity, 0),
      observedAt: inStockCounts.reduce((latest, count) => count.calculated_at > latest ? count.calculated_at : latest, inStockCounts[0].calculated_at),
    };
  }
}
