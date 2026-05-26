import { db } from '../../data/db';

export function inventoryDone(total: number, unreviewedCount: number): boolean {
  return total > 0 && unreviewedCount === 0;
}

export async function checkInventoryDone(): Promise<boolean> {
  const total = await db.stickers.count();
  if (total === 0) return false;
  const unreviewed = await db.stickers.filter((s) => !s.reviewed).count();
  return inventoryDone(total, unreviewed);
}
