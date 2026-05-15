import * as React from "react";
import { cn } from "@/lib/utils/cn";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: "neutral" | "bid" | "maybe" | "nobid" | "gold" | "blue";
};

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold",
        tone === "neutral" && "border-line bg-surface text-muted",
        tone === "bid" && "border-bid/40 bg-bid/14 text-green-200",
        tone === "maybe" && "border-maybe/40 bg-maybe/14 text-amber-200",
        tone === "nobid" && "border-nobid/40 bg-nobid/14 text-red-200",
        tone === "gold" && "border-gold/40 bg-gold/14 text-gold",
        tone === "blue" && "border-sky-500/40 bg-sky-500/14 text-sky-200",
        className
      )}
      {...props}
    />
  );
}
