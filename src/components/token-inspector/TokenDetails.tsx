import type { NormalizedToken } from "@/token-normalizer/types";
import { formatJson } from "@/utils/formatJson";

interface TokenDetailsProps {
  token: NormalizedToken | null;
}

export function TokenDetails({ token }: TokenDetailsProps) {
  if (!token) {
    return (
      <section className="flex h-full items-center justify-center p-6 text-sm text-muted-foreground">
        Select a token to inspect.
      </section>
    );
  }

  return (
    <section className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)]">
      <div className="border-b p-4">
        <h2 className="mb-3 text-sm font-semibold">Metadata</h2>
        <dl className="grid gap-2 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-xs text-muted-foreground">Name</dt>
            <dd className="break-all">{token.name}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Type</dt>
            <dd>{token.type}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Source</dt>
            <dd>{token.source}</dd>
          </div>
        </dl>
      </div>

      <div className="grid min-h-0 gap-4 p-4 md:grid-cols-2">
        <div className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)] rounded-lg border">
          <h3 className="border-b px-3 py-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Raw
          </h3>
          <pre className="app-scrollbar overflow-auto p-3 font-mono text-xs leading-5">
            {formatJson(token.raw)}
          </pre>
        </div>

        <div className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)] rounded-lg border">
          <h3 className="border-b px-3 py-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Normalized
          </h3>
          <pre className="app-scrollbar overflow-auto p-3 font-mono text-xs leading-5">
            {formatJson(token)}
          </pre>
        </div>
      </div>
    </section>
  );
}
