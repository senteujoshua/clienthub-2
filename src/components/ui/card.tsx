import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl bg-white border border-[#C9C1B1]/50 shadow-sm",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col gap-1 p-6 pb-4", className)}
      {...props}
    />
  );
}

export function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "text-lg font-semibold leading-none text-[#1B2632]",
        className
      )}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-sm text-[#C9C1B1]", className)}
      {...props}
    />
  );
}

export function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 pt-0", className)} {...props} />;
}

export function CardFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-center p-6 pt-0 border-t border-[#C9C1B1]/30 mt-4",
        className
      )}
      {...props}
    />
  );
}

// Stat Card
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  accent?: boolean;
  trend?: { value: number; label: string };
}

export function StatCard({
  title,
  value,
  icon,
  description,
  accent,
  trend,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden",
        accent && "bg-[#2C3B4D] border-[#2C3B4D]"
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <p
              className={cn(
                "text-sm font-medium",
                accent ? "text-[#C9C1B1]" : "text-[#C9C1B1]"
              )}
            >
              {title}
            </p>
            <p
              className={cn(
                "text-3xl font-bold",
                accent ? "text-[#FFB162]" : "text-[#1B2632]"
              )}
            >
              {value}
            </p>
            {description && (
              <p
                className={cn(
                  "text-xs",
                  accent ? "text-[#C9C1B1]" : "text-[#C9C1B1]"
                )}
              >
                {description}
              </p>
            )}
            {trend && (
              <p
                className={cn(
                  "text-xs font-medium mt-1",
                  trend.value >= 0 ? "text-green-600" : "text-[#A35139]"
                )}
              >
                {trend.value >= 0 ? "+" : ""}
                {trend.value}% {trend.label}
              </p>
            )}
          </div>
          <div
            className={cn(
              "flex items-center justify-center w-12 h-12 rounded-xl",
              accent ? "bg-[#1B2632]" : "bg-[#EEE9DF]"
            )}
          >
            <span
              className={cn(
                "w-6 h-6",
                accent ? "text-[#FFB162]" : "text-[#2C3B4D]"
              )}
            >
              {icon}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
