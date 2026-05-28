import { db } from '../data/db';
import type { View } from '../store/view';

export function mapCountsToView(total: number, reviewed: number): View {
  if (total === 0 || reviewed === 0) return 'welcome';
  if (reviewed < total) return 'first-inventory';
  return 'country-browse';
}

export async function computeInitialView(): Promise<View> {
  const total = await db.stickers.count();
  const reviewed = await db.stickers.filter((s) => s.reviewed).count();
  return mapCountsToView(total, reviewed);
}
