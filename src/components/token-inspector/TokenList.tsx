import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import type { NormalizedToken } from "@/token-normalizer/types";
import { cn } from "@/lib/utils";

interface TokenListProps {
  tokens: NormalizedToken[];
  onSelect: (token: NormalizedToken) => void;
  selectedTokenKey?: string;
}

export function TokenList({
  tokens,
  onSelect,
  selectedTokenKey,
}: TokenListProps) {
  const [search, setSearch] = useState("");

  const filteredTokens = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return tokens;

    return tokens.filter((token) => {
      return (
        token.name.toLowerCase().includes(query) ||
        token.type.toLowerCase().includes(query)
      );
    });
  }, [search, tokens]);

  return (
    <aside className="flex min-h-0 flex-col border-r">
      <div className="border-b p-3">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search token..."
          className="h-8"
        />
      </div>

      <div className="app-scrollbar min-h-0 flex-1 overflow-y-auto p-2">
        <ul className="space-y-1">
          {filteredTokens.map((token) => (
            <li key={`${token.tokenSetId}:${token.name}`}>
              <button
                type="button"
                onClick={() => onSelect(token)}
                className={cn(
                  "w-full rounded-md px-3 py-2 text-left transition-colors hover:bg-muted",
                  selectedTokenKey === `${token.tokenSetId}:${token.name}` &&
                    "bg-muted",
                )}
              >
                <div className="truncate text-sm">{token.name}</div>
                <div className="text-xs text-muted-foreground">{token.type}</div>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
