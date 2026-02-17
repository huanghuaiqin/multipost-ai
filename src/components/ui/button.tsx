import type { ButtonHTMLAttributes, DetailedHTMLProps } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "outline" | "ghost";

type ButtonSize = "default" | "sm" | "lg";

type ButtonProps = DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const baseClasses =
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ring-offset-background";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-sky-600 text-white shadow-sm hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-400",
  outline:
    "border border-sky-200 bg-white text-sky-700 hover:bg-sky-50 dark:border-sky-800 dark:bg-slate-950 dark:text-sky-200 dark:hover:bg-slate-900",
  ghost:
    "bg-transparent text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900",
};

const sizeClasses: Record<ButtonSize, string> = {
  default: "h-11 px-5",
  sm: "h-9 px-3 text-xs",
  lg: "h-12 px-7 text-base",
};

export function Button({
  className,
  variant = "primary",
  size = "default",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
      {...props}
    />
  );
}

