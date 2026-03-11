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
import { resolveTokenValue } from "@/lib/token-engine";
import { TokenCard } from "@/components/token-card";
import { Moon, Sun, X } from "lucide-react";
import { loadTokenData, type PlatformTokens } from "@/token-engine/loadTokenData";

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
  const [defaultPlatform, setDefaultPlatform] = useState<string>("");
  const [tier, setTier] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function load() {
      setIsLoading(true);
      setLoadError(null);

      try {
        const { allTokens: data, orderedPlatforms } = await loadTokenData();

        if (isCancelled) return;

        setAllTokens(data);
        setDefaultPlatform(orderedPlatforms[0] ?? "");
        setPlatform((currentPlatform) =>
          currentPlatform && data[currentPlatform]
            ? currentPlatform
            : orderedPlatforms[0] ?? "",
        );
      } catch (error) {
        if (isCancelled) return;

        setAllTokens({});
        setPlatform("");
        setLoadError(
          error instanceof Error
            ? error.message
            : "Could not load token data.",
        );
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    }

    load();

    return () => {
      isCancelled = true;
    };
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

  const hasLoadedData = Object.keys(allTokens).length > 0;
  const hasActiveFilters =
    tier !== "all" || (defaultPlatform ? platform !== defaultPlatform : false);
  const showClearFiltersAction =
    !isLoading && !loadError && visibleTokens.length === 0 && Boolean(search) && hasActiveFilters;

  return (
    <TooltipProvider delayDuration={120} skipDelayDuration={0}>
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
                {isLoading ? "Loading tokens..." : `Tokens (${visibleTokens.length})`}
              </Badge>

              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger
                  disabled={isLoading || !hasLoadedData}
                  className="h-8 w-[150px] transition-colors hover:border-foreground/30 hover:bg-muted/40"
                >
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
                <SelectTrigger
                  disabled={isLoading || !hasLoadedData}
                  className="h-8 w-[130px] transition-colors hover:border-foreground/30 hover:bg-muted/40"
                >
                  <SelectValue placeholder="Tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All tiers</SelectItem>
                  <SelectItem value="core">Core</SelectItem>
                  <SelectItem value="semantic">Semantic</SelectItem>
                  <SelectItem value="component">Component</SelectItem>
                </SelectContent>
              </Select>

              <div className="relative w-[220px]">
                <Input
                  disabled={isLoading || !hasLoadedData}
                  className="h-8 pr-9 transition-colors hover:border-foreground/30 hover:bg-muted/40"
                  placeholder="Search tokens..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-1/2 right-1 h-6 w-6 -translate-y-1/2 rounded-full bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                    onClick={() => setSearch("")}
                    aria-label="Clear search"
                    title="Clear search"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>

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
            {isLoading && (
              <div className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">
                Loading token files...
              </div>
            )}

            {!isLoading && loadError && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                {loadError}
              </div>
            )}

            {!isLoading && !loadError && visibleTokens.length === 0 && (
              <div className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-3">
                  <span>No tokens match the selected filters.</span>
                  {showClearFiltersAction && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="ml-auto"
                      onClick={() => {
                        setTier("all");
                        if (defaultPlatform) setPlatform(defaultPlatform);
                      }}
                    >
                      Clear filters
                    </Button>
                  )}
                </div>
              </div>
            )}

            {!isLoading && !loadError && visibleTokens.length > 0 && (
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
            )}
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}
