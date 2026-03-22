import * as React from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, icon, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-[#2C3B4D]"
          >
            {label}
            {props.required && (
              <span className="text-[#A35139] ml-1">*</span>
            )}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C9C1B1]">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full h-10 rounded-lg border border-[#C9C1B1] bg-white px-3 py-2 text-sm text-[#1B2632] placeholder:text-[#C9C1B1]",
              "focus:outline-none focus:ring-2 focus:ring-[#FFB162] focus:border-transparent",
              "disabled:bg-[#EEE9DF] disabled:cursor-not-allowed disabled:opacity-70",
              "transition-all duration-150",
              error && "border-[#A35139] focus:ring-[#A35139]",
              icon && "pl-10",
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="text-xs text-[#A35139] flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-3.5 h-3.5 shrink-0"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}
        {hint && !error && (
          <p className="text-xs text-[#C9C1B1]">{hint}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-[#2C3B4D]"
          >
            {label}
            {props.required && (
              <span className="text-[#A35139] ml-1">*</span>
            )}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            "w-full min-h-[80px] rounded-lg border border-[#C9C1B1] bg-white px-3 py-2 text-sm text-[#1B2632] placeholder:text-[#C9C1B1] resize-y",
            "focus:outline-none focus:ring-2 focus:ring-[#FFB162] focus:border-transparent",
            "disabled:bg-[#EEE9DF] disabled:cursor-not-allowed disabled:opacity-70",
            "transition-all duration-150",
            error && "border-[#A35139] focus:ring-[#A35139]",
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-xs text-[#A35139]">{error}</p>
        )}
        {hint && !error && (
          <p className="text-xs text-[#C9C1B1]">{hint}</p>
        )}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
