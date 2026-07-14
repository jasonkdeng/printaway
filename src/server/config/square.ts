import "server-only";

import { z } from "zod";

const squareEnvironmentSchema = z.enum(["sandbox", "production"]);

const squareServerConfigSchema = z.object({
  SQUARE_APPLICATION_ID: z.string().min(1),
  SQUARE_LOCATION_ID: z.string().min(1),
  SQUARE_ACCESS_TOKEN: z.string().min(1),
  SQUARE_ENVIRONMENT: squareEnvironmentSchema,
});

export type SquareServerConfig = z.infer<typeof squareServerConfigSchema>;
export type SquareEnvironment = z.infer<typeof squareEnvironmentSchema>;

type SquareEnvironmentVariables = keyof SquareServerConfig;

export function getSquareServerConfig(
  environment: Partial<Record<SquareEnvironmentVariables, string | undefined>>,
): SquareServerConfig {
  return squareServerConfigSchema.parse({
    SQUARE_APPLICATION_ID: environment.SQUARE_APPLICATION_ID,
    SQUARE_LOCATION_ID: environment.SQUARE_LOCATION_ID,
    SQUARE_ACCESS_TOKEN: environment.SQUARE_ACCESS_TOKEN,
    SQUARE_ENVIRONMENT: environment.SQUARE_ENVIRONMENT,
  });
}

export function getSquareServerConfigFromEnvironment(): SquareServerConfig {
  return getSquareServerConfig({
    SQUARE_APPLICATION_ID: process.env["SQUARE_APPLICATION_ID"],
    SQUARE_LOCATION_ID: process.env["SQUARE_LOCATION_ID"],
    SQUARE_ACCESS_TOKEN: process.env["SQUARE_ACCESS_TOKEN"],
    SQUARE_ENVIRONMENT: process.env["SQUARE_ENVIRONMENT"],
  });
}

export function getOptionalSquareServerConfigFromEnvironment(): SquareServerConfig | null {
  const result = squareServerConfigSchema.safeParse({
    SQUARE_APPLICATION_ID: process.env["SQUARE_APPLICATION_ID"],
    SQUARE_LOCATION_ID: process.env["SQUARE_LOCATION_ID"],
    SQUARE_ACCESS_TOKEN: process.env["SQUARE_ACCESS_TOKEN"],
    SQUARE_ENVIRONMENT: process.env["SQUARE_ENVIRONMENT"],
  });
  return result.success ? result.data : null;
}
