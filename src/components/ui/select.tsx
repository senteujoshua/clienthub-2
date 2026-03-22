"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectProps {
  label?: string;
  error?: string;
  placeholder?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  disabled?: boolean;
  required?: boolean;
}

export function Select({
  label,
  error,
  placeholder,
  value,
  onValueChange,
  children,
  disabled,
  required,
}: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-[#2C3B4D]">
          {label}
          {required && <span className="text-[#A35139] ml-1">*</span>}
        </label>
      )}
      <SelectPrimitive.Root
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
      >
        <SelectPrimitive.Trigger
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-lg border border-[#C9C1B1] bg-white px-3 py-2 text-sm text-[#1B2632]",
            "focus:outline-none focus:ring-2 focus:ring-[#FFB162] focus:border-transparent",
            "disabled:bg-[#EEE9DF] disabled:cursor-not-allowed disabled:opacity-70",
            "transition-all duration-150",
            error && "border-[#A35139]",
            !value && "text-[#C9C1B1]"
          )}
        >
          <SelectPrimitive.Value placeholder={placeholder} />
          <SelectPrimitive.Icon>
            <ChevronDown className="h-4 w-4 text-[#C9C1B1]" />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>

        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            className="z-50 min-w-[8rem] overflow-hidden rounded-lg border border-[#C9C1B1] bg-white shadow-lg animate-in fade-in-0 zoom-in-95"
            position="popper"
            sideOffset={4}
          >
            <SelectPrimitive.Viewport className="p-1">
              {children}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
      {error && <p className="text-xs text-[#A35139]">{error}</p>}
    </div>
  );
}

export function SelectItem({
  value,
  children,
  className,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <SelectPrimitive.Item
      value={value}
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-md px-8 py-2 text-sm text-[#1B2632]",
        "focus:bg-[#EEE9DF] focus:outline-none",
        "data-[highlighted]:bg-[#EEE9DF]",
        className
      )}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check className="h-4 w-4 text-[#FFB162]" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}
