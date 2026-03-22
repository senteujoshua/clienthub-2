import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
  {
    variants: {
      variant: {
        default: "bg-[#2C3B4D] text-[#EEE9DF]",
        individual: "bg-[#EEE9DF] text-[#2C3B4D] border border-[#C9C1B1]",
        company: "bg-[#2C3B4D] text-[#FFB162]",
        success: "bg-green-100 text-green-800",
        warning: "bg-amber-100 text-amber-800",
        danger: "bg-red-100 text-[#A35139]",
        accent: "bg-[#FFB162] text-[#1B2632]",
        muted: "bg-[#EEE9DF] text-[#C9C1B1] border border-[#C9C1B1]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
