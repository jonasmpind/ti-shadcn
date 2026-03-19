export interface NormalizedToken {
  name: string;
  value: string;
  type: string;
  path: string[];
  tokenSetId: string;
  source: string;
}

export type NormalizedTokenSet = NormalizedToken[];
