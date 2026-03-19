import type { NormalizedTokenSet } from "@/token-normalizer/types";

export interface StaticLoaderInput {
  kind: "static";
  basePath?: string;
  source?: string;
}

export interface TokenDataLoaderInput {
  kind: "token-data";
  data: unknown;
  tokenSetId?: string;
  source?: string;
}

export type TokenLoaderInput = StaticLoaderInput | TokenDataLoaderInput | File;

export interface TokenLoader {
  name: string;
  canLoad(input: unknown): boolean;
  load(input: unknown): Promise<NormalizedTokenSet>;
}

export function isStaticLoaderInput(input: unknown): input is StaticLoaderInput {
  return (
    Boolean(input) &&
    typeof input === "object" &&
    (input as StaticLoaderInput).kind === "static"
  );
}

export function isTokenDataLoaderInput(input: unknown): input is TokenDataLoaderInput {
  return (
    Boolean(input) &&
    typeof input === "object" &&
    (input as TokenDataLoaderInput).kind === "token-data"
  );
}
