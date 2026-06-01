import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-[#1E88FF] text-white hover:bg-[#1E88FF]/90 glow-secondary": variant === "primary", // Blue primary
            "bg-transparent border border-[rgba(255,255,255,0.08)] text-white hover:bg-white/5": variant === "outline",
            "bg-[#171717] text-white hover:bg-[#222222]": variant === "secondary",
            "hover:bg-white/10 text-white": variant === "ghost",
            "h-11 px-6 py-2": size === "default",
            "h-9 rounded-full px-4": size === "sm",
            "h-14 rounded-full px-8 text-base": size === "lg",
            "h-11 w-11": size === "icon",
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
