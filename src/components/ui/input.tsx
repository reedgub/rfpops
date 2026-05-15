import * as React from "react";
import { cn } from "@/lib/utils/cn";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-foreground outline-none ring-0 transition placeholder:text-muted focus:border-gold/70",
        props.className
      )}
    />
  );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "min-h-28 w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-gold/70",
        props.className
      )}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-foreground outline-none transition focus:border-gold/70",
        props.className
      )}
    />
  );
}

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label {...props} className={cn("text-xs font-medium uppercase text-muted", className)} />;
}
