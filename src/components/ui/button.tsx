import * as React from "react";
import { cn } from "@/lib/utils/cn";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "icon";
};

export function Button({ className, variant = "primary", size = "md", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md border font-medium transition focus:outline-none focus:ring-2 focus:ring-gold/60 disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "border-gold/40 bg-gold px-4 py-2 text-sm text-black hover:bg-[#d7b969]",
        variant === "secondary" && "border-line bg-panel px-4 py-2 text-sm text-foreground hover:bg-slate-800",
        variant === "ghost" && "border-transparent bg-transparent px-3 py-2 text-sm text-muted hover:text-foreground",
        variant === "danger" && "border-nobid/40 bg-nobid/15 px-4 py-2 text-sm text-red-100 hover:bg-nobid/25",
        size === "sm" && "px-3 py-1.5 text-xs",
        size === "icon" && "h-9 w-9 p-0",
        className
      )}
      {...props}
    />
  );
}
