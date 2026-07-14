export type InventoryLevel = {
  quantity: number;
  observedAt: string;
};

/**
 * The Shop reads sellable stock from this boundary. Implementations must return
 * the provider's current inventory instead of a copied quantity in catalog content.
 */
export interface InventoryRepository {
  getCurrentLevel(input: { variationId: string }): Promise<InventoryLevel | null>;
}
