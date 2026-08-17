import * as React from "react";
import { cn } from "@/lib/utils";

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, ...props }, ref) => (
    <input
      type="checkbox"
      ref={ref}
      className={cn(
        "focus-ring h-5 w-5 rounded border-border text-primary accent-[#257ED9]",
        className
      )}
      {...props}
    />
  )
);
Checkbox.displayName = "Checkbox";
