import {
  hasLeafWithKey,
  normalizeTokenStudioTokens,
} from "@/token-normalizer/normalize";
import type { NormalizedTokenSet } from "@/token-normalizer/types";
import type { TokenLoader } from "@/token-loaders/types";
import { isTokenDataLoaderInput } from "@/token-loaders/types";

const DEFAULT_TOKEN_SET_ID = "uploaded/tokens";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isW3CWrapper(data: unknown): boolean {
  if (!isRecord(data)) return false;
  return typeof data.$schema === "string" || isRecord(data.$tokens);
}

export const tokensStudioLoader: TokenLoader = {
  name: "tokensStudioLoader",

  canLoad(input: unknown): boolean {
    if (!isTokenDataLoaderInput(input)) return false;
    if (isW3CWrapper(input.data)) return false;
    return hasLeafWithKey(input.data, "$value");
  },

  async load(input: unknown): Promise<NormalizedTokenSet> {
    if (!isTokenDataLoaderInput(input)) {
      throw new Error("tokensStudioLoader received incompatible input");
    }

    return normalizeTokenStudioTokens(input.data, {
      tokenSetId: input.tokenSetId ?? DEFAULT_TOKEN_SET_ID,
      source: "tokensStudioLoader",
    });
  },
};
