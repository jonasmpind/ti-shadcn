import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Copy } from "lucide-react"

interface TokenCardProps {
  name: string
  value: string
  chain: string[]
}

export function TokenCard({ name, value, chain }: TokenCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="group inline-flex max-w-full items-start gap-1">
          <CardTitle className="text-sm break-all">
            {name}
          </CardTitle>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 shrink-0 opacity-0 transition-opacity group-hover:opacity-100 hover:opacity-100 focus-visible:opacity-100"
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
        <div className="font-mono break-all">
          {String(value)}
        </div>
      </CardContent>
    </Card>
  )
}
