import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

type BadgeVariant =
  | "default"
  | "secondary"
  | "success"
  | "warning"
  | "danger"
  | "outline";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "border-transparent bg-foreground text-background",
  secondary: "border-transparent bg-secondary text-secondary-foreground",
  success:
    "border-transparent bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  warning:
    "border-transparent bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  danger:
    "border-transparent bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  outline: "border-current text-foreground",
};

export function Badge({
  variant = "default",
  className,
  ...props
}: Readonly<BadgeProps>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}
