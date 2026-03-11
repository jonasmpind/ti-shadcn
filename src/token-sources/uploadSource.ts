import type { TokenSetPayload, TokenSource } from "@/token-sources/types";

export async function loadUploadedTokens(): Promise<TokenSetPayload[]> {
  // Placeholder for future ZIP-upload token support.
  return [];
}

export const uploadTokenSource: TokenSource = {
  id: "upload",
  loadTokenSets: loadUploadedTokens,
};
