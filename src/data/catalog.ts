import raw from '../../data/raw/panini-wc-2026-catalog.json';

export type CatalogEntry = {
  code: string;
  name: string;
  team: string;
};

type RawCatalog = {
  source: string;
  scrapedAt: string;
  edition: string;
  canonicalCount: number;
  cutoffRule: string;
  stickers: CatalogEntry[];
};

export const rawCatalog: CatalogEntry[] = (raw as RawCatalog).stickers;
