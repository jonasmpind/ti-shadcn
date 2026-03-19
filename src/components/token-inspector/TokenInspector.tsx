import { useEffect, useState } from "react";
import type { NormalizedToken } from "@/token-normalizer/types";
import { TokenList } from "@/components/token-inspector/TokenList";
import { TokenDetails } from "@/components/token-inspector/TokenDetails";

interface TokenInspectorProps {
  tokens: NormalizedToken[];
}

export function TokenInspector({ tokens }: TokenInspectorProps) {
  const [selectedToken, setSelectedToken] = useState<NormalizedToken | null>(
    tokens[0] ?? null,
  );

  useEffect(() => {
    if (!tokens.length) {
      setSelectedToken(null);
      return;
    }

    if (!selectedToken) {
      setSelectedToken(tokens[0]);
      return;
    }

    const stillExists = tokens.some(
      (token) =>
        token.name === selectedToken.name &&
        token.tokenSetId === selectedToken.tokenSetId,
    );

    if (!stillExists) {
      setSelectedToken(tokens[0]);
    }
  }, [selectedToken, tokens]);

  return (
    <div className="grid h-full min-h-0 rounded-lg border bg-card md:grid-cols-[320px_minmax(0,1fr)]">
      <TokenList
        tokens={tokens}
        onSelect={setSelectedToken}
        selectedTokenKey={
          selectedToken
            ? `${selectedToken.tokenSetId}:${selectedToken.name}`
            : undefined
        }
      />
      <TokenDetails token={selectedToken} />
    </div>
  );
}
