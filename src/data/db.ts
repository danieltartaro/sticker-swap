import Dexie, { type EntityTable } from 'dexie';
import type { Sticker } from './types';
import { rawCatalog } from './catalog';
import { transformCatalog } from './transformCatalog';

class StickerSwapDB extends Dexie {
  stickers!: EntityTable<Sticker, 'code'>;

  constructor() {
    super('StickerSwapDB');
    this.version(1).stores({
      stickers: '&code, type, team, reviewed',
    });
    // Schema v2: catalog replaced; v1 dev data discarded (no useful key overlap).
    this.version(2)
      .stores({
        stickers: '&code, type, team, reviewed, sortIndex',
      })
      .upgrade(async (tx) => {
        const table = tx.table<Sticker>('stickers');
        await table.clear();
        await table.bulkAdd(transformCatalog(rawCatalog));
      });
    // Schema v3: regional filter applied; European s-variants excluded by default.
    this.version(3)
      .stores({
        stickers: '&code, type, team, reviewed, sortIndex',
      })
      .upgrade(async (tx) => {
        const table = tx.table<Sticker>('stickers');
        await table.clear();
        await table.bulkAdd(transformCatalog(rawCatalog));
      });
    this.on('populate', () => this.stickers.bulkAdd(transformCatalog(rawCatalog)));
  }
}

export const db = new StickerSwapDB();

export async function resetInventory(): Promise<void> {
  await db.stickers.clear();
  await db.stickers.bulkAdd(transformCatalog(rawCatalog));
}
