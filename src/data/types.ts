export type StickerType = 'player' | 'badge' | 'legend' | 'special' | 'group';

export type Sticker = {
  code: string;
  type: StickerType;
  team?: string;
  name?: string;
  isShiny?: boolean;
  owned: number;
  reviewed: boolean;
  sortIndex: number;
};
