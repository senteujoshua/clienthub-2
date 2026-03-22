import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";

export function Table({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-auto rounded-xl border border-[#C9C1B1]/50">
      <table
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  );
}

export function TableHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={cn("bg-[#EEE9DF]/70 border-b border-[#C9C1B1]/50", className)}
      {...props}
    />
  );
}

export function TableBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody
      className={cn("divide-y divide-[#C9C1B1]/30 bg-white", className)}
      {...props}
    />
  );
}

export function TableRow({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn(
        "hover:bg-[#EEE9DF]/50 transition-colors duration-100",
        className
      )}
      {...props}
    />
  );
}

export function TableHead({
  className,
  sortKey,
  currentSort,
  sortOrder,
  onSort,
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement> & {
  sortKey?: string;
  currentSort?: string;
  sortOrder?: "asc" | "desc";
  onSort?: (key: string) => void;
}) {
  const isActive = sortKey && currentSort === sortKey;
  return (
    <th
      className={cn(
        "h-11 px-4 text-left text-xs font-semibold text-[#2C3B4D] uppercase tracking-wider whitespace-nowrap",
        sortKey && "cursor-pointer select-none hover:text-[#1B2632]",
        className
      )}
      onClick={() => sortKey && onSort?.(sortKey)}
      {...props}
    >
      {sortKey ? (
        <span className="flex items-center gap-1">
          {props.children}
          {isActive ? (
            sortOrder === "asc" ? (
              <ChevronUp className="h-3.5 w-3.5 text-[#FFB162]" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5 text-[#FFB162]" />
            )
          ) : (
            <ChevronsUpDown className="h-3.5 w-3.5 text-[#C9C1B1]" />
          )}
        </span>
      ) : (
        props.children
      )}
    </th>
  );
}

export function TableCell({
  className,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn("px-4 py-3 text-sm text-[#1B2632] align-middle", className)}
      {...props}
    />
  );
}

export function TableEmpty({ message = "No records found" }: { message?: string }) {
  return (
    <tr>
      <td colSpan={100} className="py-16 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#EEE9DF] flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-[#C9C1B1]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
          </div>
          <p className="text-sm text-[#C9C1B1]">{message}</p>
        </div>
      </td>
    </tr>
  );
}

// Pagination
interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
}: PaginationProps) {
  const start = Math.min((page - 1) * pageSize + 1, total);
  const end = Math.min(page * pageSize, total);

  const pages = React.useMemo(() => {
    const items: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) items.push(i);
    } else {
      items.push(1);
      if (page > 3) items.push("...");
      for (
        let i = Math.max(2, page - 1);
        i <= Math.min(totalPages - 1, page + 1);
        i++
      )
        items.push(i);
      if (page < totalPages - 2) items.push("...");
      items.push(totalPages);
    }
    return items;
  }, [page, totalPages]);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-[#C9C1B1]/30">
      <p className="text-xs text-[#C9C1B1]">
        Showing <span className="font-medium text-[#1B2632]">{start}</span> to{" "}
        <span className="font-medium text-[#1B2632]">{end}</span> of{" "}
        <span className="font-medium text-[#1B2632]">{total}</span> results
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="px-2 py-1 rounded-lg text-xs text-[#2C3B4D] hover:bg-[#EEE9DF] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          ← Prev
        </button>
        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`ellipsis-${i}`} className="px-2 text-[#C9C1B1] text-xs">
              ...
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={cn(
                "w-8 h-8 rounded-lg text-xs font-medium transition-colors",
                p === page
                  ? "bg-[#FFB162] text-[#1B2632]"
                  : "text-[#2C3B4D] hover:bg-[#EEE9DF]"
              )}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="px-2 py-1 rounded-lg text-xs text-[#2C3B4D] hover:bg-[#EEE9DF] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
