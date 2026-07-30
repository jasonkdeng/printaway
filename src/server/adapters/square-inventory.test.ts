import { describe, expect, it } from "vitest";

import { SquareInventoryConfigurationError, SquareInventoryRepository } from "./square-inventory";

describe("SquareInventoryRepository", () => {
  it("returns the current in-stock quantity from Square", async () => {
    const fetchImplementation = async (input: URL | RequestInfo, init?: RequestInit): Promise<Response> => {
      const url = new URL(input.toString());
      expect(url.pathname).toBe("/v2/inventory/variation-id");
      expect(url.searchParams.get("location_ids")).toBe("location-id");
      expect(init?.headers).toMatchObject({ "Square-Version": "2026-07-15" });
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
    }, async (input) => {
      const url = new URL(input.toString());
      return url.pathname.startsWith("/v2/inventory/")
        ? Response.json({ counts: [] })
        : Response.json({ object: { id: "variation-id", type: "ITEM_VARIATION" } });
    });

    await expect(repository.getCurrentLevel({ variationId: "variation-id" })).resolves.toBeNull();
  });

  it("treats a successful Square response with no counts field as no sellable quantity", async () => {
    const repository = new SquareInventoryRepository({
      SQUARE_APPLICATION_ID: "application-id",
      SQUARE_LOCATION_ID: "location-id",
      SQUARE_ACCESS_TOKEN: "access-token",
      SQUARE_ENVIRONMENT: "production",
    }, async (input) => {
      const url = new URL(input.toString());
      return url.pathname.startsWith("/v2/inventory/")
        ? Response.json({ errors: [] })
        : Response.json({ object: { id: "variation-id", type: "ITEM_VARIATION" } });
    });

    await expect(repository.getCurrentLevel({ variationId: "variation-id" })).resolves.toBeNull();
  });

  it("identifies a configured variation that does not exist in the selected Square environment", async () => {
    const repository = new SquareInventoryRepository({
      SQUARE_APPLICATION_ID: "application-id",
      SQUARE_LOCATION_ID: "location-id",
      SQUARE_ACCESS_TOKEN: "access-token",
      SQUARE_ENVIRONMENT: "sandbox",
    }, async (input) => {
      const url = new URL(input.toString());
      return url.pathname.startsWith("/v2/inventory/")
        ? Response.json({ counts: [] })
        : new Response("not found", { status: 404 });
    });

    await expect(repository.getCurrentLevel({ variationId: "stale-variation-id" })).rejects.toEqual(
      new SquareInventoryConfigurationError("variation_not_found"),
    );
  });

  it("identifies an access token that cannot read the configured Square inventory", async () => {
    const repository = new SquareInventoryRepository({
      SQUARE_APPLICATION_ID: "application-id",
      SQUARE_LOCATION_ID: "location-id",
      SQUARE_ACCESS_TOKEN: "access-token",
      SQUARE_ENVIRONMENT: "sandbox",
    }, async () => new Response("forbidden", { status: 403 }));

    await expect(repository.getCurrentLevel({ variationId: "variation-id" })).rejects.toEqual(
      new SquareInventoryConfigurationError("access_denied"),
    );
  });
});
