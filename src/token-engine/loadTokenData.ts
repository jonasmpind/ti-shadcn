import { flattenTokens } from "@/lib/token-engine";
import { staticTokenSource } from "@/token-sources/staticSource";
import { uploadTokenSource } from "@/token-sources/uploadSource";
import type { TokenSource } from "@/token-sources/types";

interface Token {
  $value: unknown;
}

type FlatTierTokens = Record<string, Token>;
export type PlatformTokens = Record<string, FlatTierTokens>;

export interface LoadedTokenData {
  allTokens: Record<string, PlatformTokens>;
  orderedPlatforms: string[];
}

const DEFAULT_PLATFORM = "default";

function parseTokenSetId(
  tokenSetId: string,
): { platformName: string; tierName: string } | null {
  const parts = tokenSetId
    .replace(/\.json$/i, "")
    .split("/")
    .filter((part) => Boolean(part));

  if (parts.length === 0) return null;
  if (parts.length === 1) {
    return { platformName: DEFAULT_PLATFORM, tierName: parts[0] };
  }

  return {
    platformName: parts[0],
    tierName: parts.slice(1).join("/"),
  };
}

export async function loadTokenData(
  sources: TokenSource[] = [staticTokenSource, uploadTokenSource],
): Promise<LoadedTokenData> {
  const tokenSetGroups = await Promise.all(
    sources.map((source) => source.loadTokenSets()),
  );
  const tokenSets = tokenSetGroups.flat();

  const allTokens: Record<string, PlatformTokens> = {};
  const orderedPlatforms: string[] = [];

  for (const tokenSet of tokenSets) {
    const parsedTokenSet = parseTokenSetId(tokenSet.id);
    if (!parsedTokenSet) continue;

    const { platformName, tierName } = parsedTokenSet;
    if (!allTokens[platformName]) {
      allTokens[platformName] = {};
      orderedPlatforms.push(platformName);
    }

    allTokens[platformName][tierName] = flattenTokens(tokenSet.tokens);
  }

  return { allTokens, orderedPlatforms };
}
