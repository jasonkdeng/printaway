import "server-only";

import { z } from "zod";

const squareVariationIdsSchema = z.object({
  "monitor-riser": z.string().min(1),
  "desk-tray": z.string().min(1),
  "coat-hanger": z.string().min(1),
  "keycap-fidget": z.string().min(1),
});

export type SquareVariationIds = z.infer<typeof squareVariationIdsSchema>;

export function getSquareVariationIds(
  environment: Partial<Record<
    | "SQUARE_MONITOR_RISER_VARIATION_ID"
    | "SQUARE_DESK_TRAY_VARIATION_ID"
    | "SQUARE_COAT_HANGER_VARIATION_ID"
    | "SQUARE_KEYCAP_FIDGET_VARIATION_ID",
    string | undefined
  >>,
): SquareVariationIds {
  return squareVariationIdsSchema.parse({
    "monitor-riser": environment.SQUARE_MONITOR_RISER_VARIATION_ID,
    "desk-tray": environment.SQUARE_DESK_TRAY_VARIATION_ID,
    "coat-hanger": environment.SQUARE_COAT_HANGER_VARIATION_ID,
    "keycap-fidget": environment.SQUARE_KEYCAP_FIDGET_VARIATION_ID,
  });
}

export function getSquareVariationIdsFromEnvironment(): SquareVariationIds {
  return getSquareVariationIds({
    SQUARE_MONITOR_RISER_VARIATION_ID: process.env["SQUARE_MONITOR_RISER_VARIATION_ID"],
    SQUARE_DESK_TRAY_VARIATION_ID: process.env["SQUARE_DESK_TRAY_VARIATION_ID"],
    SQUARE_COAT_HANGER_VARIATION_ID: process.env["SQUARE_COAT_HANGER_VARIATION_ID"],
    SQUARE_KEYCAP_FIDGET_VARIATION_ID: process.env["SQUARE_KEYCAP_FIDGET_VARIATION_ID"],
  });
}

export function getOptionalSquareVariationIdsFromEnvironment(): SquareVariationIds | null {
  const result = squareVariationIdsSchema.safeParse({
    "monitor-riser": process.env["SQUARE_MONITOR_RISER_VARIATION_ID"],
    "desk-tray": process.env["SQUARE_DESK_TRAY_VARIATION_ID"],
    "coat-hanger": process.env["SQUARE_COAT_HANGER_VARIATION_ID"],
    "keycap-fidget": process.env["SQUARE_KEYCAP_FIDGET_VARIATION_ID"],
  });
  return result.success ? result.data : null;
}
