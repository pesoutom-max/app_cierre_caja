"use client"
import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface InputWithIconProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon: React.ReactNode;
  containerClassName?: string;
}

const InputWithIcon = React.forwardRef<HTMLInputElement, InputWithIconProps>(
  ({ className, label, icon, id, containerClassName, ...props }, ref) => {
    const inputId = id || `input-${label.toLowerCase().replace(/\s/g, "-")}`;
    return (
      <div className={cn("space-y-2", containerClassName)}>
        <Label htmlFor={inputId} className="flex items-center gap-2 text-sm font-medium text-foreground/80">
          {icon}
          {label}
        </Label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground pointer-events-none">
            $
          </span>
          <Input
            id={inputId}
            type="number"
            className={cn("pl-7", className)}
            ref={ref}
            min="0"
            step="1"
            {...props}
          />
        </div>
      </div>
    );
  }
);
InputWithIcon.displayName = "InputWithIcon";

export { InputWithIcon };
