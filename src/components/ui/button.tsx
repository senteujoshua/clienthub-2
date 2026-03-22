"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-150 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        primary:
          "bg-[#FFB162] text-[#1B2632] hover:bg-[#e09640] shadow-sm hover:shadow-md active:scale-[0.98]",
        secondary:
          "bg-[#2C3B4D] text-[#EEE9DF] hover:bg-[#1B2632] shadow-sm hover:shadow-md active:scale-[0.98]",
        outline:
          "border-2 border-[#C9C1B1] bg-transparent text-[#2C3B4D] hover:bg-[#EEE9DF] hover:border-[#2C3B4D] active:scale-[0.98]",
        ghost:
          "bg-transparent text-[#2C3B4D] hover:bg-[#EEE9DF] active:scale-[0.98]",
        danger:
          "bg-[#A35139] text-white hover:bg-[#8a3f2e] shadow-sm hover:shadow-md active:scale-[0.98]",
        "danger-outline":
          "border-2 border-[#A35139] bg-transparent text-[#A35139] hover:bg-[#A35139] hover:text-white active:scale-[0.98]",
        link: "text-[#FFB162] underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-9 px-4 text-sm",
        lg: "h-11 px-6 text-base",
        xl: "h-12 px-8 text-base",
        icon: "h-9 w-9 p-0",
        "icon-sm": "h-7 w-7 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, asChild = false, loading, children, ...props },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            {children}
          </>
        ) : (
          children
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";
