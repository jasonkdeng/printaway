import { z } from "zod";

import type { CartLine } from "../domain/cart";
import { listCatalogWithAuthoritativeInventory } from "@/features/shop/server/catalog-with-inventory";
import type { CartRepository } from "./cart-repository";
import { normalizeCartLines } from "./cart-repository";

const accountCartLineSchema = z.object({
  id: z.string().min(1),
  productId: z.string().min(1),
  name: z.string().min(1),
  finish: z.string().min(1),
  colour: z.string().min(1),
  quantity: z.number().int().positive(),
  maximumQuantity: z.number().int().nonnegative(),
  unitPrice: z.object({ amountMinor: z.number().int().nonnegative(), currency: z.literal("CAD") }),
});

const accountCartPayloadSchema = z.object({ lines: z.array(accountCartLineSchema).max(20) });

type Account = { accountId: string; email: string | null };
type AccountCartDependencies = {
  getAccount(): Promise<Account | null>;
  revalidate(lines: readonly CartLine[]): Promise<{ lines: readonly CartLine[] }>;
  repository: CartRepository;
};

type AccountCartResult =
  | { status: 200; body: { lines: readonly CartLine[] } }
  | { status: 400; body: { kind: "validation"; code: "invalid_cart" } }
  | { status: 401; body: { kind: "unauthorized" } };

export function createAccountCartHandlers(dependencies: AccountCartDependencies) {
  async function read(): Promise<AccountCartResult> {
    const account = await dependencies.getAccount();
    if (!account) return { status: 401, body: { kind: "unauthorized" } };
    return { status: 200, body: await dependencies.repository.read(account.accountId) };
  }

  async function replace(payload: unknown): Promise<AccountCartResult> {
    const account = await dependencies.getAccount();
    if (!account) return { status: 401, body: { kind: "unauthorized" } };
    const parsed = accountCartPayloadSchema.safeParse(payload);
    if (!parsed.success) return { status: 400, body: { kind: "validation", code: "invalid_cart" } };
    const normalized = normalizeCartLines(parsed.data.lines);
    const revalidated = await dependencies.revalidate(normalized.lines);
    return { status: 200, body: await dependencies.repository.replace(account.accountId, revalidated.lines) };
  }

  return { read, replace };
}

export async function revalidateAccountCartLines(lines: readonly CartLine[]): Promise<{ lines: readonly CartLine[] }> {
  const products = await listCatalogWithAuthoritativeInventory();
  const productById = new Map(products.map((product) => [product.id, product]));
  const revalidated = lines.flatMap((line) => {
    const product = productById.get(line.productId);
    if (!product || product.availability.kind !== "in_stock") return [];
    if (!product.finishes.includes(line.finish as never) || !product.colours.includes(line.colour as never)) return [];
    return [{
      id: `${product.id}:${line.finish}:${line.colour}`,
      productId: product.id,
      name: product.name,
      finish: line.finish,
      colour: line.colour,
      quantity: Math.min(line.quantity, product.availability.quantity, 10),
      maximumQuantity: product.availability.quantity,
      unitPrice: product.provisionalPrice,
    }];
  });
  return normalizeCartLines(revalidated);
}
