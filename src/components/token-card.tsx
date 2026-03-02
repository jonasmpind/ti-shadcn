import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface TokenCardProps {
  name: string
  value: string
  chain: string[]
}

export function TokenCard({ name, value, chain }: TokenCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm break-all">
          {name}
        </CardTitle>
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
        <Button
          size="sm"
          variant="outline"
          onClick={() => navigator.clipboard.writeText(name)}
        >
          Copy name
        </Button>
      </CardContent>
    </Card>
  )
}
