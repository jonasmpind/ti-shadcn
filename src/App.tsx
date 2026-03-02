import { useEffect, useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { TooltipProvider } from "@/components/ui/tooltip"
import { flattenTokens, resolveTokenValue } from "@/lib/token-engine"
import { TokenCard } from "@/components/token-card"

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
              <TokenCard
                key={token.name}
                name={token.name}
                value={token.value}
                chain={token.chain}
              />
            ))}
          </div>
        </ScrollArea>
      </div>
    </TooltipProvider>
  )
}
