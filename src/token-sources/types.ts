export interface TokenSetPayload {
  id: string;
  tokens: unknown;
  source: string;
}

export interface TokenSource {
  id: string;
  loadTokenSets: () => Promise<TokenSetPayload[]>;
}
