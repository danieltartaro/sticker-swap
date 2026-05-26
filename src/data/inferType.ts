import type { CatalogEntry } from './catalog';
import type { StickerType } from './types';

export function inferType({ name, team }: CatalogEntry): StickerType {
  if (team === 'We Are Panini') return 'special';
  if (team === 'FIFA World Cup 2026') return 'special';
  if (team === 'Host Countries and Cities') return 'special';
  if (team === 'FIFA World Cup History') return 'legend';
  if (name === 'Team Photo') return 'group';
  if (name === 'Emblem') return 'badge';
  return 'player';
}
