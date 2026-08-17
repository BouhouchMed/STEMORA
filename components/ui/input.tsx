import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, hasError, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "focus-ring min-h-[52px] w-full rounded-2xl border bg-white px-4 text-base text-navy shadow-sm outline-none transition placeholder:text-navy/40",
        hasError ? "border-red-400" : "border-border hover:border-primary/30",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
