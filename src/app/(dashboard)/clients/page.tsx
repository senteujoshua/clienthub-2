"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Search, Trash2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmpty,
  Pagination,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { clientSchema, type ClientInput } from "@/lib/validations";
import type { Client, PaginatedResponse } from "@/types";
import { formatDate, getInitials } from "@/lib/utils";

export default function ClientsPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [clients, setClients] = useState<Client[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<"name" | "createdAt" | "email">(
    "createdAt"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [showCreate, setShowCreate] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      pageSize: "10",
      sortBy,
      sortOrder,
    });
    if (search) params.set("search", search);
    if (typeFilter !== "all") params.set("type", typeFilter);

    try {
      const res = await fetch(`/api/clients?${params}`);
      const data: PaginatedResponse<Client> = await res.json();
      setClients(data.data);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } finally {
      setLoading(false);
    }
  }, [page, sortBy, sortOrder, search, typeFilter]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [search, typeFilter]);

  function handleSort(key: string) {
    if (sortBy === key) {
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(key as "name" | "createdAt" | "email");
      setSortOrder("asc");
    }
    setPage(1);
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/clients/${deleteId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast({ type: "success", title: "Client deleted successfully" });
        fetchClients();
      } else {
        const json = await res.json();
        toast({
          type: "error",
          title: json.error ?? "Failed to delete client",
        });
      }
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2632]">Clients</h1>
          <p className="text-sm text-[#C9C1B1] mt-0.5">{total} total clients</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="w-4 h-4" />
          Add Client
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C9C1B1]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clients..."
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-[#C9C1B1] bg-white text-sm text-[#1B2632] placeholder:text-[#C9C1B1] focus:outline-none focus:ring-2 focus:ring-[#FFB162] focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "individual", "company"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                typeFilter === t
                  ? "bg-[#2C3B4D] text-white"
                  : "bg-white border border-[#C9C1B1] text-[#2C3B4D] hover:bg-[#EEE9DF]"
              }`}
            >
              {t === "all" ? "All" : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead
              sortKey="name"
              currentSort={sortBy}
              sortOrder={sortOrder}
              onSort={handleSort}
            >
              Name
            </TableHead>
            <TableHead
              sortKey="email"
              currentSort={sortBy}
              sortOrder={sortOrder}
              onSort={handleSort}
            >
              Email
            </TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Documents</TableHead>
            <TableHead
              sortKey="createdAt"
              currentSort={sortBy}
              sortOrder={sortOrder}
              onSort={handleSort}
            >
              Added
            </TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            [...Array(5)].map((_, i) => (
              <TableRow key={i}>
                {[...Array(7)].map((__, j) => (
                  <TableCell key={j}>
                    <div className="h-4 bg-[#C9C1B1]/20 rounded animate-pulse" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : clients.length === 0 ? (
            <TableEmpty message="No clients found" />
          ) : (
            clients.map((client) => (
              <TableRow
                key={client.id}
                className="cursor-pointer"
                onClick={() => router.push(`/clients/${client.id}`)}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#EEE9DF] flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-[#2C3B4D]">
                        {getInitials(client.name)}
                      </span>
                    </div>
                    <span className="font-medium text-[#1B2632]">
                      {client.name}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-[#C9C1B1]">{client.email}</TableCell>
                <TableCell className="text-[#C9C1B1]">{client.phone}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      client.type === "individual" ? "individual" : "company"
                    }
                  >
                    {client.type}
                  </Badge>
                </TableCell>
                <TableCell>{client._count?.documents ?? 0}</TableCell>
                <TableCell className="text-[#C9C1B1]">
                  {formatDate(client.createdAt)}
                </TableCell>
                <TableCell>
                  <div
                    className="flex items-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="danger-outline"
                      size="icon-sm"
                      onClick={() => setDeleteId(client.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                    <ChevronRight className="w-4 h-4 text-[#C9C1B1]" />
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          pageSize={10}
          onPageChange={setPage}
        />
      )}

      {/* Create client dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent size="lg">
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
            <DialogDescription>
              Fill in the client&apos;s details below.
            </DialogDescription>
          </DialogHeader>
          <CreateClientForm
            onSuccess={() => {
              setShowCreate(false);
              fetchClients();
              toast({ type: "success", title: "Client created successfully" });
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Delete Client</DialogTitle>
            <DialogDescription>
              This will permanently delete the client and all their documents.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button variant="danger" loading={deleting} onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CreateClientForm({ onSuccess }: { onSuccess: () => void }) {
  const { toast } = useToast();
  const [clientType, setClientType] = useState<"individual" | "company">(
    "individual"
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ClientInput>({
    resolver: zodResolver(clientSchema),
    defaultValues: { type: "individual" },
  });

  async function onSubmit(data: ClientInput) {
    const res = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) {
      toast({ type: "error", title: json.error ?? "Failed to create client" });
      return;
    }
    onSuccess();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Type selection */}
        <div className="col-span-1 sm:col-span-2">
          <label className="text-sm font-medium text-[#2C3B4D]">
            Client Type <span className="text-[#A35139]">*</span>
          </label>
          <div className="flex gap-3 mt-2">
            {(["individual", "company"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setClientType(t);
                  setValue("type", t);
                }}
                className={`flex-1 py-2.5 rounded-lg border-2 text-sm font-medium transition-colors ${
                  clientType === t
                    ? "border-[#FFB162] bg-[#FFB162]/10 text-[#1B2632]"
                    : "border-[#C9C1B1] bg-white text-[#C9C1B1] hover:border-[#2C3B4D] hover:text-[#2C3B4D]"
                }`}
              >
                {t === "individual" ? "Individual" : "Company"}
              </button>
            ))}
          </div>
          {errors.type && (
            <p className="text-xs text-[#A35139] mt-1">{errors.type.message}</p>
          )}
        </div>

        <Input
          label="Full Name"
          placeholder="John Doe"
          error={errors.name?.message}
          required
          {...register("name")}
        />
        <Input
          label="Email"
          type="email"
          placeholder="john@example.com"
          error={errors.email?.message}
          required
          {...register("email")}
        />
        <Input
          label="Phone"
          placeholder="+1 234 567 890"
          error={errors.phone?.message}
          required
          {...register("phone")}
        />

        {clientType === "individual" ? (
          <Input
            label="ID Number"
            placeholder="ID number (optional)"
            error={errors.idNumber?.message}
            {...register("idNumber")}
          />
        ) : (
          <>
            <Input
              label="Registration Number"
              placeholder="REG-12345 (optional)"
              error={errors.registrationNumber?.message}
              {...register("registrationNumber")}
            />
            <div className="col-span-1 sm:col-span-2">
              <Input
                label="Contact Person"
                placeholder="Jane Smith (optional)"
                error={errors.contactPerson?.message}
                {...register("contactPerson")}
              />
            </div>
          </>
        )}

        <div className="col-span-1 sm:col-span-2">
          <Textarea
            label="Address"
            placeholder="Full address"
            error={errors.address?.message}
            required
            {...register("address")}
          />
        </div>
        <div className="col-span-1 sm:col-span-2">
          <Textarea
            label="Notes"
            placeholder="Additional notes (optional)"
            {...register("notes")}
          />
        </div>
      </div>
      <DialogFooter>
        <Button type="submit" loading={isSubmitting}>
          Create Client
        </Button>
      </DialogFooter>
    </form>
  );
}
