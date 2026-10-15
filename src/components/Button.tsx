"use client";

import React, { forwardRef } from "react";
import Link from "next/link";

export type ButtonVariant = "primary" | "secondary" | "outline" | "dark";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  isLoading?: boolean;
  href?: string;
  target?: string;
  rel?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-primary hover:bg-primary-hover !text-white border border-primary hover:border-primary-hover shadow-xs active:scale-[0.99]",
  secondary:
    "bg-bg hover:bg-primary !text-primary hover:!text-white border-2 border-primary shadow-xs transition-colors active:scale-[0.99]",
  outline:
    "bg-white hover:bg-bg text-dark hover:!text-primary border border-border hover:border-primary shadow-xs active:scale-[0.99]",
  dark:
    "bg-dark hover:bg-dark/90 !text-white border border-dark shadow-xs active:scale-[0.99]",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "py-2 px-3.5 text-xs",
  md: "py-2.5 px-5 text-xs sm:text-sm",
  lg: "py-3 px-6 text-xs sm:text-sm font-bold",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      fullWidth = false,
      isLoading = false,
      href,
      target,
      rel,
      icon,
      iconPosition = "left",
      className = "",
      disabled,
      type = "button",
      ...props
    },
    ref
  ) => {
    const baseClasses =
      "inline-flex items-center justify-center gap-2 font-bold rounded-none transition-all duration-200 cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed";
    const widthClass = fullWidth ? "w-full" : "";
    const combinedClasses = `${baseClasses} ${variantStyles[variant]} ${sizeStyles[size]} ${widthClass} ${className}`.trim();

    const content = (
      <>
        {isLoading && (
          <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin shrink-0" />
        )}
        {!isLoading && icon && iconPosition === "left" && (
          <span className="shrink-0">{icon}</span>
        )}
        <span>{children}</span>
        {!isLoading && icon && iconPosition === "right" && (
          <span className="shrink-0">{icon}</span>
        )}
      </>
    );

    if (href) {
      return (
        <Link
          href={href}
          target={target}
          rel={rel}
          className={combinedClasses}
          onClick={props.onClick as any}
        >
          {content}
        </Link>
      );
    }

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={combinedClasses}
        {...props}
      >
        {content}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
