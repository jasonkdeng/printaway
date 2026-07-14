import { describe, expect, it } from "vitest";

import { getSquareServerConfig } from "./square";

describe("getSquareServerConfig", () => {
  it("parses the server-only Square configuration", () => {
    expect(getSquareServerConfig({
      SQUARE_APPLICATION_ID: "application-id",
      SQUARE_LOCATION_ID: "location-id",
      SQUARE_ACCESS_TOKEN: "access-token",
      SQUARE_ENVIRONMENT: "production",
    })).toEqual({
      SQUARE_APPLICATION_ID: "application-id",
      SQUARE_LOCATION_ID: "location-id",
      SQUARE_ACCESS_TOKEN: "access-token",
      SQUARE_ENVIRONMENT: "production",
    });
  });

  it("rejects incomplete or unknown-environment configuration", () => {
    expect(() => getSquareServerConfig({ SQUARE_ENVIRONMENT: "development" })).toThrow();
  });
});
