import type { CatalogEntry } from './catalog';
import type { Sticker, StickerType } from './types';
import { inferType } from './inferType';

const META_TEAMS = new Set([
  'We Are Panini',
  'FIFA World Cup 2026',
  'Host Countries and Cities',
  'FIFA World Cup History',
]);

export function transformCatalog(
  entries: CatalogEntry[],
  { includeShinies = false }: { includeShinies?: boolean } = {},
): Sticker[] {
  const source = includeShinies ? entries : entries.filter((e) => !e.code.endsWith('s'));
  return source.map((entry, sortIndex) => {
    const type: StickerType = inferType(entry);
    const isShiny = entry.code.endsWith('s') || type === 'badge';
    const sticker: Sticker = {
      code: entry.code,
      type,
      name: entry.name,
      owned: 0,
      reviewed: false,
      sortIndex,
    };
    if (!META_TEAMS.has(entry.team)) sticker.team = entry.team;
    if (isShiny) sticker.isShiny = true;
    return sticker;
  });
}
