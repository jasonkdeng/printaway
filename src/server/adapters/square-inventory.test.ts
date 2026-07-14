import { describe, expect, it } from "vitest";

import { SquareInventoryRepository } from "./square-inventory";

describe("SquareInventoryRepository", () => {
  it("returns the current in-stock quantity from Square", async () => {
    const fetchImplementation = async (input: URL | RequestInfo): Promise<Response> => {
      const url = new URL(input.toString());
      expect(url.pathname).toBe("/v2/inventory/variation-id");
      expect(url.searchParams.get("location_id")).toBe("location-id");
      return Response.json({
        counts: [
          { quantity: "3", state: "IN_STOCK", calculated_at: "2026-07-14T12:00:00.000Z" },
          { quantity: "1", state: "SOLD", calculated_at: "2026-07-14T12:00:01.000Z" },
        ],
      });
    };
    const repository = new SquareInventoryRepository({
      SQUARE_APPLICATION_ID: "application-id",
      SQUARE_LOCATION_ID: "location-id",
      SQUARE_ACCESS_TOKEN: "access-token",
      SQUARE_ENVIRONMENT: "sandbox",
    }, fetchImplementation);

    await expect(repository.getCurrentLevel({ variationId: "variation-id" })).resolves.toEqual({
      quantity: 3,
      observedAt: "2026-07-14T12:00:00.000Z",
    });
  });

  it("returns no sellable quantity when Square has no in-stock count", async () => {
    const repository = new SquareInventoryRepository({
      SQUARE_APPLICATION_ID: "application-id",
      SQUARE_LOCATION_ID: "location-id",
      SQUARE_ACCESS_TOKEN: "access-token",
      SQUARE_ENVIRONMENT: "production",
    }, async () => Response.json({ counts: [] }));

    await expect(repository.getCurrentLevel({ variationId: "variation-id" })).resolves.toBeNull();
  });
});
