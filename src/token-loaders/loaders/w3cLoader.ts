import {
  hasLeafWithKey,
  normalizeStyleDictionaryTokens,
  normalizeTokenStudioTokens,
} from "@/token-normalizer/normalize";
import type { NormalizedTokenSet } from "@/token-normalizer/types";
import type { TokenLoader } from "@/token-loaders/types";
import { isTokenDataLoaderInput } from "@/token-loaders/types";

const DEFAULT_TOKEN_SET_ID = "uploaded/tokens";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isW3CPayload(data: unknown): boolean {
  if (!isRecord(data)) return false;

  const schema = data.$schema;
  if (typeof schema === "string" && schema.toLowerCase().includes("design-tokens")) {
    return true;
  }

  const nestedTokens = data.$tokens;
  return isRecord(nestedTokens);
}

export const w3cLoader: TokenLoader = {
  name: "w3cLoader",

  canLoad(input: unknown): boolean {
    if (!isTokenDataLoaderInput(input)) return false;
    return isW3CPayload(input.data);
  },

  async load(input: unknown): Promise<NormalizedTokenSet> {
    if (!isTokenDataLoaderInput(input)) {
      throw new Error("w3cLoader received incompatible input");
    }

    const payload =
      isRecord(input.data) && isRecord(input.data.$tokens)
        ? input.data.$tokens
        : input.data;

    const options = {
      tokenSetId: input.tokenSetId ?? DEFAULT_TOKEN_SET_ID,
      source: "w3cLoader",
    };

    if (hasLeafWithKey(payload, "$value")) {
      return normalizeTokenStudioTokens(payload, options);
    }

    if (hasLeafWithKey(payload, "value")) {
      return normalizeStyleDictionaryTokens(payload, options);
    }

    throw new Error("W3C token payload does not contain supported token leaves");
  },
};
