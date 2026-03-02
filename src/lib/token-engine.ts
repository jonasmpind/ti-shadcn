export function flattenTokens(obj: any, prefix = "") {
  const result: any = {}

  for (const key in obj) {
    const value = obj[key]
    const path = prefix ? `${prefix}.${key}` : key

    if (value && typeof value === "object" && "$value" in value) {
      result[path] = value
    } else if (value && typeof value === "object") {
      Object.assign(result, flattenTokens(value, path))
    }
  }

  return result
}

export function resolveTokenValue(
  tokenName: string,
  platform: string,
  allTokens: any,
  visited = new Set<string>(),
  chain: string[] = []
) {
  const tiers = allTokens[platform]
  const lookup: any = {}

  for (const tierFile in tiers) {
    Object.assign(lookup, tiers[tierFile])
  }

  const token = lookup[tokenName]
  if (!token) return { value: undefined, chain }

  const value = token.$value
  if (typeof value !== "string" || !value.startsWith("{")) {
    return { value, chain }
  }

  const aliasPath = value.slice(1, -1)
  if (visited.has(aliasPath)) return { value, chain }

  visited.add(aliasPath)
  chain.push(aliasPath)

  return resolveTokenValue(aliasPath, platform, allTokens, visited, chain)
}
