export interface NormalizedToken {
  name: string;
  value: string;
  type: string;
  path: string[];
  raw: unknown;
  tokenSetId: string;
  source: string;
}

export type NormalizedTokenSet = NormalizedToken[];
