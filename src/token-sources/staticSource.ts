import type { TokenSetPayload, TokenSource } from "@/token-sources/types";

interface StaticTokenManifest {
  tokens: string[];
}

const TOKENS_BASE_PATH = "/tokens";

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

export async function loadStaticTokens(): Promise<TokenSetPayload[]> {
  const manifest = await fetchJson<StaticTokenManifest>(
    `${TOKENS_BASE_PATH}/manifest.json`,
  );

  if (!manifest || !Array.isArray(manifest.tokens)) {
    throw new Error('Token manifest is invalid. Expected { "tokens": string[] }.');
  }

  return Promise.all(
    manifest.tokens.map(async (file) => {
      if (typeof file !== "string" || !file.trim()) {
        throw new Error("Token manifest contains an invalid token file entry.");
      }

      const normalizedFile = file.replace(/^\/+/, "");
      const tokens = await fetchJson<unknown>(
        `${TOKENS_BASE_PATH}/${normalizedFile}`,
      );

      return {
        id: toTokenSetId(normalizedFile),
        tokens,
        source: "static",
      };
    }),
  );
}

export const staticTokenSource: TokenSource = {
  id: "static",
  loadTokenSets: loadStaticTokens,
};
