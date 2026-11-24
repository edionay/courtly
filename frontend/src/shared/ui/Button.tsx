import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "secondary" | "danger";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variantStyles: Record<ButtonVariant, string> = {
  primary: "text-white bg-primary hover:bg-primary/95",
  secondary: "text-primary bg-white border border-primary hover:bg-primary/5",
  danger: "text-danger bg-white border border-danger hover:bg-danger/5",
};

export function Button({
  className = "",
  type = "button",
  variant = "primary",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`inline-flex items-center justify-center min-h-[44px] px-4 rounded-xl text-sm font-semibold text-center no-underline cursor-pointer transition-colors disabled:cursor-not-allowed disabled:opacity-55 ${variantStyles[variant]} ${className}`.trim()}
      {...props}
    />
  );
}
