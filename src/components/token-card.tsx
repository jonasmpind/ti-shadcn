import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Check, Copy } from "lucide-react";

interface TokenCardProps {
  name: string;
  value: string;
  chain: string[];
}

interface CopyButtonProps {
  textToCopy: string;
  ariaLabel: string;
}

function CopyActionButton({ textToCopy, ariaLabel }: CopyButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const pressedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copiedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (pressedTimeoutRef.current) clearTimeout(pressedTimeoutRef.current);
      if (copiedTimeoutRef.current) clearTimeout(copiedTimeoutRef.current);
    },
    [],
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy);
    setIsPressed(true);
    setIsCopied(true);

    if (pressedTimeoutRef.current) clearTimeout(pressedTimeoutRef.current);
    pressedTimeoutRef.current = setTimeout(() => setIsPressed(false), 160);

    if (copiedTimeoutRef.current) clearTimeout(copiedTimeoutRef.current);
    copiedTimeoutRef.current = setTimeout(() => setIsCopied(false), 1000);
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size="inline-icon"
          variant="ghost"
          className={`relative isolate shrink-0 overflow-visible opacity-0 transition-[opacity,transform] duration-150 group-hover:opacity-100 hover:opacity-100 focus-visible:opacity-100 hover:bg-transparent focus-visible:bg-transparent active:scale-95 [&_svg]:relative [&_svg]:z-10 before:absolute before:inset-0 before:content-[''] before:rounded-sm before:bg-accent before:opacity-0 before:transition-[transform,opacity] before:duration-150 before:ease-out hover:before:scale-[1.35] hover:before:opacity-100 focus-visible:before:scale-[1.35] focus-visible:before:opacity-100 active:before:scale-[1.2] active:before:opacity-100 after:absolute after:-inset-1 after:content-[''] ${isPressed ? "opacity-100 before:scale-[1.2] before:opacity-100 scale-95" : ""}`}
          onClick={handleCopy}
          aria-label={ariaLabel}
        >
          {isCopied ? <Check /> : <Copy />}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top">Copy</TooltipContent>
    </Tooltip>
  );
}

export function TokenCard({ name, value, chain }: TokenCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="group inline-flex items-start gap-2 text-sm">
          <CardTitle className="break-all">{name}</CardTitle>
          <CopyActionButton textToCopy={name} ariaLabel="Copy token name" />
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-xs">
        {chain.map((alias: string, i: number) => (
          <div key={i} className="group flex w-fit items-start gap-2">
            <div className="text-muted-foreground break-all">→ {alias}</div>
            <CopyActionButton
              textToCopy={alias}
              ariaLabel={`Copy token alias ${i + 1}`}
            />
          </div>
        ))}
        <div className="group flex w-fit items-start gap-2">
          <div className="font-mono break-all">{String(value)}</div>
          <CopyActionButton textToCopy={String(value)} ariaLabel="Copy token value" />
        </div>
      </CardContent>
    </Card>
  );
}
