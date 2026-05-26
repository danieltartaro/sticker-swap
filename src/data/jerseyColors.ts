import type { Sticker } from './types';

// Canonical home-kit jersey-primary hex per nation prefix.
// Sources: Wikipedia federation/kit pages ("X national football team", "X national football team kit"),
// adidas/Nike/Puma 2026 cycle release imagery where available.
// Values are best-effort; on-device daylight test (per spec 05 Q2a) is the acceptance bar.
// The 8 originals (BRA/ARG/GER/FRA/ENG/ESP/NED/POR) are session-3 locked per CLAUDE.md §4.12 — do not edit.
export const JERSEY_PRIMARY: Record<string, string> = {
  ALG: '#006233',  // Algeria green (Les Fennecs)
  ARG: '#75AADB',  // Argentina sky blue
  AUS: '#FFCD00',  // Australia gold (Socceroos)
  AUT: '#ED2939',  // Austria red
  BEL: '#ED2939',  // Belgium red (Red Devils)
  BIH: '#002F6C',  // Bosnia blue (Dragons)
  BRA: '#FFDF00',  // Brazil yellow
  CAN: '#D80921',  // Canada red
  CIV: '#FF8200',  // Cote d'Ivoire orange (Les Elephants)
  COD: '#009CDE',  // DR Congo sky blue (Leopards)
  COL: '#FCD116',  // Colombia yellow (Cafeteros)
  CPV: '#003893',  // Cape Verde blue (Tubaroes Azuis)
  CRO: '#FF0000',  // Croatia red (checkerboard primary)
  CUW: '#002F6C',  // Curacao blue
  CZE: '#D7141A',  // Czech Republic red
  ECU: '#FFD100',  // Ecuador yellow (La Tri)
  EGY: '#C8102E',  // Egypt red (Pharaohs)
  ENG: '#FFFFFF',  // England white (Q2a watch item)
  ESP: '#C60B1E',  // Spain red
  FRA: '#0055A4',  // France blue
  GER: '#1A1A1A',  // Germany black (session-3 lock; identity color, not literal white home)
  GHA: '#FFFFFF',  // Ghana white (Black Stars home) - Q2a-like
  HAI: '#00209F',  // Haiti blue (Les Grenadiers)
  IRN: '#FFFFFF',  // Iran white (Team Melli) - Q2a-like
  IRQ: '#1D5E3F',  // Iraq green (Lions of Mesopotamia)
  JOR: '#FFFFFF',  // Jordan white - Q2a-like
  JPN: '#000C66',  // Japan deep blue (Samurai Blue)
  KOR: '#C8102E',  // South Korea red (Taegeuk Warriors)
  KSA: '#006C35',  // Saudi Arabia green (Falcons)
  MAR: '#C8102E',  // Morocco red (Atlas Lions)
  MEX: '#006847',  // Mexico green (El Tri)
  NED: '#FF6600',  // Netherlands orange
  NOR: '#C8102E',  // Norway red
  NZL: '#FFFFFF',  // New Zealand white (All Whites) - Q2a-like
  PAN: '#C8102E',  // Panama red (Los Canaleros)
  PAR: '#C8102E',  // Paraguay red (red/white stripes, red primary)
  POR: '#006600',  // Portugal green
  QAT: '#8A1538',  // Qatar maroon
  RSA: '#FFD100',  // South Africa yellow (Bafana Bafana)
  SCO: '#0F4C81',  // Scotland navy blue
  SEN: '#FFFFFF',  // Senegal white (Lions of Teranga home) - Q2a-like
  SUI: '#DC0018',  // Switzerland red (Nati)
  SWE: '#FFCD00',  // Sweden yellow (Blagult)
  TUN: '#E70013',  // Tunisia red (Eagles of Carthage)
  TUR: '#E30A17',  // Turkey red (Crescent-Stars)
  URU: '#5CBFEB',  // Uruguay sky blue (Celeste)
  USA: '#FFFFFF',  // USMNT white home - Q2a-like
  UZB: '#1EB53A',  // Uzbekistan green (White Wolves)
};

export function resolveJerseyColor(
  sticker: Pick<Sticker, 'code' | 'type'>,
): string | undefined {
  if (sticker.type !== 'player' && sticker.type !== 'badge') return undefined;
  const prefix = sticker.code.match(/^[A-Z]+/)?.[0];
  if (!prefix) return undefined;
  return JERSEY_PRIMARY[prefix];
}
