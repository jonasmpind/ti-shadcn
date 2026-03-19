import type { NormalizedTokenSet } from "@/token-normalizer/types";

interface NormalizeOptions {
  tokenSetId: string;
  source: string;
}

const DEFAULT_TOKEN_TYPE = "unknown";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isTokenStudioLeaf(node: unknown): node is { $value: unknown; $type?: unknown } {
  return isRecord(node) && Object.prototype.hasOwnProperty.call(node, "$value");
}

function isStyleDictionaryLeaf(node: unknown): node is { value: unknown; type?: unknown } {
  return (
    isRecord(node) &&
    Object.prototype.hasOwnProperty.call(node, "value") &&
    !Object.prototype.hasOwnProperty.call(node, "$value")
  );
}

function toStringValue(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return JSON.stringify(value);
}

function getTokenType(value: unknown): string {
  return typeof value === "string" && value.trim() ? value : DEFAULT_TOKEN_TYPE;
}

export function hasLeafWithKey(input: unknown, leafKey: "$value" | "value"): boolean {
  if (!isRecord(input)) return false;

  for (const value of Object.values(input)) {
    if (!isRecord(value)) continue;

    if (leafKey === "$value" && isTokenStudioLeaf(value)) return true;
    if (leafKey === "value" && isStyleDictionaryLeaf(value)) return true;
    if (hasLeafWithKey(value, leafKey)) return true;
  }

  return false;
}

export function normalizeTokenStudioTokens(
  input: unknown,
  options: NormalizeOptions,
): NormalizedTokenSet {
  const result: NormalizedTokenSet = [];

  function walk(node: unknown, path: string[]) {
    if (!isRecord(node)) return;

    if (isTokenStudioLeaf(node)) {
      result.push({
        name: path.join("."),
        value: toStringValue(node.$value),
        type: getTokenType(node.$type),
        path,
        raw: node,
        tokenSetId: options.tokenSetId,
        source: options.source,
      });
      return;
    }

    for (const [key, value] of Object.entries(node)) {
      walk(value, [...path, key]);
    }
  }

  walk(input, []);
  return result;
}

export function normalizeStyleDictionaryTokens(
  input: unknown,
  options: NormalizeOptions,
): NormalizedTokenSet {
  const result: NormalizedTokenSet = [];

  function walk(node: unknown, path: string[]) {
    if (!isRecord(node)) return;

    if (isStyleDictionaryLeaf(node)) {
      result.push({
        name: path.join("."),
        value: toStringValue(node.value),
        type: getTokenType(node.type),
        path,
        raw: node,
        tokenSetId: options.tokenSetId,
        source: options.source,
      });
      return;
    }

    for (const [key, value] of Object.entries(node)) {
      walk(value, [...path, key]);
    }
  }

  walk(input, []);
  return result;
}
