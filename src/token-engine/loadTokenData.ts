import { loadTokens } from "@/token-loaders/registry";

interface Token {
  $value: string;
  $type: string;
  path: string[];
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
  input: unknown = { kind: "static" },
): Promise<LoadedTokenData> {
  const normalizedTokens = await loadTokens(input);

  const allTokens: Record<string, PlatformTokens> = {};
  const orderedPlatforms: string[] = [];

  for (const token of normalizedTokens) {
    const parsedTokenSet = parseTokenSetId(token.tokenSetId);
    if (!parsedTokenSet) continue;

    const { platformName, tierName } = parsedTokenSet;
    if (!allTokens[platformName]) {
      allTokens[platformName] = {};
      orderedPlatforms.push(platformName);
    }

    if (!allTokens[platformName][tierName]) {
      allTokens[platformName][tierName] = {};
    }

    allTokens[platformName][tierName][token.name] = {
      $value: token.value,
      $type: token.type,
      path: token.path,
    };
  }

  return { allTokens, orderedPlatforms };
}
