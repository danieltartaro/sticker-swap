export type StickerType = 'player' | 'badge' | 'legend' | 'special' | 'group';

export type Sticker = {
  code: string;
  type: StickerType;
  team?: string;
  name?: string;
  isShiny?: boolean;
  owned: number; // 0 = need, 1 = have. >=2 unused — dupe concept retired in Module 7 per §4.12.
  reviewed: boolean;
  sortIndex: number;
};
