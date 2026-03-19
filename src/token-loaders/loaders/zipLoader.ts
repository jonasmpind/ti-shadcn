import type { TokenLoader } from "@/token-loaders/types";
import type { NormalizedTokenSet } from "@/token-normalizer/types";

export const zipLoader: TokenLoader = {
  name: "zipLoader",

  canLoad(input: unknown): boolean {
    return typeof File !== "undefined" && input instanceof File;
  },

  async load(_input: unknown): Promise<NormalizedTokenSet> {
    throw new Error("ZIP token loader not implemented yet");
  },
};
