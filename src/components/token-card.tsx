import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy } from "lucide-react";

interface TokenCardProps {
  name: string;
  value: string;
  chain: string[];
}

export function TokenCard({ name, value, chain }: TokenCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="group inline-flex w-fit items-start gap-2 text-sm">
          <CardTitle className="break-all">{name}</CardTitle>
          <Button
            size="inline-icon"
            variant="ghost"
            className="relative isolate shrink-0 overflow-visible opacity-0 transition-opacity group-hover:opacity-100 hover:opacity-100 focus-visible:opacity-100 hover:bg-transparent focus-visible:bg-transparent [&_svg]:relative [&_svg]:z-10 before:absolute before:inset-0 before:content-[''] before:rounded-sm before:bg-accent before:opacity-0 before:transition-[transform,opacity] before:duration-150 before:ease-out hover:before:scale-[1.35] hover:before:opacity-100 focus-visible:before:scale-[1.35] focus-visible:before:opacity-100 after:absolute after:-inset-1 after:content-['']"
            onClick={() => navigator.clipboard.writeText(name)}
            aria-label="Copy token name"
            title="Copy token name"
          >
            <Copy />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-xs">
        {chain.map((alias: string, i: number) => (
          <div key={i} className="text-muted-foreground break-all">
            → {alias}
          </div>
        ))}
        <div className="font-mono break-all">{String(value)}</div>
      </CardContent>
    </Card>
  );
}
