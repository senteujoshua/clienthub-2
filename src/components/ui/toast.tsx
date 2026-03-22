"use client";

import * as React from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "info";

interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

interface ToastContextValue {
  toast: (params: Omit<ToastMessage, "id">) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastMessage[]>([]);

  const toast = React.useCallback((params: Omit<ToastMessage, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { ...params, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      <ToastPrimitive.Provider swipeDirection="right">
        {children}
        {toasts.map((t) => (
          <ToastItem key={t.id} {...t} onDismiss={() =>
            setToasts((prev) => prev.filter((x) => x.id !== t.id))
          } />
        ))}
        <ToastPrimitive.Viewport className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-[380px] max-w-[calc(100vw-2rem)] outline-none" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}

function ToastItem({
  type,
  title,
  description,
  onDismiss,
}: ToastMessage & { onDismiss: () => void }) {
  const icons = {
    success: <CheckCircle className="h-5 w-5 text-green-600" />,
    error: <AlertCircle className="h-5 w-5 text-[#A35139]" />,
    info: <Info className="h-5 w-5 text-[#2C3B4D]" />,
  };

  const borders = {
    success: "border-l-4 border-l-green-500",
    error: "border-l-4 border-l-[#A35139]",
    info: "border-l-4 border-l-[#FFB162]",
  };

  return (
    <ToastPrimitive.Root
      open
      onOpenChange={(open) => !open && onDismiss()}
      className={cn(
        "flex items-start gap-3 bg-white rounded-xl p-4 shadow-lg border border-[#C9C1B1]/30",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-right-full",
        borders[type]
      )}
    >
      <span className="shrink-0 mt-0.5">{icons[type]}</span>
      <div className="flex-1 min-w-0">
        <ToastPrimitive.Title className="text-sm font-semibold text-[#1B2632]">
          {title}
        </ToastPrimitive.Title>
        {description && (
          <ToastPrimitive.Description className="text-xs text-[#C9C1B1] mt-0.5">
            {description}
          </ToastPrimitive.Description>
        )}
      </div>
      <ToastPrimitive.Close
        onClick={onDismiss}
        className="shrink-0 rounded p-0.5 text-[#C9C1B1] hover:text-[#1B2632] hover:bg-[#EEE9DF]"
      >
        <X className="h-4 w-4" />
      </ToastPrimitive.Close>
    </ToastPrimitive.Root>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be inside ToastProvider");
  return ctx;
}
