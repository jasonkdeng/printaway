import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

import type { CartLine, CartSnapshot } from "@/features/cart/domain/cart";
import type { CartRepository } from "@/features/cart/server/cart-repository";
import { moneySchema } from "@/lib/currency/money";
import { getSupabaseAdminConfigFromEnvironment } from "@/server/config/supabase";

const cartRowSchema = z.object({
  line_id: z.string().min(1),
  product_id: z.string().min(1),
  product_name: z.string().min(1),
  finish: z.string().min(1),
  colour: z.string().min(1),
  quantity: z.number().int().min(1).max(10),
  maximum_quantity: z.number().int().nonnegative(),
  unit_price_minor: z.number().int().nonnegative(),
  currency: z.literal("CAD"),
});

const cartRowsSchema = z.array(cartRowSchema);

export type SupabaseCartGateway = {
  read(accountId: string): Promise<unknown>;
  replace(accountId: string, lines: readonly CartLine[]): Promise<unknown>;
};

function rowToCartLine(row: z.infer<typeof cartRowSchema>): CartLine {
  return {
    id: row.line_id,
    productId: row.product_id,
    name: row.product_name,
    finish: row.finish,
    colour: row.colour,
    quantity: row.quantity,
    maximumQuantity: row.maximum_quantity,
    unitPrice: moneySchema.parse({ amountMinor: row.unit_price_minor, currency: row.currency }),
  };
}

function client(): SupabaseClient {
  const config = getSupabaseAdminConfigFromEnvironment();
  return createClient(config.SUPABASE_URL, config.SUPABASE_SECRET_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export class SupabaseCartRepository implements CartRepository {
  public constructor(private readonly gateway: SupabaseCartGateway) {}

  public async read(accountId: string): Promise<CartSnapshot> {
    return { lines: cartRowsSchema.parse(await this.gateway.read(accountId)).map(rowToCartLine) };
  }

  public async replace(accountId: string, lines: readonly CartLine[]): Promise<CartSnapshot> {
    return { lines: cartRowsSchema.parse(await this.gateway.replace(accountId, lines)).map(rowToCartLine) };
  }
}

export function createSupabaseCartRepository(): SupabaseCartRepository {
  const supabase = client();
  return new SupabaseCartRepository({
    async read(accountId) {
      const result = await supabase
        .from("account_cart_lines")
        .select("line_id, product_id, product_name, finish, colour, quantity, maximum_quantity, unit_price_minor, currency")
        .eq("account_id", accountId)
        .order("line_id");
      if (result.error) throw new Error("provider_unavailable");
      return result.data;
    },
    async replace(accountId, lines) {
      const result = await supabase.rpc("replace_account_cart_lines", {
        p_account_id: accountId,
        p_lines: lines.map((line) => ({
          line_id: line.id,
          product_id: line.productId,
          product_name: line.name,
          finish: line.finish,
          colour: line.colour,
          quantity: line.quantity,
          maximum_quantity: line.maximumQuantity,
          unit_price_minor: line.unitPrice.amountMinor,
          currency: line.unitPrice.currency,
        })),
      });
      if (result.error) throw new Error("provider_unavailable");
      return result.data;
    },
  });
}
