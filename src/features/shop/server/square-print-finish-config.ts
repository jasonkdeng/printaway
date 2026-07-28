import "server-only";

import { z } from "zod";

const squarePrintFinishModifierIdsSchema = z.object({
  Matte: z.string().min(1),
  Glossy: z.string().min(1),
});

export type SquarePrintFinishModifierIds = z.infer<typeof squarePrintFinishModifierIdsSchema>;

export function getSquarePrintFinishModifierIds(
  environment: Partial<Record<"SQUARE_PRINT_FINISH_MATTE_MODIFIER_ID" | "SQUARE_PRINT_FINISH_GLOSSY_MODIFIER_ID", string | undefined>>,
): SquarePrintFinishModifierIds {
  return squarePrintFinishModifierIdsSchema.parse({
    Matte: environment.SQUARE_PRINT_FINISH_MATTE_MODIFIER_ID,
    Glossy: environment.SQUARE_PRINT_FINISH_GLOSSY_MODIFIER_ID,
  });
}

export function getOptionalSquarePrintFinishModifierIdsFromEnvironment(): SquarePrintFinishModifierIds | null {
  const result = squarePrintFinishModifierIdsSchema.safeParse({
    Matte: process.env["SQUARE_PRINT_FINISH_MATTE_MODIFIER_ID"],
    Glossy: process.env["SQUARE_PRINT_FINISH_GLOSSY_MODIFIER_ID"],
  });
  return result.success ? result.data : null;
}
