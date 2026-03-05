import { useEffect, useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { flattenTokens, resolveTokenValue } from "@/lib/token-engine";
import { TokenCard } from "@/components/token-card";
import { Moon, Sun } from "lucide-react";

interface Token {
  $value: any;
}

type PlatformTokens = Record<string, Record<string, Token>>;
type Theme = "light" | "dark";

const getInitialTheme = (): Theme => {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark" || savedTheme === "light") return savedTheme;

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

export default function App() {
  const [allTokens, setAllTokens] = useState<Record<string, PlatformTokens>>(
    {},
  );
  const [platform, setPlatform] = useState<string>("");
  const [tier, setTier] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    async function load() {
      const metadata = await fetch("/tokens/$metadata.json").then((r) =>
        r.json(),
      );

      const platforms = new Set<string>();
      metadata.tokenSetOrder.forEach((entry: string) => {
        const [p] = entry.split("/");
        platforms.add(p);
      });

      const data: Record<string, PlatformTokens> = {};

      for (const p of platforms) {
        data[p] = {};
        const entries = metadata.tokenSetOrder.filter((e: string) =>
          e.startsWith(p),
        );

        for (const entry of entries) {
          const res = await fetch(`/tokens/${entry}.json`);
          const json = await res.json();
          data[p][entry.split("/")[1]] = flattenTokens(json);
        }
      }

      setAllTokens(data);
      setPlatform(Array.from(platforms)[0] ?? "");
    }

    load();
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const visibleTokens = useMemo(() => {
    if (!platform || !allTokens[platform]) return [];

    const tiers = allTokens[platform];
    const results: any[] = [];

    for (const tierFile in tiers) {
      const tierName = tierFile.replace("-web", "");
      if (tier !== "all" && tier !== tierName) continue;

      const tokens = tiers[tierFile];

      for (const name in tokens) {
        if (search && !name.toLowerCase().includes(search.toLowerCase()))
          continue;

        const raw = tokens[name].$value;
        const isAlias = typeof raw === "string" && raw.startsWith("{");

        let resolved = { value: raw, chain: [] as string[] };
        if (isAlias) resolved = resolveTokenValue(name, platform, allTokens);

        results.push({
          name,
          tier: tierName,
          value: resolved.value,
          chain: resolved.chain,
        });
      }
    }

    return results;
  }, [allTokens, platform, tier, search]);

  return (
    <TooltipProvider>
      <div className="h-screen w-full overflow-hidden">
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-12 items-center justify-between gap-3 px-4 md:px-6">
            <h1 className="text-sm font-semibold tracking-tight">
              Design Token Inspector{" "}
              <span className="ml-1 text-xs font-normal opacity-70">
                by JMP v0.1.0
              </span>
            </h1>

            <div className="flex items-center justify-end gap-2">
              <Badge
                variant={null}
                className="font-mono font-light border-none opacity-70"
              >
                Tokens ({visibleTokens.length})
              </Badge>

              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger className="h-8 w-[150px]">
                  <SelectValue placeholder="Platform" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(allTokens).map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={tier} onValueChange={setTier}>
                <SelectTrigger className="h-8 w-[130px]">
                  <SelectValue placeholder="Tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All tiers</SelectItem>
                  <SelectItem value="core">Core</SelectItem>
                  <SelectItem value="semantic">Semantic</SelectItem>
                  <SelectItem value="component">Component</SelectItem>
                </SelectContent>
              </Select>

              <Input
                className="h-8 w-[220px]"
                placeholder="Search tokens..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() =>
                  setTheme((currentTheme) =>
                    currentTheme === "light" ? "dark" : "light",
                  )
                }
                aria-label={
                  theme === "light"
                    ? "Switch to dark mode"
                    : "Switch to light mode"
                }
                title={
                  theme === "light"
                    ? "Switch to dark mode"
                    : "Switch to light mode"
                }
              >
                {theme === "light" ? <Moon /> : <Sun />}
              </Button>
            </div>
          </div>
        </header>

        <main className="app-scrollbar h-[calc(100vh-3rem)] overflow-y-auto">
          <div className="px-4 py-6 md:px-6">
            <div className="grid gap-4 pb-8 md:grid-cols-2 md:pb-10 lg:grid-cols-3">
              {visibleTokens.map((token) => (
                <TokenCard
                  key={token.name}
                  name={token.name}
                  value={token.value}
                  chain={token.chain}
                />
              ))}
            </div>
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}
