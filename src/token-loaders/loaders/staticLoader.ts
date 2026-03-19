import type { TokenLoader } from "@/token-loaders/types";
import { isStaticLoaderInput } from "@/token-loaders/types";
import type { NormalizedTokenSet } from "@/token-normalizer/types";

interface StaticTokenManifest {
  tokens: string[];
}

const DEFAULT_TOKENS_BASE_PATH = "/tokens";

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Could not load token resource "${url}" (${response.status})`);
  }

  return (await response.json()) as T;
}

function toTokenSetId(file: string): string {
  return file.replace(/\.json$/i, "");
}

export function createStaticLoader(
  loadTokens: (input: unknown) => Promise<NormalizedTokenSet>,
): TokenLoader {
  return {
    name: "staticLoader",

    canLoad(input: unknown): boolean {
      return isStaticLoaderInput(input);
    },

    async load(input: unknown): Promise<NormalizedTokenSet> {
      if (!isStaticLoaderInput(input)) {
        throw new Error("staticLoader received incompatible input");
      }

      const basePath = input.basePath ?? DEFAULT_TOKENS_BASE_PATH;
      const manifest = await fetchJson<StaticTokenManifest>(`${basePath}/manifest.json`);

      if (!manifest || !Array.isArray(manifest.tokens)) {
        throw new Error('Token manifest is invalid. Expected { "tokens": string[] }.');
      }

      const tokenFiles = await Promise.all(
        manifest.tokens.map(async (file) => {
          if (typeof file !== "string" || !file.trim()) {
            throw new Error("Token manifest contains an invalid token file entry.");
          }

          const normalizedFile = file.replace(/^\/+/, "");
          const data = await fetchJson<unknown>(`${basePath}/${normalizedFile}`);

          return loadTokens({
            kind: "token-data",
            data,
            tokenSetId: toTokenSetId(normalizedFile),
          });
        }),
      );

      return tokenFiles.flat();
    },
  };
}
