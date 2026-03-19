import { createStaticLoader } from "@/token-loaders/loaders/staticLoader";
import { styleDictionaryLoader } from "@/token-loaders/loaders/styleDictionaryLoader";
import { tokensStudioLoader } from "@/token-loaders/loaders/tokensStudioLoader";
import { w3cLoader } from "@/token-loaders/loaders/w3cLoader";
import type { TokenLoader } from "@/token-loaders/types";
import type { NormalizedTokenSet } from "@/token-normalizer/types";

const loaders: TokenLoader[] = [];

export function registerLoader(loader: TokenLoader) {
  if (loaders.some((registeredLoader) => registeredLoader.name === loader.name)) {
    return;
  }

  loaders.push(loader);
}

export async function loadTokens(input: unknown): Promise<NormalizedTokenSet> {
  const loader = loaders.find((candidate) => {
    try {
      return candidate.canLoad(input);
    } catch {
      return false;
    }
  });

  if (!loader) {
    throw new Error("No compatible token loader found");
  }

  return loader.load(input);
}

const staticLoader = createStaticLoader(loadTokens);

registerLoader(staticLoader);
registerLoader(tokensStudioLoader);
registerLoader(styleDictionaryLoader);
registerLoader(w3cLoader);
