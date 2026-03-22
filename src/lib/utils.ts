import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, isAfter, addDays } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  return format(new Date(date), "dd MMM yyyy");
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "—";
  return format(new Date(date), "dd MMM yyyy, HH:mm");
}

export function formatRelativeTime(
  date: Date | string | null | undefined
): string {
  if (!date) return "—";
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getExpiryStatus(
  expiryDate: Date | string | null | undefined
): "valid" | "expiring-soon" | "expired" | "none" {
  if (!expiryDate) return "none";
  const date = new Date(expiryDate);
  const now = new Date();
  if (!isAfter(date, now)) return "expired";
  if (!isAfter(date, addDays(now, 30))) return "expiring-soon";
  return "valid";
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength)}…`;
}

export function getMimeTypeIcon(mimeType: string): string {
  if (mimeType === "application/pdf") return "pdf";
  if (mimeType.startsWith("image/")) return "image";
  if (
    mimeType.includes("word") ||
    mimeType === "application/msword"
  )
    return "word";
  if (mimeType.includes("excel") || mimeType.includes("spreadsheet"))
    return "excel";
  return "file";
}

export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export function apiSuccess<T>(data: T): ApiResponse<T> {
  return { success: true, data };
}

export function apiError(error: string): ApiResponse<never> {
  return { success: false, error };
}
