import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface Token {
  $value: any
}

type PlatformTokens = Record<string, Record<string, Token>>

export default function App() {
  const [allTokens, setAllTokens] = useState<Record<string, PlatformTokens>>({})
  const [platform, setPlatform] = useState<string>("")
  const [tier, setTier] = useState<string>("all")
  const [search, setSearch] = useState<string>("")

  useEffect(() => {
    async function load() {
      const metadata = await fetch("/tokens/$metadata.json").then(r => r.json())

      const platforms = new Set<string>()
      metadata.tokenSetOrder.forEach((entry: string) => {
        const [p] = entry.split("/")
        platforms.add(p)
      })

      const data: Record<string, PlatformTokens> = {}

      for (const p of platforms) {
        data[p] = {}
        const entries = metadata.tokenSetOrder.filter((e: string) => e.startsWith(p))

        for (const entry of entries) {
          const res = await fetch(`/tokens/${entry}.json`)
          const json = await res.json()
          data[p][entry.split("/")[1]] = flattenTokens(json)
        }
      }

      setAllTokens(data)
      setPlatform(Array.from(platforms)[0] ?? "")
    }

    load()
  }, [])

  const visibleTokens = useMemo(() => {
    if (!platform || !allTokens[platform]) return []

    const tiers = allTokens[platform]
    const results: any[] = []

    for (const tierFile in tiers) {
      const tierName = tierFile.replace("-web", "")
      if (tier !== "all" && tier !== tierName) continue

      const tokens = tiers[tierFile]

      for (const name in tokens) {
        if (search && !name.toLowerCase().includes(search.toLowerCase())) continue

        const raw = tokens[name].$value
        const isAlias = typeof raw === "string" && raw.startsWith("{")

        let resolved = { value: raw, chain: [] as string[] }
        if (isAlias) resolved = resolveTokenValue(name, platform, allTokens)

        results.push({
          name,
          tier: tierName,
          value: resolved.value,
          chain: resolved.chain
        })
      }
    }

    return results
  }, [allTokens, platform, tier, search])

  return (
    <TooltipProvider>
      <div className="container mx-auto py-8 space-y-6">
        <h1 className="text-2xl font-semibold">Design Token Inspector</h1>

        <Card>
          <CardContent className="p-4 grid md:grid-cols-3 gap-4">
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger>
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(allTokens).map(p => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={tier} onValueChange={setTier}>
              <SelectTrigger>
                <SelectValue placeholder="Select tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All tiers</SelectItem>
                <SelectItem value="core">Core</SelectItem>
                <SelectItem value="semantic">Semantic</SelectItem>
                <SelectItem value="component">Component</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="Search tokens..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </CardContent>
        </Card>

        <Badge variant="secondary">
          Tokens ({visibleTokens.length})
        </Badge>

        <ScrollArea className="h-[60vh]">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 pr-4">
            {visibleTokens.map(token => (
              <Card key={token.name}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm break-all">
                    {token.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  {token.chain.map((alias: string, i: number) => (
                    <div key={i} className="text-muted-foreground break-all">
                      → {alias}
                    </div>
                  ))}
                  <div className="font-mono break-all">
                    {String(token.value)}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigator.clipboard.writeText(token.name)}
                  >
                    Copy name
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>
    </TooltipProvider>
  )
}

function flattenTokens(obj: any, prefix = "") {
  let result: any = {}

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

function resolveTokenValue(
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